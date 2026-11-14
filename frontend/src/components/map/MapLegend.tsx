import React from "react";

export const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-8 left-2 z-10 pointer-events-none">
      <div className="bg-slate-900/95 border border-white/15 rounded-xl p-3 text-[10px] font-mono backdrop-blur-md space-y-1.5 shadow-2xl text-slate-200">
        <div className="text-white font-bold tracking-wider uppercase text-[11px] pb-1 border-b border-white/10">
          Similarity Legend
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
          <span className="text-slate-200 font-medium">&ge; 85% High Match</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm" />
          <span className="text-slate-200 font-medium">70% &ndash; 85% Strong</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
          <span className="text-slate-200 font-medium">50% &ndash; 70% Moderate</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm" />
          <span className="text-slate-200 font-medium">&lt; 50% Low Match</span>
        </div>
      </div>
    </div>
  );
};
