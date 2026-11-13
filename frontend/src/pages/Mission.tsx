import React, { useState, useEffect } from "react";
import {
  SectionHeading,
  Card,
  Badge,
  Button,
  LoadingSpinner,
  EmptyState,
} from "../components/ui";
import {
  api,
  Region,
  LandingScreeningResponse,
  RoutePlanResponse,
  RouteOptionItem,
} from "../api/client";

type MissionTab = "screening" | "routes" | "comparison";

export const Mission: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MissionTab>("screening");
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [loadingRegions, setLoadingRegions] = useState(true);

  // Screening state
  const [maxSlopeDeg, setMaxSlopeDeg] = useState<number>(10.0);
  const [maxRoughnessM, setMaxRoughnessM] = useState<number>(5.0);
  const [screeningResult, setScreeningResult] = useState<LandingScreeningResponse | null>(null);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screeningError, setScreeningError] = useState<string | null>(null);

  // Pathfinding state
  const [startLon, setStartLon] = useState<number>(77.40);
  const [startLat, setStartLat] = useState<number>(18.35);
  const [goalLon, setGoalLon] = useState<number>(77.65);
  const [goalLat, setGoalLat] = useState<number>(18.45);
  const [routeMode, setRouteMode] = useState<"balanced" | "shortest" | "safest">("balanced");
  const [maxTraverseSlope, setMaxTraverseSlope] = useState<number>(25.0);
  const [routeResult, setRouteResult] = useState<RoutePlanResponse | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Load regions
  useEffect(() => {
    async function load() {
      try {
        setLoadingRegions(true);
        const data = await api.getRegions();
        setRegions(data);
        if (data.length > 0) {
          // Default to Jezero Crater (Mars) if available, otherwise first
          const jezero = data.find((r) => r.name.toLowerCase().includes("jezero")) || data[0];
          setSelectedRegionId(jezero.id);
          applyPresetCoords(jezero);
        }
      } catch (err: unknown) {
        console.error("Failed to load regions:", err);
      } finally {
        setLoadingRegions(false);
      }
    }
    load();
  }, []);

  const getRegionBounds = (region: Region): [number, number, number, number] => {
    if (region.bbox_json) {
      try {
        const parsed = JSON.parse(region.bbox_json);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return [parsed[0], parsed[1], parsed[2], parsed[3]];
        }
      } catch {
        // Fallback
      }
    }
    return [region.lon - 0.25, region.lat - 0.25, region.lon + 0.25, region.lat + 0.25];
  };

  const applyPresetCoords = (region: Region) => {
    const [minLon, minLat, maxLon, maxLat] = getRegionBounds(region);

    // Sensible start/goal within the center 50% of the bounding box
    const sLon = Number((minLon + (maxLon - minLon) * 0.25).toFixed(4));
    const sLat = Number((minLat + (maxLat - minLat) * 0.25).toFixed(4));
    const gLon = Number((minLon + (maxLon - minLon) * 0.75).toFixed(4));
    const gLat = Number((minLat + (maxLat - minLat) * 0.75).toFixed(4));

    setStartLon(sLon);
    setStartLat(sLat);
    setGoalLon(gLon);
    setGoalLat(gLat);
  };

  const handleRegionChange = (regId: number) => {
    setSelectedRegionId(regId);
    const reg = regions.find((r) => r.id === regId);
    if (reg) applyPresetCoords(reg);
    setScreeningResult(null);
    setRouteResult(null);
  };

  // Run screening
  const handleRunScreening = async () => {
    if (!selectedRegionId) return;
    try {
      setScreeningLoading(true);
      setScreeningError(null);
      const res = await api.runLandingScreening({
        region_id: selectedRegionId,
        max_slope_deg: maxSlopeDeg,
        max_roughness_m: maxRoughnessM,
      });
      setScreeningResult(res);
    } catch (err: unknown) {
      setScreeningError(err instanceof Error ? err.message : "Screening calculation failed.");
    } finally {
      setScreeningLoading(false);
    }
  };

  // Run pathfinding
  const handleRunPathfinding = async () => {
    if (!selectedRegionId) return;
    try {
      setRouteLoading(true);
      setRouteError(null);
      const res = await api.planRoverRoute({
        region_id: selectedRegionId,
        start_coords: [startLon, startLat],
        goal_coords: [goalLon, goalLat],
        optimization_mode: routeMode,
        max_slope_deg: maxTraverseSlope,
      });
      setRouteResult(res);
      setSelectedRouteIndex(0);
    } catch (err: unknown) {
      setRouteError(err instanceof Error ? err.message : "Rover pathfinding calculation failed.");
    } finally {
      setRouteLoading(false);
    }
  };

  const activeRegion = regions.find((r) => r.id === selectedRegionId);
  const activeRoute: RouteOptionItem | null =
    routeResult && routeResult.routes.length > selectedRouteIndex
      ? routeResult.routes[selectedRouteIndex]
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Operations & Traversability"
          title="Mission Suitability & Rover Pathfinding"
          subtitle="Preliminary landing-site terrain screening, 8-connected A* traverse routing, and obstacle avoidance on real elevation rasters."
        />
        <div className="flex items-center space-x-2">
          <Badge variant="ok">Part 7 Active</Badge>
          <Badge variant="neutral">Strict Admissibility</Badge>
        </div>
      </div>

      {/* Mandatory Non-Certified Banner */}
      <Card className="border-amber-800/60 bg-amber-950/20 p-4 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-status-warn animate-pulse" />
          <h3 className="text-xs font-heading font-bold text-text-primary tracking-wide uppercase">
            Mandatory Decision Support Advisory
          </h3>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Preliminary screening for scientific decision support. Not certified landing or habitation safety. Operational suitability evaluates topographic smoothness and traverse slope constraints on ingested DEM rasters.
        </p>
      </Card>

      {/* Region Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-panel border border-border rounded-panel">
        <div className="space-y-1">
          <label className="text-xs font-mono font-semibold uppercase text-text-muted">
            Target Planetary Region
          </label>
          <p className="text-xs text-text-secondary">
            Select a planetary region with active elevation rasters to evaluate.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedRegionId || ""}
            onChange={(e) => handleRegionChange(Number(e.target.value))}
            className="bg-raised border border-border text-text-primary text-xs font-mono rounded-btn px-4 py-2 focus:outline-none focus:border-accent-cyan"
            disabled={loadingRegions}
          >
            {regions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name} ({reg.planet_id === 1 ? "Earth" : reg.planet_id === 2 ? "Mars" : "Moon"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("screening")}
            className={`px-4 py-2 rounded-btn text-xs font-mono font-medium transition-colors ${
              activeTab === "screening"
                ? "bg-panel text-accent-cyan border border-border shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-panel/40"
            }`}
          >
            Landing-Region Screening
          </button>
          <button
            onClick={() => setActiveTab("routes")}
            className={`px-4 py-2 rounded-btn text-xs font-mono font-medium transition-colors ${
              activeTab === "routes"
                ? "bg-panel text-accent-cyan border border-border shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-panel/40"
            }`}
          >
            A* Rover Pathfinding
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-4 py-2 rounded-btn text-xs font-mono font-medium transition-colors ${
              activeTab === "comparison"
                ? "bg-panel text-accent-cyan border border-border shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-panel/40"
            }`}
          >
            Traversal Mode Comparison
          </button>
        </div>
      </div>

      {/* TAB 1: LANDING-REGION SCREENING */}
      {activeTab === "screening" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Controls */}
            <Card className="lg:col-span-4 space-y-5">
              <div className="pb-3 border-b border-border">
                <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
                  Screening Parameters
                </h3>
                <p className="text-[11px] text-text-muted">
                  Configurable assumptions for science simulation support.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-muted">Max Allowable Slope:</span>
                    <span className="text-accent-cyan font-bold">{maxSlopeDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    step="0.5"
                    value={maxSlopeDeg}
                    onChange={(e) => setMaxSlopeDeg(Number(e.target.value))}
                    className="w-full accent-accent-cyan cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-text-muted/60">
                    <span>2° (Ultra Flat)</span>
                    <span>10° (Default)</span>
                    <span>25° (Lander Limit)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-muted">Max Allowable Roughness:</span>
                    <span className="text-accent-cyan font-bold">{maxRoughnessM} m</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={maxRoughnessM}
                    onChange={(e) => setMaxRoughnessM(Number(e.target.value))}
                    className="w-full accent-accent-cyan cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-text-muted/60">
                    <span>1 m (Smooth Plains)</span>
                    <span>5 m (Default)</span>
                    <span>20 m (Blocky)</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleRunScreening}
                  disabled={screeningLoading}
                >
                  {screeningLoading ? "Screening Terrain..." : "Execute Screening"}
                </Button>
              </div>
            </Card>

            {/* Results */}
            <div className="lg:col-span-8 space-y-6">
              {screeningLoading ? (
                <Card className="py-16 flex flex-col items-center justify-center space-y-3">
                  <LoadingSpinner size="lg" />
                  <p className="text-xs font-mono text-text-muted">
                    Sampling raster elevation, slope, and roughness across DEM grid...
                  </p>
                </Card>
              ) : screeningError ? (
                <EmptyState
                  title="Screening Execution Error"
                  description={screeningError}
                  action={
                    <Button variant="primary" size="sm" onClick={handleRunScreening}>
                      Retry
                    </Button>
                  }
                />
              ) : screeningResult ? (
                <div className="space-y-6">
                  {/* Suitability Score Banner */}
                  <Card className="bg-panel border-accent-cyan/30 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-accent-cyan font-semibold">
                          Separate Operational Metric
                        </span>
                        <h4 className="text-xl font-heading font-bold text-text-primary">
                          Mission Suitability Score: {(screeningResult.mission_suitability_score * 100).toFixed(1)}%
                        </h4>
                        <p className="text-xs text-text-muted mt-1">
                          Evaluated over {screeningResult.total_cells} raster cells in {screeningResult.region_name}.
                        </p>
                      </div>

                      <div className="text-right">
                        <Badge variant="ok">Pass Fraction: {(screeningResult.pass_fraction * 100).toFixed(1)}%</Badge>
                        <div className="text-[11px] font-mono text-text-muted mt-1">
                          Passing Cells: {screeningResult.passing_cells} / {screeningResult.total_cells}
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-raised rounded-full h-3 overflow-hidden border border-border">
                      <div
                        className="bg-accent-cyan h-full transition-all duration-500 rounded-full"
                        style={{ width: `${(screeningResult.mission_suitability_score * 100).toFixed(1)}%` }}
                      />
                    </div>
                  </Card>

                  {/* Flagged Hazards */}
                  <Card className="space-y-3">
                    <h4 className="text-xs font-mono font-bold uppercase text-text-primary tracking-wide">
                      Flagged Hazard Analysis
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {screeningResult.flagged_hazards.map((haz, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-raised border border-border rounded-btn space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-text-primary">
                              {haz.type.replace("_", " ").toUpperCase()}
                            </span>
                            <Badge variant={haz.severity === "high" ? "warn" : "neutral"}>
                              {haz.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-text-muted">
                            Threshold: {haz.threshold} | Flagged: {haz.flagged_cells} cells ({(haz.hazard_fraction * 100).toFixed(1)}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Unassessed Environmental Factors */}
                  <Card className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono font-bold uppercase text-text-primary tracking-wide">
                        Environmental & Physical Factors
                      </h4>
                      <Badge variant="neutral">Ingest Rule</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                      {Object.entries(screeningResult.environmental_factors).map(([factor, val]) => (
                        <div key={factor} className="p-3 bg-raised border border-border rounded-btn space-y-1">
                          <span className="text-text-muted capitalize">{factor}:</span>
                          <p className="text-status-warn text-[11px] font-sans">{val}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="py-16 text-center space-y-3 border-dashed">
                  <p className="text-xs font-mono text-text-muted">
                    No screening run yet. Adjust the slope and roughness thresholds on the left and click "Execute Screening".
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROVER PATHFINDING */}
      {activeTab === "routes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Traverse Configuration */}
            <Card className="lg:col-span-4 space-y-5">
              <div className="pb-3 border-b border-border">
                <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
                  Rover Pathfinding Parameters
                </h3>
                <p className="text-[11px] text-text-muted">
                  8-connected A* traverse with octile heuristic and slope barriers.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-muted">Start Coordinates (Lon, Lat)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={startLon}
                      onChange={(e) => setStartLon(Number(e.target.value))}
                      className="bg-raised border border-border rounded-btn px-3 py-1.5 text-xs font-mono text-text-primary"
                      placeholder="Lon"
                    />
                    <input
                      type="number"
                      step="0.001"
                      value={startLat}
                      onChange={(e) => setStartLat(Number(e.target.value))}
                      className="bg-raised border border-border rounded-btn px-3 py-1.5 text-xs font-mono text-text-primary"
                      placeholder="Lat"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-muted">Goal Coordinates (Lon, Lat)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={goalLon}
                      onChange={(e) => setGoalLon(Number(e.target.value))}
                      className="bg-raised border border-border rounded-btn px-3 py-1.5 text-xs font-mono text-text-primary"
                      placeholder="Lon"
                    />
                    <input
                      type="number"
                      step="0.001"
                      value={goalLat}
                      onChange={(e) => setGoalLat(Number(e.target.value))}
                      className="bg-raised border border-border rounded-btn px-3 py-1.5 text-xs font-mono text-text-primary"
                      placeholder="Lat"
                    />
                  </div>
                </div>

                {activeRegion && (() => {
                  const [bMinLon, bMinLat, bMaxLon, bMaxLat] = getRegionBounds(activeRegion);
                  return (
                    <div className="text-[10px] font-mono text-text-muted p-2 bg-raised rounded border border-border">
                      Region Bbox: [{bMinLon.toFixed(2)}, {bMinLat.toFixed(2)}] to [{bMaxLon.toFixed(2)}, {bMaxLat.toFixed(2)}]
                    </div>
                  );
                })()}

                <div className="space-y-1">
                  <label className="text-xs font-mono text-text-muted">Optimisation Mode</label>
                  <select
                    value={routeMode}
                    onChange={(e) => setRouteMode(e.target.value as "balanced" | "shortest" | "safest")}
                    className="w-full bg-raised border border-border rounded-btn px-3 py-2 text-xs font-mono text-text-primary"
                  >
                    <option value="balanced">Balanced (Distance + Slope Weight 3.0)</option>
                    <option value="shortest">Shortest (Minimum Metric Distance)</option>
                    <option value="safest">Safest (High Slope Weight 8.0)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-muted">Max Traverse Slope:</span>
                    <span className="text-accent-cyan font-bold">{maxTraverseSlope}°</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="35"
                    step="1"
                    value={maxTraverseSlope}
                    onChange={(e) => setMaxTraverseSlope(Number(e.target.value))}
                    className="w-full accent-accent-cyan cursor-pointer"
                  />
                  <div className="text-[10px] font-mono text-text-muted/60">
                    Cells with slope &gt; {maxTraverseSlope}° become impassable barriers.
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleRunPathfinding}
                  disabled={routeLoading}
                >
                  {routeLoading ? "Searching 8-Connected Grid..." : "Compute Traverse Routes"}
                </Button>
              </div>
            </Card>

            {/* Route Details & Profile */}
            <div className="lg:col-span-8 space-y-6">
              {routeLoading ? (
                <Card className="py-16 flex flex-col items-center justify-center space-y-3">
                  <LoadingSpinner size="lg" />
                  <p className="text-xs font-mono text-text-muted">
                    Evaluating A* graph on elevation grid with octile admissible heuristic...
                  </p>
                </Card>
              ) : routeError ? (
                <EmptyState
                  title="Pathfinding Error"
                  description={routeError}
                  action={
                    <Button variant="primary" size="sm" onClick={handleRunPathfinding}>
                      Retry
                    </Button>
                  }
                />
              ) : routeResult && routeResult.routes.length > 0 ? (
                <div className="space-y-6">
                  {/* Route Alternative Selector Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {routeResult.routes.map((rt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedRouteIndex(idx)}
                        className={`p-3 rounded-panel border text-left transition-all ${
                          selectedRouteIndex === idx
                            ? "bg-panel border-accent-cyan shadow-sm"
                            : "bg-raised border-border hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-accent-cyan">
                            {rt.mode.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted">
                            Diff: {rt.difficulty_score.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-sm font-heading font-bold text-text-primary">
                          {(rt.length_m / 1000).toFixed(2)} km
                        </div>
                        <div className="text-[11px] font-mono text-text-muted">
                          Max Slope: {rt.max_slope_deg.toFixed(1)}°
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Route Summary Stats */}
                  {activeRoute && (
                    <Card className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
                        <div>
                          <h4 className="text-sm font-heading font-bold text-text-primary">
                            {activeRoute.name}
                          </h4>
                          <span className="text-xs font-mono text-text-muted">
                            Optimization Mode: {activeRoute.mode} | Impassable Zones Encounted: {routeResult.impassable_zones_count}
                          </span>
                        </div>
                        <Badge variant="ok">Optimal Admissible Path</Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono">
                        <div className="p-2.5 bg-raised rounded border border-border">
                          <div className="text-[10px] text-text-muted">TOTAL LENGTH</div>
                          <div className="text-sm font-bold text-accent-cyan">
                            {(activeRoute.length_m / 1000).toFixed(2)} km
                          </div>
                        </div>
                        <div className="p-2.5 bg-raised rounded border border-border">
                          <div className="text-[10px] text-text-muted">TOTAL ASCENT</div>
                          <div className="text-sm font-bold text-status-warn">
                            +{activeRoute.total_ascent_m.toFixed(1)} m
                          </div>
                        </div>
                        <div className="p-2.5 bg-raised rounded border border-border">
                          <div className="text-[10px] text-text-muted">TOTAL DESCENT</div>
                          <div className="text-sm font-bold text-accent-blue">
                            -{activeRoute.total_descent_m.toFixed(1)} m
                          </div>
                        </div>
                        <div className="p-2.5 bg-raised rounded border border-border">
                          <div className="text-[10px] text-text-muted">MAX SLOPE</div>
                          <div className="text-sm font-bold text-text-primary">
                            {activeRoute.max_slope_deg.toFixed(1)}°
                          </div>
                        </div>
                        <div className="p-2.5 bg-raised rounded border border-border">
                          <div className="text-[10px] text-text-muted">DIFFICULTY SCORE</div>
                          <div className="text-sm font-bold text-accent-cyan">
                            {activeRoute.difficulty_score.toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {/* Elevation Profile SVG Chart */}
                      {activeRoute.elevation_profile && activeRoute.elevation_profile.length > 1 && (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                            <span>Elevation Profile Along Traverse Path</span>
                            <span>Distance vs Elevation</span>
                          </div>

                          <div className="p-4 bg-raised border border-border rounded-panel overflow-hidden">
                            <ElevationSvgChart profile={activeRoute.elevation_profile} />
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="py-16 text-center space-y-3 border-dashed">
                  <p className="text-xs font-mono text-text-muted">
                    No traverse routes calculated yet. Set start/goal coordinates within the bounding box and click "Compute Traverse Routes".
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRAVERSAL MODE COMPARISON */}
      {activeTab === "comparison" && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
                Traversal Optimization Mode Trade-offs
              </h3>
              <p className="text-xs text-text-muted">
                Mathematical routing trade-offs between distance minimization and obstacle avoidance.
              </p>
            </div>
            <Badge variant="neutral">Formula: Cost = d * (1 + w * slope)</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-raised border border-border rounded-panel space-y-2">
              <span className="font-bold text-accent-cyan">1. Shortest Mode (w=0.0)</span>
              <p className="text-text-muted font-sans text-xs">
                Minimizes pure Euclidean traversal distance on the grid. Ignores slope steepness unless the cell exceeds the max barrier threshold (25°).
              </p>
              <div className="text-[11px] text-text-muted">Trade-off: Fast execution, potentially higher energy consumption and motor strain on slopes.</div>
            </div>

            <div className="p-4 bg-raised border border-border rounded-panel space-y-2">
              <span className="font-bold text-accent-blue">2. Balanced Mode (w=3.0)</span>
              <p className="text-text-muted font-sans text-xs">
                Recommended operational default. Moderately penalizes slopes while avoiding excessive circuitous detours.
              </p>
              <div className="text-[11px] text-text-muted">Trade-off: Balanced battery expenditure and traverse travel time.</div>
            </div>

            <div className="p-4 bg-raised border border-border rounded-panel space-y-2">
              <span className="font-bold text-status-warn">3. Safest Mode (w=8.0)</span>
              <p className="text-text-muted font-sans text-xs">
                Aggressively avoids grades &gt; 5°. The planner navigates around ridge-lines and crater rims to stay on the smoothest planar ground.
              </p>
              <div className="text-[11px] text-text-muted">Trade-off: Longer path length, lowest slip and rollover risk.</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Clean SVG Elevation Profile Component
interface ElevationSvgChartProps {
  profile: Array<{ distance_m: number; elevation_m: number; slope_deg: number }>;
}

const ElevationSvgChart: React.FC<ElevationSvgChartProps> = ({ profile }) => {
  if (!profile || profile.length < 2) return null;

  const totalDist = profile[profile.length - 1].distance_m;
  const elevations = profile.map((p) => p.elevation_m);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = maxElev - minElev || 1.0;

  const width = 600;
  const height = 160;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 25;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const points = profile.map((p) => {
    const x = padLeft + (p.distance_m / (totalDist || 1)) * chartWidth;
    const y = padTop + chartHeight - ((p.elevation_m - minElev) / elevRange) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M ${points[0]} L ${points.join(" L ")} L ${points[points.length - 1].split(",")[0]},${padTop + chartHeight} L ${padLeft},${padTop + chartHeight} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        {/* Fill Area under curve */}
        <path d={areaD} fill="rgba(6, 182, 212, 0.12)" />

        {/* Profile line */}
        <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />

        {/* Gridlines */}
        <line
          x1={padLeft}
          y1={padTop + chartHeight}
          x2={width - padRight}
          y2={padTop + chartHeight}
          stroke="#334155"
          strokeWidth="1"
        />

        {/* Min / Max Labels */}
        <text
          x={padLeft - 6}
          y={padTop + 8}
          textAnchor="end"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="monospace"
        >
          {maxElev.toFixed(0)}m
        </text>
        <text
          x={padLeft - 6}
          y={padTop + chartHeight}
          textAnchor="end"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="monospace"
        >
          {minElev.toFixed(0)}m
        </text>

        {/* X axis labels */}
        <text
          x={padLeft}
          y={height - 6}
          textAnchor="start"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="monospace"
        >
          0 km
        </text>
        <text
          x={width - padRight}
          y={height - 6}
          textAnchor="end"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="monospace"
        >
          {(totalDist / 1000).toFixed(2)} km
        </text>
      </svg>
    </div>
  );
};
