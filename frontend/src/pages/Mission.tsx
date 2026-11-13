import React from "react";

export const Mission: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-bold text-white">Mission Suitability & Traversability</h1>
        <span className="text-xs bg-amber-950/60 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-mono">
          Phase 7 Planned
        </span>
      </div>
      <p className="text-gray-400 text-sm max-w-2xl">
        Multi-constraint pathfinding and mission suitability screening for rover traverse and astronaut field training operations.
      </p>
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 space-y-2">
        <p className="font-semibold text-gray-300">Feature Status:</p>
        <p>A* path traversability simulation and mission constraint evaluations will be implemented in Part 7.</p>
      </div>
    </div>
  );
};
