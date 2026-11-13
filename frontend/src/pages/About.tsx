import React from "react";

export const About: React.FC = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2 pb-4 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-white tracking-wide">About ASTRA-X</h1>
        <p className="text-cyan-400 font-medium">Developed by CASSIN X</p>
      </div>

      <div className="space-y-4 text-gray-300 leading-relaxed text-sm sm:text-base">
        <p>
          <strong className="text-white">ASTRA-X</strong> is an explainable, data-driven web application designed to bridge planetary science and terrestrial field exploration.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-2">
          <h2 className="text-base font-semibold text-white">Research Question</h2>
          <blockquote className="italic text-cyan-300 border-l-2 border-cyan-500 pl-4 py-1">
            "Given a selected region on Mars or the Moon, which locations on Earth have comparable terrain characteristics?"
          </blockquote>
        </div>

        <h2 className="text-xl font-bold text-white pt-2">Scientific Honesty & Principles</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm">
          <li><strong>No Fabricated Data:</strong> Every number shown is derived strictly from open elevation datasets (USGS, Copernicus, NASA PDS) or clearly labelled as DEMO DATA in demo mode.</li>
          <li><strong>Transparent Distance Metric:</strong> Features (relative elevation, slope, roughness) are evaluated at fixed spatial scale with equal default weighting.</li>
          <li><strong>Separation of Concerns:</strong> Similarity, confidence, and mission suitability are preserved as strictly independent fields.</li>
          <li><strong>Decision Support Only:</strong> Analog comparisons provide preliminary screening for field researchers, not assertions of identity or certified landing safety.</li>
        </ul>

        <div className="pt-4 border-t border-gray-800 text-xs text-gray-400">
          ASTRA-X • Platform Version 0.1.0 • Built with pride by team <strong>CASSIN X</strong>
        </div>
      </div>
    </div>
  );
};
