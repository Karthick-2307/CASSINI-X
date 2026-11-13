import React, { useState } from "react";
import {
  SectionHeading,
  Card,
  Badge,
  Button,
} from "../components/ui";
import { EarthMap } from "../components/EarthMap";

export const Discovery: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<string>("mars");
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.75);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Analog Search Engine"
          title="Discovery Explorer"
          subtitle="Pair planetary reference regions on Mars and the Moon with ranked Earth analogs using multi-attribute topographic distance metrics."
        />
        <Badge variant="planned">Phase 6 Active Integration</Badge>
      </div>

      {/* 3-Column Geospatial Exploration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar (3 cols) */}
        <Card className="lg:col-span-3 space-y-5 border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
              Target Filters
            </h3>
            <span
              className="text-[11px] font-mono text-status-warn cursor-help"
              title="Controls will be dynamically connected to real raster bounds in Part 6"
            >
              Enabled in Part 6
            </span>
          </div>

          {/* Planet Selection */}
          <div className="space-y-1.5 opacity-60">
            <label className="text-xs font-mono text-text-muted">Target Planetary Body</label>
            <select
              disabled
              value={selectedPlanet}
              onChange={(e) => setSelectedPlanet(e.target.value)}
              className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary cursor-not-allowed"
              title="Enabled in Part 6"
            >
              <option value="mars">Mars (MOLA / CTX)</option>
              <option value="moon">The Moon (LOLA)</option>
            </select>
          </div>

          {/* Target Region */}
          <div className="space-y-1.5 opacity-60">
            <label className="text-xs font-mono text-text-muted">Reference Region</label>
            <select
              disabled
              className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary cursor-not-allowed"
              title="Enabled in Part 6"
            >
              <option>Jezero Crater (Deltaic Fan)</option>
              <option>Olympus Mons (Volcanic Shield)</option>
              <option>Gale Crater (Mount Sharp)</option>
              <option>Shackleton Crater (South Pole)</option>
            </select>
          </div>

          {/* Terrain Category */}
          <div className="space-y-1.5 opacity-60">
            <label className="text-xs font-mono text-text-muted">Geomorphic Category</label>
            <select
              disabled
              className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary cursor-not-allowed"
              title="Enabled in Part 6"
            >
              <option>All Terrain Categories</option>
              <option>Impact Crater / Rim</option>
              <option>Basaltic Volcanic Field</option>
              <option>Permafrost / Cold Desert</option>
              <option>Hyper-Arid Basin</option>
            </select>
          </div>

          {/* Physical Features Selection */}
          <div className="space-y-2 opacity-60">
            <label className="text-xs font-mono text-text-muted">Feature Space Dimensions</label>
            <div className="space-y-1.5 text-xs font-mono">
              <label className="flex items-center space-x-2 text-text-muted cursor-not-allowed">
                <input type="checkbox" checked disabled className="rounded border-border" />
                <span>Relative Elevation</span>
              </label>
              <label className="flex items-center space-x-2 text-text-muted cursor-not-allowed">
                <input type="checkbox" checked disabled className="rounded border-border" />
                <span>Slope Inclination</span>
              </label>
              <label className="flex items-center space-x-2 text-text-muted cursor-not-allowed">
                <input type="checkbox" checked disabled className="rounded border-border" />
                <span>Surface Roughness</span>
              </label>
            </div>
          </div>

          {/* Similarity Threshold Slider */}
          <div className="space-y-1.5 opacity-60">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted">Min Similarity</span>
              <span className="text-accent-cyan">{(similarityThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              disabled
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              className="w-full cursor-not-allowed"
              title="Enabled in Part 6"
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" size="sm" disabled className="w-full">
              Run Discovery Query
            </Button>
            <p className="text-[11px] font-mono text-text-muted/60 text-center mt-2">
              Query execution available in Part 6
            </p>
          </div>
        </Card>

        {/* Center Map Area (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-text-primary">
              Global Earth Candidates Viewport
            </h3>
            <span className="text-xs font-mono text-text-muted">Projection: WGS84 Web Mercator</span>
          </div>

          <EarthMap candidates={[]} className="h-[480px]" />

          <div className="p-3 bg-panel border border-border rounded-panel text-xs text-text-muted font-mono flex items-center justify-between">
            <span>Synchronized with active target region coordinates.</span>
            <span className="text-status-warn">Empty state: No active run</span>
          </div>
        </div>

        {/* Right Candidate Table & Detail Panel (3 cols) */}
        <Card className="lg:col-span-3 space-y-4 border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
              Ranked Candidates
            </h3>
            <Badge variant="derived">0 Matches</Badge>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Ranked analog sites with separate similarity, confidence, and traversability scores will populate here after query execution.
          </p>

          <div className="py-12 px-4 border border-dashed border-border rounded-btn text-center space-y-2">
            <div className="text-text-muted text-xs font-mono">
              No analog candidates active
            </div>
            <p className="text-[11px] text-text-muted/70">
              Select a target region and run similarity calculation in Part 6.
            </p>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <h4 className="text-xs font-heading font-semibold text-text-primary">
              Selected Site Detail
            </h4>
            <div className="p-3 bg-raised rounded-btn text-xs font-mono text-text-muted/70 space-y-1">
              <div>Coordinates: --</div>
              <div>Elevation Delta: --</div>
              <div>Slope Fit: --</div>
              <div>Roughness Affinity: --</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
