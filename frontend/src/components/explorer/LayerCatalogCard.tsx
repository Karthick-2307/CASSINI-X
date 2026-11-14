import React from "react";
import { Card, Badge } from "../ui";

interface LayerCatalogCardProps {
  datasetName: string;
}

export const LayerCatalogCard: React.FC<LayerCatalogCardProps> = ({ datasetName }) => {
  return (
    <Card className="space-y-3 border-border">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-xs font-heading font-bold text-text-primary uppercase tracking-wide">
          Dataset Layer Catalog
        </h3>
        <Badge variant="neutral">Status</Badge>
      </div>

      <div className="space-y-2 text-xs font-mono">
        {/* Layer 1: Ingested DEM */}
        <div className="flex items-center justify-between p-2 rounded bg-raised border border-border">
          <div className="space-y-0.5">
            <div className="text-text-primary font-bold text-[11px]">{datasetName}</div>
            <div className="text-text-muted text-[10px]">Full Raster Ingested (500m scale)</div>
          </div>
          <Badge variant="measured">Active</Badge>
        </div>

        {/* Disabled Layers with Explicit Reasons (Rule 6.1) */}
        <div className="flex items-center justify-between p-2 rounded bg-raised/40 border border-border/50 opacity-60">
          <div className="space-y-0.5">
            <div className="text-text-muted font-medium text-[11px]">HiRISE / LROC NAC High-Res</div>
            <div className="text-text-muted/70 text-[10px]">0.5m Local Optical Mosaic</div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/10">
            Not ingested
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-raised/40 border border-border/50 opacity-60">
          <div className="space-y-0.5">
            <div className="text-text-muted font-medium text-[11px]">Venus Magellan SAR Radar</div>
            <div className="text-text-muted/70 text-[10px]">Altimetric Radar Grid</div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/10">
            Not ingested
          </span>
        </div>
      </div>
    </Card>
  );
};
