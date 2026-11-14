import React from "react";
import { BodyInfo } from "./BodyContextCard";

interface LayerControlBarProps {
  showHillshade: boolean;
  setShowHillshade: (val: boolean) => void;
  showSlope: boolean;
  setShowSlope: (val: boolean) => void;
  currentInfo: BodyInfo;
}

export const LayerControlBar: React.FC<LayerControlBarProps> = ({
  showHillshade,
  setShowHillshade,
  showSlope,
  setShowSlope,
  currentInfo,
}) => {
  return (
    <div className="p-3 bg-panel border border-border rounded-panel flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      <div className="flex items-center space-x-4">
        <span className="text-text-muted font-bold uppercase text-[10px]">Active Layers:</span>
        <label className="flex items-center space-x-1.5 cursor-pointer text-text-primary">
          <input
            type="checkbox"
            checked={showHillshade}
            onChange={(e) => setShowHillshade(e.target.checked)}
            className="rounded border-border text-accent-cyan"
          />
          <span>Elevation Hillshade (Ingested)</span>
        </label>
        <label className="flex items-center space-x-1.5 cursor-pointer text-text-primary">
          <input
            type="checkbox"
            checked={showSlope}
            onChange={(e) => setShowSlope(e.target.checked)}
            className="rounded border-border text-accent-cyan"
          />
          <span>Slope Heatmap (Derived)</span>
        </label>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-text-muted">
        <span>DEM: {currentInfo.dataset}</span>
        <span>|</span>
        <span className="text-accent-cyan">Native Res: {currentInfo.resolution}</span>
      </div>
    </div>
  );
};

