import React from "react";

interface MapHudProps {
  cursorCoords: { lat: number; lon: number } | null;
  isDrawingBbox: boolean;
}

export const MapHud: React.FC<MapHudProps> = ({ cursorCoords, isDrawingBbox }) => {
  return (
    <>
      <div className="absolute bottom-2 right-2 bg-panel/90 border border-border rounded-btn px-2.5 py-1 text-[11px] font-mono text-text-muted backdrop-blur-sm shadow-md pointer-events-none">
        {cursorCoords ? (
          <span>
            Lat: <strong className="text-text-primary">{cursorCoords.lat.toFixed(4)}°</strong> | Lon:{" "}
            <strong className="text-text-primary">{cursorCoords.lon.toFixed(4)}°</strong>
          </span>
        ) : (
          <span>Hover over map to inspect coordinates</span>
        )}
      </div>

      {isDrawingBbox && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-sky-400 text-slate-950 text-xs font-mono font-bold px-3 py-1.5 rounded-full shadow-glow pointer-events-none animate-pulse">
          Drag to draw bounding box...
        </div>
      )}
    </>
  );
};

