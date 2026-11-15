import React from "react";
import { Link } from "react-router-dom";
import { RotatingPlanetGlobe } from "./RotatingPlanetGlobe";

interface HeroSectionProps {
  onScrollToHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToHowItWorks }) => {
  return (
    <section className="relative w-full bg-black text-white min-h-[86vh] lg:min-h-[92vh] flex items-center overflow-hidden border-b border-white/10 select-none">
      {/* 1. Full-bleed 3D Canvas (Wide Earth horizon across bottom + Moon orbiting in space sky + 3D Stars) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <RotatingPlanetGlobe className="w-full h-full" />
      </div>

      {/* 2. Content Overlay (SpaceX-style Typography & Discovery CTAs) */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-12 lg:py-20 flex flex-col justify-between min-h-[86vh] lg:min-h-[92vh] pointer-events-none">
        {/* Top/Left Section: Headline & Mission Statement */}
        <div className="max-w-2xl space-y-6 pt-4 lg:pt-8 text-left pointer-events-auto">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#94A3B8] block">
              CASSINI-X • ASTRA-X PLATFORM
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-sans font-black tracking-tight text-white uppercase leading-[0.92] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              DISCOVER<br />
              PLANETARY<br />
              ANALOGS
            </h1>
          </div>

          <p className="text-sm sm:text-base text-gray-200 font-sans max-w-lg leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Explore terrestrial analogs across Moon and Mars datasets from an authentic orbital Earth perspective. ASTRA-X compares elevation profiles, slopes, and surface roughness against comparable Earth environments.
          </p>

          {/* Minimalist SpaceX-Style Outline Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link
              to="/discovery?mode=image"
              className="inline-flex items-center space-x-2.5 px-6 py-3 border border-white bg-black/50 backdrop-blur-sm hover:bg-white hover:text-black text-white text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg group"
            >
              <span>EXPLORE ANALOGS</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <button
              type="button"
              onClick={onScrollToHowItWorks}
              className="inline-flex items-center space-x-2 px-6 py-3 border border-white/30 hover:border-white/80 bg-black/40 backdrop-blur-sm text-gray-300 hover:text-white text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.2em] transition-all duration-300"
            >
              <span>HOW IT WORKS</span>
            </button>
          </div>
        </div>

        {/* Bottom Legend / Provenance Hint */}
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400/80 pt-4 border-t border-white/5 pointer-events-none">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
            <span>Interactive Orbital Perspective • Earth Rotation &amp; Moon Orbit</span>
          </div>
          <span className="hidden sm:inline">NASA Visible Earth Blue Marble &bull; LRO Mosaic</span>
        </div>
      </div>
    </section>
  );
};
