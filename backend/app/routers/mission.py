import os
import json
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
import numpy as np
import rasterio

from app.db import get_db
from app.models import Region, TerrainFeature, MissionRoute
from app.analysis.pathfinding import run_astar, compute_route_statistics
from app.analysis.features import compute_horn_slope
from app.schemas import (
    LandingScreeningRequest,
    LandingScreeningResponse,
    RoutePlanRequest,
    RouteOptionItem,
    RoutePlanResponse,
)

logger = logging.getLogger("astra-x.mission")
router = APIRouter(tags=["Mission Analysis"])


@router.post("/api/mission/screening", response_model=LandingScreeningResponse)
def run_landing_screening(req: LandingScreeningRequest, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == req.region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region {req.region_id} not found.")

    features = db.query(TerrainFeature).filter(TerrainFeature.region_id == req.region_id).all()
    if not features:
        raise HTTPException(status_code=404, detail="No terrain features available for landing screening.")

    total_cells = len(features)
    slope_pass = 0
    rough_pass = 0
    elev_pass = 0
    both_pass = 0
    flagged_hazards = []

    for f in features:
        s_ok = f.slope_deg is not None and f.slope_deg <= req.max_slope_deg
        r_ok = f.roughness_m is not None and f.roughness_m <= req.max_roughness_m
        e_ok = True
        if req.min_elevation_m is not None and (f.elevation_relative is None or f.elevation_relative < req.min_elevation_m):
            e_ok = False
        if req.max_elevation_m is not None and (f.elevation_relative is None or f.elevation_relative > req.max_elevation_m):
            e_ok = False

        if s_ok:
            slope_pass += 1
        if r_ok:
            rough_pass += 1
        if e_ok:
            elev_pass += 1
        if s_ok and r_ok and e_ok:
            both_pass += 1

        if not s_ok or not r_ok:
            if len(flagged_hazards) < 20:
                flagged_hazards.append({
                    "lat": f.lat,
                    "lon": f.lon,
                    "slope_deg": round(f.slope_deg, 2) if f.slope_deg is not None else None,
                    "roughness_m": round(f.roughness_m, 2) if f.roughness_m is not None else None,
                    "hazard": "Steep slope" if not s_ok else "High roughness"
                })

    pass_fraction = round(both_pass / total_cells, 4) if total_cells > 0 else 0.0
    suitability_score = round(pass_fraction * 100.0, 1)

    return LandingScreeningResponse(
        region_id=region.id,
        region_name=region.name,
        planet=region.planet.name if region.planet else "Unknown",
        total_cells=total_cells,
        passing_cells=both_pass,
        pass_fraction=pass_fraction,
        mission_suitability_score=suitability_score,
        criteria_breakdown={
            "max_slope_deg": req.max_slope_deg,
            "max_roughness_m": req.max_roughness_m,
            "slope_pass_count": slope_pass,
            "slope_pass_fraction": round(slope_pass / total_cells, 3),
            "roughness_pass_count": rough_pass,
            "roughness_pass_fraction": round(rough_pass / total_cells, 3),
            "elevation_pass_count": elev_pass,
        },
        flagged_hazards=flagged_hazards,
        environmental_factors={
            "illumination": "Not assessed — dataset not ingested",
            "radiation": "Not assessed — dataset not ingested",
            "thermal": "Not assessed — dataset not ingested"
        },
        disclaimer_banner="Preliminary screening for scientific decision support. Not certified landing or habitation safety."
    )


@router.post("/api/mission/route", response_model=RoutePlanResponse)
def plan_rover_route(req: RoutePlanRequest, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == req.region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region {req.region_id} not found.")

    dataset = region.source_dataset
    if not dataset or not dataset.local_path or not os.path.exists(dataset.local_path):
        raise HTTPException(status_code=404, detail="No local raster data available for rover pathfinding.")

    with rasterio.open(dataset.local_path) as src:
        dem = src.read(1)
        nodata = src.nodata
        if nodata is not None:
            dem = np.where(dem == nodata, np.nan, dem)

        valid_dem = ~np.isnan(dem)
        filled_dem = np.where(valid_dem, dem, np.nanmedian(dem))
        slope_grid = compute_horn_slope(filled_dem, cell_size_m=500.0)

        # Transform start & goal lon/lat to row/col
        start_lon, start_lat = req.start_coords[0], req.start_coords[1]
        goal_lon, goal_lat = req.goal_coords[0], req.goal_coords[1]

        start_r, start_c = rasterio.transform.rowcol(src.transform, start_lon, start_lat)
        goal_r, goal_c = rasterio.transform.rowcol(src.transform, goal_lon, goal_lat)

        modes = ["shortest", "balanced", "safest"]
        routes_output: List[RouteOptionItem] = []

        for mode in modes:
            path_cells, _ = run_astar(
                dem=filled_dem,
                slope_grid=slope_grid,
                cell_size_m=500.0,
                start=(start_r, start_c),
                goal=(goal_r, goal_c),
                max_slope_deg=req.max_slope_deg or 25.0,
                mode=mode
            )

            if path_cells:
                stats = compute_route_statistics(path_cells, filled_dem, slope_grid, 500.0, src.transform)

                route_entry = MissionRoute(
                    region_id=region.id,
                    name=f"{region.name} - {mode.title()} Route",
                    mode=mode,
                    path_geojson=json.dumps({"type": "LineString", "coordinates": stats["coordinates"]}),
                    elevation_profile_json=json.dumps(stats["profile"]),
                    length_m=stats["length_m"],
                    total_ascent_m=stats["total_ascent_m"],
                    total_descent_m=stats["total_descent_m"],
                    max_slope_deg=stats["max_slope_deg"],
                    mean_slope_deg=stats["mean_slope_deg"],
                    difficulty_score=stats["difficulty_score"]
                )
                db.add(route_entry)
                db.flush()

                routes_output.append(
                    RouteOptionItem(
                        route_id=route_entry.id,
                        name=route_entry.name,
                        mode=mode,
                        coordinates=stats["coordinates"],
                        elevation_profile=stats["profile"],
                        length_m=stats["length_m"],
                        total_ascent_m=stats["total_ascent_m"],
                        total_descent_m=stats["total_descent_m"],
                        max_slope_deg=stats["max_slope_deg"],
                        mean_slope_deg=stats["mean_slope_deg"],
                        difficulty_score=stats["difficulty_score"]
                    )
                )

        db.commit()

        impassable_count = int(np.sum(slope_grid > (req.max_slope_deg or 25.0)))

        if not routes_output:
            return RoutePlanResponse(
                status="unreachable",
                message=f"No traversable path found between {req.start_coords} and {req.goal_coords}. Path is obstructed by steep terrain (> {req.max_slope_deg}°).",
                routes=[],
                impassable_zones_count=impassable_count
            )

        return RoutePlanResponse(
            status="success",
            message=f"Successfully computed {len(routes_output)} alternative routes across {region.name}.",
            routes=routes_output,
            impassable_zones_count=impassable_count
        )


@router.get("/api/mission/routes/{region_id}", response_model=List[RouteOptionItem])
def get_region_routes(region_id: int, db: Session = Depends(get_db)):
    routes = (
        db.query(MissionRoute)
        .filter(MissionRoute.region_id == region_id)
        .order_by(desc(MissionRoute.created_at))
        .limit(10)
        .all()
    )
    result = []
    for r in routes:
        coords = json.loads(r.path_geojson).get("coordinates", []) if r.path_geojson else []
        prof = json.loads(r.elevation_profile_json) if r.elevation_profile_json else []
        result.append(
            RouteOptionItem(
                route_id=r.id,
                name=r.name,
                mode=r.mode,
                coordinates=coords,
                elevation_profile=prof,
                length_m=r.length_m,
                total_ascent_m=r.total_ascent_m,
                total_descent_m=r.total_descent_m,
                max_slope_deg=r.max_slope_deg,
                mean_slope_deg=r.mean_slope_deg,
                difficulty_score=r.difficulty_score
            )
        )
    return result

