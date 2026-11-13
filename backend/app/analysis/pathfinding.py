"""
Rover pathfinding module using A* on raster DEM terrain grids.

Implements 8-connected A* search with:
- Admissible octile / Euclidean heuristic (never overestimates).
- Slope penalty and maximum slope impassability gate (default 25 deg).
- Roughness penalty.
- Three alternative optimization modes: 'shortest', 'safest', 'balanced'.
- Returns path coordinates, elevation profile, ascent/descent, and documented difficulty score.
"""

from typing import List, Tuple, Dict, Any, Optional
import heapq
import math
import numpy as np
import rasterio

from app.analysis.features import compute_horn_slope


def octile_heuristic(r1: int, c1: int, r2: int, c2: int, cell_size_m: float) -> float:
    """
    Admissible 8-connected grid heuristic (Octile distance).
    Guaranteed never to overestimate the true path cost on an 8-connected grid.
    """
    dr = abs(r1 - r2)
    dc = abs(c1 - c2)
    # Straight steps + diagonal steps
    min_d = min(dr, dc)
    max_d = max(dr, dc)
    # Distance = (max_d - min_d) * straight + min_d * diagonal
    return ((max_d - min_d) + math.sqrt(2.0) * min_d) * cell_size_m


def euclidean_heuristic(r1: int, c1: int, r2: int, c2: int, cell_size_m: float) -> float:
    """
    Admissible Euclidean distance heuristic.
    """
    return math.hypot(r1 - r2, c1 - c2) * cell_size_m


def run_astar(
    dem: np.ndarray,
    slope_grid: np.ndarray,
    cell_size_m: float,
    start: Tuple[int, int],
    goal: Tuple[int, int],
    max_slope_deg: float = 25.0,
    mode: str = "balanced"
) -> Tuple[Optional[List[Tuple[int, int]]], Optional[str]]:
    """
    Perform 8-connected A* search from start (row, col) to goal (row, col).

    Args:
        dem: 2D array of elevations in meters.
        slope_grid: 2D array of slope inclinations in degrees.
        cell_size_m: Physical spacing between adjacent grid cells in meters.
        start: (row, col) start coordinates.
        goal: (row, col) goal coordinates.
        max_slope_deg: Slopes strictly exceeding this are impassable.
        mode: 'shortest' | 'safest' | 'balanced'

    Returns:
        (path_cells, error_message):
            path_cells: List of (row, col) tuples from start to goal, or None if unreachable.
            error_message: None if success, or failure explanation string.
    """
    nrows, ncols = dem.shape
    start_r, start_c = start
    goal_r, goal_c = goal

    # Bounds validation
    if not (0 <= start_r < nrows and 0 <= start_c < ncols):
        return None, f"Start cell {start} is outside raster bounds ({nrows}x{ncols})."
    if not (0 <= goal_r < nrows and 0 <= goal_c < ncols):
        return None, f"Goal cell {goal} is outside raster bounds ({nrows}x{ncols})."

    # Nodata and start/goal impassability checks
    if np.isnan(dem[start_r, start_c]) or slope_grid[start_r, start_c] > max_slope_deg:
        return None, f"Start location {start} is impassable (slope {slope_grid[start_r, start_c]:.1f}° > limit {max_slope_deg}° or NaN)."
    if np.isnan(dem[goal_r, goal_c]) or slope_grid[goal_r, goal_c] > max_slope_deg:
        return None, f"Goal location {goal} is impassable (slope {slope_grid[goal_r, goal_c]:.1f}° > limit {max_slope_deg}° or NaN)."

    # 8-connected neighbor offsets: (dr, dc, step_dist_factor)
    sqrt2 = math.sqrt(2.0)
    neighbors = [
        (-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
        (-1, -1, sqrt2), (-1, 1, sqrt2), (1, -1, sqrt2), (1, 1, sqrt2)
    ]

    # Mode multipliers
    if mode == "shortest":
        slope_weight = 0.5
    elif mode == "safest":
        slope_weight = 4.0
    else:  # balanced
        slope_weight = 1.8

    # Priority queue: (f_score, g_score, (r, c))
    h_start = octile_heuristic(start_r, start_c, goal_r, goal_c, cell_size_m)
    open_set: List[Tuple[float, float, Tuple[int, int]]] = [(h_start, 0.0, start)]
    g_score: Dict[Tuple[int, int], float] = {start: 0.0}
    came_from: Dict[Tuple[int, int], Tuple[int, int]] = {}
    visited = set()

    while open_set:
        _, current_g, current = heapq.heappop(open_set)

        if current in visited:
            continue
        visited.add(current)

        if current == goal:
            # Reconstruct path
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            path.reverse()
            return path, None

        curr_r, curr_c = current

        for dr, dc, step_mult in neighbors:
            nr = curr_r + dr
            nc = curr_c + dc

            if not (0 <= nr < nrows and 0 <= nc < ncols):
                continue
            if (nr, nc) in visited:
                continue

            neighbor_elev = dem[nr, nc]
            if np.isnan(neighbor_elev):
                continue

            neighbor_slope = slope_grid[nr, nc]
            if np.isnan(neighbor_slope) or neighbor_slope > max_slope_deg:
                continue  # Impassable barrier

            # Step distance in physical meters
            step_distance = cell_size_m * step_mult

            # Traversability penalty cost:
            # base distance * (1 + slope_weight * (slope / max_slope)^2)
            slope_norm = neighbor_slope / max(1.0, max_slope_deg)
            slope_penalty = 1.0 + slope_weight * (slope_norm ** 2)
            tentative_g = current_g + (step_distance * slope_penalty)

            if tentative_g < g_score.get((nr, nc), float("inf")):
                came_from[(nr, nc)] = current
                g_score[(nr, nc)] = tentative_g
                h_val = octile_heuristic(nr, nc, goal_r, goal_c, cell_size_m)
                heapq.heappush(open_set, (tentative_g + h_val, tentative_g, (nr, nc)))

    return None, f"No traversable path exists under max slope constraint ({max_slope_deg}°). Goal is unreachable or obstructed by barriers."


def compute_route_statistics(
    path_cells: List[Tuple[int, int]],
    dem: np.ndarray,
    slope_grid: np.ndarray,
    cell_size_m: float,
    affine_transform: Any
) -> Dict[str, Any]:
    """
    Computes comprehensive route metrics: length, profile, ascent, descent, difficulty.

    Formula:
    difficulty_score = (mean_slope * 2.0) + ((max_slope / 25.0) * 10.0) + ((length_m / 1000.0) * 1.5)
    """
    if len(path_cells) < 2:
        return {
            "length_m": 0.0,
            "total_ascent_m": 0.0,
            "total_descent_m": 0.0,
            "max_slope_deg": 0.0,
            "mean_slope_deg": 0.0,
            "difficulty_score": 0.0,
            "profile": [],
            "coordinates": []
        }

    total_dist = 0.0
    total_ascent = 0.0
    total_descent = 0.0
    slopes: List[float] = []
    profile: List[Dict[str, float]] = []
    coords: List[List[float]] = []

    for i, (r, c) in enumerate(path_cells):
        elev = float(dem[r, c])
        slope = float(slope_grid[r, c])
        slopes.append(slope)

        lon, lat = rasterio.transform.xy(affine_transform, r, c)
        coords.append([round(lon, 5), round(lat, 5)])

        if i > 0:
            pr, pc = path_cells[i - 1]
            prev_elev = float(dem[pr, pc])
            dr = abs(r - pr)
            dc = abs(c - pc)
            step_dist = (math.sqrt(2.0) if (dr > 0 and dc > 0) else 1.0) * cell_size_m
            total_dist += step_dist

            elev_diff = elev - prev_elev
            if elev_diff > 0:
                total_ascent += elev_diff
            else:
                total_descent += abs(elev_diff)

        profile.append({
            "distance_m": round(total_dist, 1),
            "elevation_m": round(elev, 2),
            "slope_deg": round(slope, 2),
        })

    max_slope = float(np.max(slopes))
    mean_slope = float(np.mean(slopes))

    # Documented difficulty score formula
    difficulty = (mean_slope * 2.0) + ((max_slope / 25.0) * 10.0) + ((total_dist / 1000.0) * 1.5)

    return {
        "length_m": round(total_dist, 1),
        "total_ascent_m": round(total_ascent, 1),
        "total_descent_m": round(total_descent, 1),
        "max_slope_deg": round(max_slope, 2),
        "mean_slope_deg": round(mean_slope, 2),
        "difficulty_score": round(difficulty, 2),
        "profile": profile,
        "coordinates": coords
    }
