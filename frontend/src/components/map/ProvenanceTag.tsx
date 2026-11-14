import React from "react";
import { TerrainBounds } from "../../api/client";

interface ProvenanceTagProps {
  overlayBounds: TerrainBounds;
}

export const ProvenanceTag: React.FC<ProvenanceTagProps> = ({ overlayBounds }) => {
  return (
    <div className="absolute top-2 left-2 z-10 pointer-events-none max-w-xs">
      <div className="bg-slate-900/95 border border-white/15 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 backdrop-blur-md space-y-1 shadow-2xl">
        <div className="font-bold text-white text-[11px] tracking-wide">
          {overlayBounds.dataset_name}
        </div>
        <div className="text-slate-400">
          Resolution: {overlayBounds.resolution_m}m | Source: {overlayBounds.source}
        </div>
        <div className="text-sky-400 font-semibold">
          Active DEM Overlay: {overlayBounds.name}
        </div>
      </div>
    </div>
  );
};
