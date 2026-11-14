import React from "react";
import { Card, Badge, Button, LoadingSpinner, EmptyState } from "../ui";
import { LandingScreeningResponse } from "../../api/client";

interface LandingScreeningTabProps {
  maxSlopeDeg: number;
  setMaxSlopeDeg: (val: number) => void;
  maxRoughnessM: number;
  setMaxRoughnessM: (val: number) => void;
  screeningResult: LandingScreeningResponse | null;
  screeningLoading: boolean;
  screeningError: string | null;
  onRunScreening: () => void;
}

export const LandingScreeningTab: React.FC<LandingScreeningTabProps> = ({
  maxSlopeDeg,
  setMaxSlopeDeg,
  maxRoughnessM,
  setMaxRoughnessM,
  screeningResult,
  screeningLoading,
  screeningError,
  onRunScreening,
}) => {
  return (
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
              onClick={onRunScreening}
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
                <Button variant="primary" size="sm" onClick={onRunScreening}>
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
  );
};

