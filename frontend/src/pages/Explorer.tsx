import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SectionHeading,
  Card,
  Badge,
  Button,
} from "../components/ui";
import { EarthMap } from "../components/EarthMap";

type PlanetBody = "earth" | "moon" | "mars";

export const Explorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawBody = searchParams.get("body")?.toLowerCase();
  const activeBody: PlanetBody =
    rawBody === "moon" || rawBody === "mars" ? rawBody : "earth";

  const handleSelectBody = (body: PlanetBody) => {
    setSearchParams({ body });
  };

  useEffect(() => {
    if (!searchParams.get("body")) {
      setSearchParams({ body: "earth" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const bodyDescriptions: Record<PlanetBody, { title: string; dataset: string; radius: string; gravity: string; desc: string }> = {
    earth: {
      title: "Earth (Terrestrial Baseline)",
      dataset: "NASADEM / SRTM (30m) & Copernicus GLO-30",
      radius: "6,371.0 km",
      gravity: "9.807 m/s²",
      desc: "Reference topographic basemap used for cross-planetary candidate discovery and morphological verification.",
    },
    moon: {
      title: "The Moon (Lunar Surface)",
      dataset: "LOLA Altimeter (LRO) & LROC NAC (0.5m)",
      radius: "1,737.4 km",
      gravity: "1.620 m/s²",
      desc: "High-latitude impact craters, permanently shadowed polar depressions, and highland regolith terrains.",
    },
    mars: {
      title: "Mars (Martian Surface)",
      dataset: "MOLA (MGS, 463m) & CTX Regional DEMs (6m)",
      radius: "3,389.5 km",
      gravity: "3.710 m/s²",
      desc: "Shield volcanic caldera, Valles Marineris canyon systems, and sedimentary fan deposits (Jezero Crater).",
    },
  };

  const currentInfo = bodyDescriptions[activeBody];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header with Real Working Planet Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Terrain Intelligence"
          title="Planetary Terrain Explorer"
          subtitle="Explore topographic contours, slope distributions, and raster layers across planetary bodies."
        />

        {/* Planet Switcher Buttons */}
        <div className="inline-flex rounded-panel bg-panel border border-border p-1 space-x-1 self-start sm:self-auto">
          <Button
            variant={activeBody === "earth" ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleSelectBody("earth")}
          >
            Earth
          </Button>
          <Button
            variant={activeBody === "moon" ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleSelectBody("moon")}
          >
            Moon
          </Button>
          <Button
            variant={activeBody === "mars" ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleSelectBody("mars")}
          >
            Mars
          </Button>
        </div>
      </div>

      {/* Planetary Body Context Card */}
      <Card className="bg-gradient-to-r from-panel via-raised to-panel border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-heading font-bold text-text-primary">
                {currentInfo.title}
              </h2>
              <Badge variant="measured">Active Viewport: {activeBody.toUpperCase()}</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
              {currentInfo.desc}
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono text-text-muted shrink-0 pt-2 md:pt-0">
            <div>
              <span className="block text-[10px] uppercase text-text-muted/70">Mean Radius</span>
              <span className="text-text-primary font-bold">{currentInfo.radius}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-text-muted/70">Surface Gravity</span>
              <span className="text-accent-cyan font-bold">{currentInfo.gravity}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-text-muted/70">Primary DEM</span>
              <span className="text-accent-blue font-bold">{currentInfo.dataset.split(" ")[0]}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2-Column Grid: Map Viewport & Layer Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Area (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-text-primary">
              Topographic Viewport ({activeBody.toUpperCase()})
            </h3>
            <span className="text-xs font-mono text-text-muted">
              Spatial Scale: 1000m Window
            </span>
          </div>

          {activeBody === "earth" ? (
            <EarthMap candidates={[]} className="h-[500px]" />
          ) : (
            <div className="h-[500px] rounded-panel border border-border bg-panel flex flex-col items-center justify-center p-8 text-center space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base/80 pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-raised border border-border flex items-center justify-center text-text-muted">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h4 className="text-base font-heading font-bold text-text-primary">
                {activeBody === "moon" ? "Lunar Altimetry Raster Canvas" : "Martian MOLA / CTX Raster Canvas"}
              </h4>
              <p className="text-xs text-text-muted max-w-md leading-relaxed">
                Direct raster inspection and cross-sectional slicing for {activeBody.toUpperCase()} datasets will be activated in Part 6 upon completion of the Part 4 raster ingestion engine.
              </p>
              <Badge variant="planned">Available in Part 6</Badge>
            </div>
          )}
        </div>

        {/* Layer List Panel (4 cols) */}
        <Card className="lg:col-span-4 space-y-5 border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
              Topographic Layers
            </h3>
            <span className="text-[11px] font-mono text-status-warn">Available in Part 6</span>
          </div>

          <div className="space-y-3">
            {/* Layer 1 */}
            <div className="p-3 bg-raised rounded-btn border border-border space-y-2 opacity-70">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Digital Elevation Model (DEM)</span>
                <Badge variant="measured">Active Base</Badge>
              </div>
              <p className="text-[11px] text-text-muted">
                Continuous surface elevation field normalized to reference datum.
              </p>
            </div>

            {/* Layer 2 */}
            <div className="p-3 bg-raised rounded-btn border border-border space-y-2 opacity-50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Slope Inclination (Degrees)</span>
                <Badge variant="derived">Part 6</Badge>
              </div>
              <p className="text-[11px] text-text-muted">
                Local slope gradient vector derived using 3x3 Sobel kernels.
              </p>
            </div>

            {/* Layer 3 */}
            <div className="p-3 bg-raised rounded-btn border border-border space-y-2 opacity-50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Surface Roughness</span>
                <Badge variant="derived">Part 6</Badge>
              </div>
              <p className="text-[11px] text-text-muted">
                Standard deviation of residual elevation relative to planar trend.
              </p>
            </div>

            {/* Layer 4 */}
            <div className="p-3 bg-raised rounded-btn border border-border space-y-2 opacity-50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Rock Abundance Proxy</span>
                <Badge variant="inferred">Part 7</Badge>
              </div>
              <p className="text-[11px] text-text-muted">
                Thermal inertia derivation identifying boulder field hazards.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
