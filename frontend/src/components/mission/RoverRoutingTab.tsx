import React from "react";
import { Card, Badge, Button, LoadingSpinner, EmptyState } from "../ui";
import { Region, RoutePlanResponse, RouteOptionItem } from "../../api/client";
import { ElevationSvgChart } from "./ElevationSvgChart";

interface RoverRoutingTabProps {
  activeRegion?: Region;
  startLon: number;
  setStartLon: (val: number) => void;
  startLat: number;
  setStartLat: (val: number) => void;
  goalLon: number;
  setGoalLon: (val: number) => void;
  goalLat: number;
  setGoalLat: (val: number) => void;
  routeMode: "balanced" | "shortest" | "safest";
  setRouteMode: (val: "balanced" | "shortest" | "safest") => void;
  maxTraverseSlope: number;
  setMaxTraverseSlope: (val: number) => void;
  routeResult: RoutePlanResponse | null;
  selectedRouteIndex: number;
  setSelectedRouteIndex: (idx: number) => void;
  routeLoading: boolean;
  routeError: string | null;
  onRunPathfinding: () => void;
  getRegionBounds: (region: Region) => [number, number, number, number];
}

export const RoverRoutingTab: React.FC<RoverRoutingTabProps> = ({
  activeRegion,
  startLon,
  setStartLon,
  startLat,
  setStartLat,
  goalLon,
  setGoalLon,
  goalLat,
  setGoalLat,
  routeMode,
  setRouteMode,
  maxTraverseSlope,
  setMaxTraverseSlope,
  routeResult,
  selectedRouteIndex,
  setSelectedRouteIndex,
  routeLoading,
  routeError,
  onRunPathfinding,
  getRegionBounds,
}) => {
  const activeRoute: RouteOptionItem | null =
    routeResult && routeResult.routes.length > selectedRouteIndex
      ? routeResult.routes[selectedRouteIndex]
      : null;

  return (
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
              onClick={onRunPathfinding}
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
                <Button variant="primary" size="sm" onClick={onRunPathfinding}>
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
  );
};

