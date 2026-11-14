import React from "react";
import { Card, Badge } from "../ui";
import { BboxSampleResponse } from "../../api/client";

interface BboxInspectorProps {
  bboxResult: BboxSampleResponse | null;
  isSampling: boolean;
  bboxCoords: [number, number, number, number] | null;
}

export const BboxInspector: React.FC<BboxInspectorProps> = ({
  bboxResult,
  isSampling,
  bboxCoords,
}) => {
  return (
    <Card className="space-y-3 border-border">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-xs font-heading font-bold text-text-primary uppercase tracking-wide">
          Bbox Sampling Inspector
        </h3>
        {bboxResult && (
          <Badge variant={bboxResult.status === "ok" ? "ok" : "warn"}>
            {bboxResult.status === "ok" ? `${bboxResult.cell_count} Cells` : "Out of bounds"}
          </Badge>
        )}
      </div>

      {isSampling ? (
        <div className="py-8 text-center text-xs font-mono text-text-muted animate-pulse">
          Sampling raster cells within bounding box...
        </div>
      ) : bboxResult ? (
        bboxResult.status === "ok" ? (
          <div className="space-y-2 text-xs font-mono">
            {bboxCoords && (
              <div className="text-[10px] text-text-muted">
                Sample Extent: [{bboxCoords.map((n) => n.toFixed(2)).join(", ")}]
              </div>
            )}
            <div className="p-2 bg-status-ok/10 border border-status-ok/20 rounded text-[11px] text-status-ok">
              {bboxResult.message}
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <div className="p-2 bg-raised rounded border border-border text-center">
                <div className="text-text-muted">Elev Mean</div>
                <div className="font-bold text-text-primary">{bboxResult.elevation_relative?.mean} m</div>
              </div>
              <div className="p-2 bg-raised rounded border border-border text-center">
                <div className="text-text-muted">Slope Mean</div>
                <div className="font-bold text-accent-cyan">{bboxResult.slope_deg?.mean}°</div>
              </div>
              <div className="p-2 bg-raised rounded border border-border text-center">
                <div className="text-text-muted">Roughness</div>
                <div className="font-bold text-text-primary">{bboxResult.roughness_m?.mean} m</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-status-warn/10 border border-status-warn/30 rounded text-xs font-mono text-status-warn space-y-1">
            <div className="font-bold">Outside Coverage</div>
            <p className="text-[11px] text-text-muted leading-tight">
              {bboxResult.message}
            </p>
          </div>
        )
      ) : (
        <div className="py-6 text-center text-xs text-text-muted font-mono space-y-1">
          <div>No active bounding box selection</div>
          <p className="text-[10px] text-text-muted/60">
            Hold Shift and drag over the map to query cells directly from processed DEMs.
          </p>
        </div>
      )}
    </Card>
  );
};

