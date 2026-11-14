import React from "react";
import { Button, Card, Badge } from "../ui";
import { Planet, Region, GazetteerItem } from "../../api/client";
import { PlanetarySearchBar } from "./PlanetarySearchBar";

interface RegionWorkflowControlsProps {
  planets: Planet[];
  selectedPlanetName: string;
  setSelectedPlanetName: (name: string) => void;
  regions: Region[];
  selectedRegionId: number | null;
  setSelectedRegionId: (id: number) => void;
  selectedFeatures: Record<string, boolean>;
  onToggleFeature: (feat: string) => void;
  similarityThreshold: number;
  setSimilarityThreshold: (th: number) => void;
  topK: number;
  setTopK: (k: number) => void;
  isRunning: boolean;
  onRunAnalysis: () => void;
  onSelectGazetteerFeature: (item: GazetteerItem) => void;
}

export const RegionWorkflowControls: React.FC<RegionWorkflowControlsProps> = ({
  planets,
  selectedPlanetName,
  setSelectedPlanetName,
  regions,
  selectedRegionId,
  setSelectedRegionId,
  selectedFeatures,
  onToggleFeature,
  similarityThreshold,
  setSimilarityThreshold,
  topK,
  setTopK,
  isRunning,
  onRunAnalysis,
  onSelectGazetteerFeature,
}) => {
  const activePlanetList = planets.filter((p) => p.name !== "Earth");

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* 1. Target Planet & Reference Region */}
      <Card className="space-y-3 bg-[#111826] border border-[#243044] p-4 shadow-sm">
        <span className="font-semibold text-[#F8FAFC] block">1. Reference Target</span>

        <div>
          <label className="block text-[11px] text-[#94A3B8] mb-1">Target Celestial Body</label>
          <div className="grid grid-cols-2 gap-2">
            {activePlanetList.map((p) => {
              const active = p.name.toLowerCase() === selectedPlanetName.toLowerCase();
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlanetName(p.name)}
                  className={`py-2 px-3 rounded-btn text-xs font-medium border text-center transition-colors shadow-sm ${
                    active
                      ? "bg-[#162033] text-[#38BDF8] border-[#38BDF8]/40 font-semibold"
                      : "bg-[#111826] text-[#94A3B8] border-[#243044] hover:bg-[#162033] hover:text-[#F8FAFC]"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-[#94A3B8] mb-1">Ingested Reference Region</label>
          <select
            value={selectedRegionId || ""}
            onChange={(e) => setSelectedRegionId(Number(e.target.value))}
            className="w-full bg-[#162033] border border-[#243044] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] font-sans focus:border-[#38BDF8] focus:outline-none"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.lat.toFixed(2)}°, {r.lon.toFixed(2)}°)
              </option>
            ))}
          </select>
        </div>

        {/* IAU Gazetteer Search Integration */}
        <div className="pt-2 border-t border-[#243044] space-y-1">
          <label className="block text-[11px] text-[#94A3B8]">Or search IAU planetary gazetteer:</label>
          <PlanetarySearchBar
            selectedPlanetName={selectedPlanetName}
            onSelectFeature={onSelectGazetteerFeature}
          />
        </div>
      </Card>

      {/* 2. Physical Terrain Features */}
      <Card className="space-y-3 bg-[#111826] border border-[#243044] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#F8FAFC]">2. Terrain Features</span>
          <Badge variant="derived">Standardized 500m</Badge>
        </div>

        <div className="space-y-2 text-[#F8FAFC]">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedFeatures.elevation_relative ?? true}
              onChange={() => onToggleFeature("elevation_relative")}
              className="rounded text-accent"
            />
            <span className="font-medium text-[#F8FAFC]">Relative Elevation (m)</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedFeatures.slope_deg ?? true}
              onChange={() => onToggleFeature("slope_deg")}
              className="rounded text-accent"
            />
            <span className="font-medium text-[#F8FAFC]">Slope Gradient (deg)</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedFeatures.roughness_m ?? true}
              onChange={() => onToggleFeature("roughness_m")}
              className="rounded text-accent"
            />
            <span className="font-medium text-[#F8FAFC]">Surface Roughness (m)</span>
          </label>
        </div>

        <p className="text-[11px] text-[#94A3B8] leading-normal pt-2 border-t border-[#243044]">
          Weights default equal. Weights are exploratory, not calibrated.
        </p>
      </Card>

      {/* 3. Search Thresholds & Execution */}
      <Card className="space-y-3 bg-[#111826] border border-[#243044] p-4 shadow-sm">
        <span className="font-semibold text-[#F8FAFC] block">3. Comparison Parameters</span>

        <div>
          <div className="flex justify-between text-[11px] mb-1 font-mono">
            <span className="text-[#94A3B8]">Min Similarity Threshold:</span>
            <span className="text-accent font-bold">{similarityThreshold.toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1 font-mono">
            <span className="text-[#94A3B8]">Top Candidate Limit (k):</span>
            <span className="text-[#F8FAFC] font-bold">{topK}</span>
          </div>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-full bg-[#162033] border border-[#243044] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] font-mono focus:border-[#38BDF8] focus:outline-none"
          >
            <option value={10}>Top 10 candidates</option>
            <option value={20}>Top 20 candidates</option>
            <option value={50}>Top 50 candidates</option>
          </select>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={onRunAnalysis}
            disabled={isRunning || !selectedRegionId}
            className="w-full font-semibold py-2.5 shadow-sm"
          >
            {isRunning ? "Calculating..." : "Run terrain discovery"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
