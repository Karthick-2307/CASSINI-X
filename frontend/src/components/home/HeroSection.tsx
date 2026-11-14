import React from "react";
import { Link } from "react-router-dom";
import { Button, CassinXLogo } from "../ui";
import { RotatingPlanetGlobe } from "./RotatingPlanetGlobe";

interface HeroSectionProps {
  onScrollToHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToHowItWorks }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-sky-500/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content - SpaceX Inspired Bold Typography */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-glow" />
              <span className="text-xs font-mono text-slate-400">A</span>
              <CassinXLogo />
              <span className="text-xs font-mono text-slate-400">RESEARCH MISSION</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.05] uppercase">
                DISCOVER<br />
                PLANETARY<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">
                  ANALOGS
                </span>
              </h1>
              <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-sky-400">
                Discover Earth • Understand Other Worlds • Prepare for Exploration
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
              Which locations on Earth have comparable terrain characteristics to Mars or the Moon? ASTRA-X extracts quantitative topographic morphology from open orbital elevation data to discover terrestrial planetary analogs.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link to="/discovery">
                <Button variant="primary" size="lg" className="px-8 py-3.5 text-xs tracking-widest font-mono">
                  EXPLORE ANALOGS →
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={onScrollToHowItWorks}
                className="px-8 py-3.5 text-xs tracking-widest font-mono"
              >
                HOW IT WORKS
              </Button>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-sky-400 font-bold">100%</span>
                <span>Open Science Data</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center space-x-2">
                <span className="text-cyan-400 font-bold">NASA</span>
                <span>MOLA • LOLA • SRTM</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">Explainable</span>
                <span>Scoring</span>
              </div>
            </div>
          </div>

          {/* Right Visual: Rotating 3D Celestial Body */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <RotatingPlanetGlobe />
          </div>
        </div>
      </div>
    </section>
  );
};
