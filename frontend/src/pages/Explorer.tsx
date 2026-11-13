import React from "react";

export const Explorer: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-bold text-white">Planetary Explorer</h1>
        <span className="text-xs bg-amber-950/60 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-mono">
          Phase 6 Planned
        </span>
      </div>
      <p className="text-gray-400 text-sm max-w-2xl">
        Explore elevation, slope, and roughness profiles across target regions on the Moon and Mars with cross-sectional profiles.
      </p>
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 space-y-2">
        <p className="font-semibold text-gray-300">Feature Status:</p>
        <p>Terrain cross-sections and raster inspection tools are scheduled for Part 6.</p>
      </div>
    </div>
  );
};
