import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GlobeViewMode } from "./NASAThreeGlobeRenderer";
import { RotatingPlanetGlobe } from "./RotatingPlanetGlobe";

interface HeroSectionProps {
  onScrollToHowItWorks: () => void;
}

const VIEW_OPTIONS: { id: GlobeViewMode; label: string }[] = [
  { id: "earthrise", label: "Earth from Moon" },
  { id: "mars", label: "Mars" },
  { id: "earth", label: "Earth" },
  { id: "moon", label: "Moon" },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToHowItWorks }) => {
  const [viewMode, setViewMode] = useState<GlobeViewMode>("earthrise");

  return (
    <section className="relative w-full bg-black text-white min-h-[84vh] lg:min-h-[90vh] flex items-center overflow-hidden border-b border-white/10">
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Bold SpaceX-style Typography & Exploration Action */}
        <div className="lg:col-span-5 z-10 flex flex-col justify-center space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#94A3B8] block">
              CASSIN X • ASTRA-X PLATFORM
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-sans font-black tracking-tight text-white uppercase leading-[0.92]">
              DISCOVER<br />
              PLANETARY<br />
              ANALOGS
            </h1>
          </div>

          <p className="text-sm sm:text-base text-gray-300 font-sans max-w-lg leading-relaxed font-normal">
            From lunar impact basins to Martian volcanic plains, discover where on Earth matches other worlds. ASTRA-X extracts measurable topography, slopes, and surface roughness across open planetary datasets.
          </p>

          {/* Minimalist SpaceX-Style Outline Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link
              to="/discovery?mode=image"
              className="inline-flex items-center space-x-2.5 px-6 py-3 border border-white bg-transparent hover:bg-white hover:text-black text-white text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-md group"
            >
              <span>EXPLORE ANALOGS</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <button
              type="button"
              onClick={onScrollToHowItWorks}
              className="inline-flex items-center space-x-2 px-6 py-3 border border-white/30 hover:border-white/80 bg-transparent text-gray-300 hover:text-white text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.2em] transition-all duration-300"
            >
              <span>HOW IT WORKS</span>
            </button>
          </div>

          {/* Perspective View Switcher (Earth from Moon / Mars / Earth / Moon) */}
          <div className="pt-4 flex items-center space-x-3 text-xs font-mono">
            <span className="text-gray-500 uppercase tracking-widest text-[11px]">VIEW:</span>
            {VIEW_OPTIONS.map((opt) => {
              const isSelected = viewMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setViewMode(opt.id)}
                  className={`uppercase tracking-widest text-xs transition-colors py-1 ${
                    isSelected
                      ? "text-white font-bold border-b border-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Apollo 8 Earthrise 3D Scene (Moon Horizon with Rotating Earth) */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end items-center relative overflow-visible">
          <RotatingPlanetGlobe viewMode={viewMode} />
        </div>
      </div>
    </section>
  );
};
