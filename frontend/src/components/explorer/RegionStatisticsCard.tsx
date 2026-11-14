import React from "react";
import { Card, Badge } from "../ui";
import { TerrainSummary } from "../../api/client";

interface RegionStatisticsCardProps {
  regionSummary: TerrainSummary | null;
}

export const RegionStatisticsCard: React.FC<RegionStatisticsCardProps> = ({ regionSummary }) => {
  return (
    <Card className="space-y-3 border-border">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-xs font-heading font-bold text-text-primary uppercase tracking-wide">
          Real Terrain Statistics
        </h3>
        {regionSummary && (
          <Badge variant="derived">{regionSummary.total_cells} Cells</Badge>
        )}
      </div>

      {regionSummary ? (
        <div className="space-y-3 text-xs font-mono">
          <div className="p-2.5 bg-raised rounded-btn space-y-1">
            <div className="font-bold text-text-primary">{regionSummary.region_name}</div>
            <div className="text-[11px] text-text-muted">
              Spatial Scale Window: {regionSummary.scale_m}m | Coverage: 100%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-panel rounded border border-border">
              <div className="text-text-muted text-[10px]">Mean Relative Elev</div>
              <div className="font-bold text-text-primary text-xs">
                {regionSummary.elevation_relative_mean?.toFixed(1) ?? "--"} m
              </div>
            </div>
            <div className="p-2 bg-panel rounded border border-border">
              <div className="text-text-muted text-[10px]">Elev Std Deviation</div>
              <div className="font-bold text-text-primary text-xs">
                &plusmn;{regionSummary.elevation_relative_std?.toFixed(1) ?? "--"} m
              </div>
            </div>
            <div className="p-2 bg-panel rounded border border-border">
              <div className="text-text-muted text-[10px]">Mean Slope</div>
              <div className="font-bold text-accent-cyan text-xs">
                {regionSummary.slope_deg_mean?.toFixed(2) ?? "--"}°
              </div>
            </div>
            <div className="p-2 bg-panel rounded border border-border">
              <div className="text-text-muted text-[10px]">Max Slope</div>
              <div className="font-bold text-status-warn text-xs">
                {regionSummary.slope_deg_max?.toFixed(2) ?? "--"}°
              </div>
            </div>
          </div>

          <div className="p-2 bg-panel rounded border border-border text-[11px] flex justify-between items-center">
            <span className="text-text-muted">Mean Surface Roughness:</span>
            <span className="font-bold text-text-primary">
              {regionSummary.roughness_m_mean?.toFixed(2) ?? "--"} m
            </span>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-text-muted font-mono">
          Loading region terrain statistics...
        </div>
      )}
    </Card>
  );
};

