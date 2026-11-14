import React from "react";
import { PlanetType, BASEMAP_OPTIONS, BasemapOption } from "./mapStyles";

interface BasemapSelectorProps {
  planet: PlanetType;
  currentBasemapId: string;
  onSelectBasemap: (id: string) => void;
}

export const BasemapSelector: React.FC<BasemapSelectorProps> = ({
  planet,
  currentBasemapId,
  onSelectBasemap,
}) => {
  const options: BasemapOption[] = BASEMAP_OPTIONS[planet] || [];

  return (
    <div className="absolute top-2 right-12 z-10 flex items-center bg-panel/95 border border-border rounded-btn px-2 py-1 text-xs font-mono backdrop-blur-sm shadow-md space-x-1.5">
      <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Imagery:</span>
      <select
        value={currentBasemapId}
        onChange={(e) => onSelectBasemap(e.target.value)}
        className="bg-raised border border-border rounded px-2 py-0.5 text-[11px] text-text-primary focus:outline-none focus:border-accent-cyan cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label} ({opt.provider})
          </option>
        ))}
      </select>
    </div>
  );
};

