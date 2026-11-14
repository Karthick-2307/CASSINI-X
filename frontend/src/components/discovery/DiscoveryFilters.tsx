import React from "react";
import { Card, Badge, Button } from "../ui";
import { Planet, Region, GazetteerItem } from "../../api/client";
import { PlanetarySearchBar } from "./PlanetarySearchBar";

export type TerrainCategory = "all" | "flat" | "rolling" | "rugged";

interface DiscoveryFiltersProps {
  planets: Planet[];
  selectedPlanetName: string;
  setSelectedPlanetName: (val: string) => void;
  regions: Region[];
  selectedRegionId: number | null;
  setSelectedRegionId: (val: number | null) => void;
  onSelectGazetteerFeature?: (item: GazetteerItem) => void;
  terrainCategory: TerrainCategory;
  setTerrainCategory: (val: TerrainCategory) => void;
  selectedFeatures: Record<string, boolean>;
  onToggleFeature: (feat: string) => void;
  featureWeights: Record<string, number>;
  onWeightChange: (feat: string, val: number) => void;
  similarityThreshold: number;
  setSimilarityThreshold: (val: number) => void;
  topK: number;
  setTopK: (val: number) => void;
  isRunning: boolean;
  onRunAnalysis: () => void;
  selectedForCompareCount: number;
  onOpenCompareModal: () => void;
}

export const DiscoveryFilters: React.FC<DiscoveryFiltersProps> = ({
  planets,
  selectedPlanetName,
  setSelectedPlanetName,
  regions,
  selectedRegionId,
  setSelectedRegionId,
  onSelectGazetteerFeature,
  terrainCategory,
  setTerrainCategory,
  selectedFeatures,
  onToggleFeature,
  featureWeights,
  onWeightChange,
  similarityThreshold,
  setSimilarityThreshold,
  topK,
  setTopK,
  isRunning,
  onRunAnalysis,
  selectedForCompareCount,
  onOpenCompareModal,
}) => {
  return (
    <Card className="lg:col-span-3 space-y-4 border-border">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
          Search Filters
        </h3>
        <Badge variant="derived">Vector Search</Badge>
      </div>

      {/* Planet Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-text-muted">Target Planetary Body</label>
        <div className="grid grid-cols-2 gap-2">
          {planets
            .filter((p) => p.name !== "Earth")
            .map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlanetName(p.name)}
                className={`py-1.5 px-3 rounded-btn text-xs font-mono font-medium border transition-colors ${
                  selectedPlanetName.toLowerCase() === p.name.toLowerCase()
                    ? "bg-accent-cyan/15 border-accent-cyan text-accent-cyan"
                    : "bg-raised border-border text-text-muted hover:text-text-primary"
                }`}
              >
                {p.name}
              </button>
            ))}
        </div>
      </div>

      {/* Live Planetary Terrain Search Bar */}
      <PlanetarySearchBar
        selectedPlanetName={selectedPlanetName}
        onSelectFeature={(item) => {
          if (item.region_id) {
            setSelectedRegionId(item.region_id);
          }
          onSelectGazetteerFeature?.(item);
        }}
      />

      {/* Target Reference Region */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-text-muted">Extraterrestrial Reference Area</label>
        <select
          value={selectedRegionId || ""}
          onChange={(e) => setSelectedRegionId(Number(e.target.value))}
          className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-cyan"
        >
          {regions.length === 0 ? (
            <option value="">No regions ingested yet</option>
          ) : (
            regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Terrain Category Filter */}
      <div className="space-y-1.5 pt-1 border-t border-border">
        <label className="text-xs font-mono text-text-muted">Terrain Roughness Category</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["all", "flat", "rolling", "rugged"] as TerrainCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setTerrainCategory(cat)}
              className={`py-1 px-2 rounded text-[11px] font-mono capitalize border ${
                terrainCategory === cat
                  ? "bg-accent-cyan/20 border-accent-cyan text-text-primary font-bold"
                  : "bg-raised/50 border-border/80 text-text-muted hover:text-text-primary"
              }`}
            >
              {cat === "all" ? "All Terrains" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Selection & Weights */}
      <div className="space-y-2 pt-1 border-t border-border">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-text-muted">Feature Dimension</span>
          <span className="text-text-muted/60 text-[10px]">Weight (Exploratory)</span>
        </div>

        {Object.keys(selectedFeatures).map((feat) => (
          <div key={feat} className="space-y-1 bg-raised/40 p-2 rounded border border-border/60">
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFeatures[feat]}
                  onChange={() => onToggleFeature(feat)}
                  className="rounded border-border text-accent-cyan focus:ring-0"
                />
                <span className="font-mono text-text-primary capitalize text-[11px]">
                  {feat.replace("_", " ")}
                </span>
              </label>
              <span className="font-mono text-[11px] text-accent-cyan">
                {selectedFeatures[feat] ? `${(featureWeights[feat] * 100).toFixed(0)}%` : "0%"}
              </span>
            </div>

            {selectedFeatures[feat] && (
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={featureWeights[feat] || 0.33}
                onChange={(e) => onWeightChange(feat, parseFloat(e.target.value))}
                className="w-full accent-accent-cyan cursor-pointer h-1"
              />
            )}
          </div>
        ))}
      </div>

      {/* Similarity Threshold Slider */}
      <div className="space-y-1.5 pt-1 border-t border-border">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-text-muted">Similarity Cutoff</span>
          <span className="text-accent-cyan">{similarityThreshold.toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="90"
          step="5"
          value={similarityThreshold}
          onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
          className="w-full accent-accent-cyan"
        />
      </div>

      {/* Top-K Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-text-muted">Top-K Candidate Limit</label>
        <select
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary focus:outline-none"
        >
          <option value={5}>Top 5 Candidates</option>
          <option value={10}>Top 10 Candidates</option>
          <option value={20}>Top 20 Candidates</option>
          <option value={50}>Top 50 Candidates</option>
        </select>
      </div>

      {/* Multi-compare trigger */}
      {selectedForCompareCount > 1 && (
        <div className="pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenCompareModal}
            className="w-full text-xs"
          >
            Compare {selectedForCompareCount} Selected Analogs
          </Button>
        </div>
      )}

      {/* Run Analysis Button */}
      <div className="pt-2">
        <Button
          variant="primary"
          size="sm"
          disabled={isRunning || !selectedRegionId}
          onClick={onRunAnalysis}
          className="w-full flex items-center justify-center space-x-2"
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Computing Matches...</span>
            </>
          ) : (
            <span>Run Discovery Query</span>
          )}
        </Button>
      </div>
    </Card>
  );
};

