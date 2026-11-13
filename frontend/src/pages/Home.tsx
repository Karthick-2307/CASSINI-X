import React from "react";
import { Link } from "react-router-dom";

export const Home: React.FC = () => {
  return (
    <div className="space-y-8 py-4">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-block px-3 py-1 bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-mono uppercase tracking-widest rounded-full">
          Mission Research Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          ASTRA<span className="text-cyan-400">-X</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 italic">
          "Discover Earth. Understand Other Worlds. Prepare for Exploration."
        </p>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          ASTRA-X answers a singular, data-driven question:
          <span className="block font-medium text-gray-200 mt-1">
            "Given a selected region on Mars or the Moon, which locations on Earth have comparable terrain characteristics?"
          </span>
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md shadow-sm transition-colors text-sm"
          >
            Open Planetary Dashboard
          </Link>
          <Link
            to="/about"
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-medium rounded-md transition-colors text-sm"
          >
            About CASSIN X
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-2">
          <h2 className="text-lg font-bold text-white">Data-Driven Analogs</h2>
          <p className="text-sm text-gray-400">
            Open elevation datasets from USGS, NASA PDS, and Copernicus provide real planetary geometry.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-2">
          <h2 className="text-lg font-bold text-white">Transparent Comparisons</h2>
          <p className="text-sm text-gray-400">
            Weighted physical distance models with elevation, slope, and roughness computed at fixed spatial scale.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-lg space-y-2">
          <h2 className="text-lg font-bold text-white">Scientific Honesty</h2>
          <p className="text-sm text-gray-400">
            Separate scores for similarity, confidence, and mission suitability without fabricated data.
          </p>
        </div>
      </div>
    </div>
  );
};
