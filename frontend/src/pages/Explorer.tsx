import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SectionHeading,
  Card,
  Badge,
  Button,
} from "../components/ui";
import { PlanetaryMap } from "../components/PlanetaryMap";
import {
  api,
  Region,
  TerrainSummary,
  BboxSampleResponse,
} from "../api/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PlanetBody = "earth" | "moon" | "mars";

export const Explorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawBody = searchParams.get("body")?.toLowerCase();
  const activeBody: PlanetBody =
    rawBody === "moon" || rawBody === "mars" ? rawBody : "earth";

  // Regions state
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [regionSummary, setRegionSummary] = useState<TerrainSummary | null>(null);

  // Layer toggles
  const [showHillshade, setShowHillshade] = useState<boolean>(true);
  const [showSlope, setShowSlope] = useState<boolean>(false);

  // Bounding box sample state
  const [bboxResult, setBboxResult] = useState<BboxSampleResponse | null>(null);
  const [isSampling, setIsSampling] = useState<boolean>(false);
  const [bboxCoords, setBboxCoords] = useState<[number, number, number, number] | null>(null);

  // Region comparison state
  const [compareRegionId, setCompareRegionId] = useState<number | null>(null);
  const [compareSummary, setCompareSummary] = useState<TerrainSummary | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Sync URL query
  const handleSelectBody = (body: PlanetBody) => {
    setSearchParams({ body });
  };

  useEffect(() => {
    if (!searchParams.get("body")) {
      setSearchParams({ body: "earth" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Load regions for active body
  useEffect(() => {
    api.getPlanets()
      .then((planetList) => {
        const currentPlanet = planetList.find(
          (p) => p.name.toLowerCase() === activeBody.toLowerCase()
        );
        if (currentPlanet) {
          api.getRegions(currentPlanet.id).then((rList) => {
            setRegions(rList);
            if (rList.length > 0) {
              setSelectedRegionId(rList[0].id);
            } else {
              setSelectedRegionId(null);
            }
          });
        }
      })
      .catch(() => {});
  }, [activeBody]);

  // Load terrain summary when selected region changes
  useEffect(() => {
    if (selectedRegionId) {
      api.getTerrainSummary(selectedRegionId)
        .then((summary) => setRegionSummary(summary))
        .catch(() => setRegionSummary(null));
    } else {
      setRegionSummary(null);
    }
  }, [selectedRegionId]);

  // Load compare region summary
  useEffect(() => {
    if (compareRegionId) {
      api.getTerrainSummary(compareRegionId)
        .then((s) => setCompareSummary(s))
        .catch(() => setCompareSummary(null));
    } else {
      setCompareSummary(null);
    }
  }, [compareRegionId]);

  // Handle bbox selection
  const handleBboxSelected = (bbox: [number, number, number, number]) => {
    setBboxCoords(bbox);
    setIsSampling(true);
    api.sampleTerrainBbox({
      min_lon: bbox[0],
      min_lat: bbox[1],
      max_lon: bbox[2],
      max_lat: bbox[3],
      region_id: selectedRegionId || undefined,
      planet_name: activeBody,
    })
      .then((res) => setBboxResult(res))
      .catch(() => {
        setBboxResult({
          status: "outside_coverage",
          message: "Request failed to evaluate sample area.",
          cell_count: 0,
        });
      })
      .finally(() => setIsSampling(false));
  };

  const bodyDescriptions: Record<
    PlanetBody,
    { title: string; dataset: string; resolution: string; radius: string; gravity: string; desc: string }
  > = {
    earth: {
      title: "Earth (Terrestrial Baseline)",
      dataset: "NASA SRTM 1-Arc-Second (30m)",
      resolution: "30 meters",
      radius: "6,371.0 km",
      gravity: "9.807 m/s²",
      desc: "Lanzarote Volcanic Field: basaltic lava flows and volcanic cones used as reference analog study terrain.",
    },
    moon: {
      title: "The Moon (Lunar Surface)",
      dataset: "LRO LOLA Global Digital Elevation Model (118m)",
      resolution: "118 meters",
      radius: "1,737.4 km",
      gravity: "1.620 m/s²",
      desc: "Mare Tranquillitatis (Apollo 11 Basin): basaltic mare plains with impact craters and regolith mantling.",
    },
    mars: {
      title: "Mars (Martian Surface)",
      dataset: "MGS MOLA MEGDR Global DEM (463m)",
      resolution: "463 meters",
      radius: "3,389.5 km",
      gravity: "3.710 m/s²",
      desc: "Jezero Crater Floor & Delta: ancient lacustrine sedimentary fan and volcanic crater floor.",
    },
  };

  const currentInfo = bodyDescriptions[activeBody];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header with Working Planet Switcher */}
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
            <p className="text-xs text-text-muted max-w-3xl leading-relaxed">
              {currentInfo.desc}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono shrink-0">
            <div className="p-2.5 bg-raised rounded-btn border border-border text-center min-w-[100px]">
              <div className="text-text-muted text-[10px] uppercase">Mean Radius</div>
              <div className="font-bold text-text-primary text-sm">{currentInfo.radius}</div>
            </div>
            <div className="p-2.5 bg-raised rounded-btn border border-border text-center min-w-[100px]">
              <div className="text-text-muted text-[10px] uppercase">Surface Gravity</div>
              <div className="font-bold text-accent-cyan text-sm">{currentInfo.gravity}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Map & Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Center Map Viewport (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-text-muted">Target Study Area:</span>
              <select
                value={selectedRegionId || ""}
                onChange={(e) => setSelectedRegionId(Number(e.target.value))}
                className="bg-raised border border-border rounded-btn px-2.5 py-1 text-xs text-text-primary font-mono"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] font-mono text-text-muted">
              Shift + Drag on map to sample bounding box
            </span>
          </div>

          {/* Interactive MapLibre Map */}
          <PlanetaryMap
            planet={activeBody}
            activeRegionId={selectedRegionId}
            showHillshade={showHillshade}
            showSlope={showSlope}
            onBboxSelected={handleBboxSelected}
            className="h-[520px]"
          />

          {/* Layer Control Bar */}
          <div className="p-3 bg-panel border border-border rounded-panel flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <span className="text-text-muted font-bold uppercase text-[10px]">Active Layers:</span>
              <label className="flex items-center space-x-1.5 cursor-pointer text-text-primary">
                <input
                  type="checkbox"
                  checked={showHillshade}
                  onChange={(e) => setShowHillshade(e.target.checked)}
                  className="rounded border-border text-accent-cyan"
                />
                <span>Elevation Hillshade (Ingested)</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer text-text-primary">
                <input
                  type="checkbox"
                  checked={showSlope}
                  onChange={(e) => setShowSlope(e.target.checked)}
                  className="rounded border-border text-accent-cyan"
                />
                <span>Slope Heatmap (Derived)</span>
              </label>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-text-muted">
              <span>DEM: {currentInfo.dataset}</span>
              <span>|</span>
              <span className="text-accent-cyan">Native Res: {currentInfo.resolution}</span>
            </div>
          </div>
        </div>

        {/* Right Inspection & Comparison Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Layer Inventory & Status */}
          <Card className="space-y-3 border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-heading font-bold text-text-primary uppercase tracking-wide">
                Dataset Layer Catalog
              </h3>
              <Badge variant="neutral">Status</Badge>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {/* Layer 1: Ingested DEM */}
              <div className="flex items-center justify-between p-2 rounded bg-raised border border-border">
                <div className="space-y-0.5">
                  <div className="text-text-primary font-bold text-[11px]">{currentInfo.dataset}</div>
                  <div className="text-text-muted text-[10px]">Full Raster Ingested (500m scale)</div>
                </div>
                <Badge variant="measured">Active</Badge>
              </div>

              {/* Disabled Layers with Explicit Reasons (Rule 6.1) */}
              <div className="flex items-center justify-between p-2 rounded bg-raised/40 border border-border/50 opacity-60">
                <div className="space-y-0.5">
                  <div className="text-text-muted font-medium text-[11px]">HiRISE / LROC NAC High-Res</div>
                  <div className="text-text-muted/70 text-[10px]">0.5m Local Optical Mosaic</div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-base text-text-muted border border-border">
                  Not ingested
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-raised/40 border border-border/50 opacity-60">
                <div className="space-y-0.5">
                  <div className="text-text-muted font-medium text-[11px]">Venus Magellan SAR Radar</div>
                  <div className="text-text-muted/70 text-[10px]">Altimetric Radar Grid</div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-base text-text-muted border border-border">
                  Not ingested
                </span>
              </div>
            </div>
          </Card>

          {/* Region Statistics Card */}
          <Card className="space-y-3 border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-heading font-bold text-text-primary uppercase tracking-wide">
                Real Terrain Statistics
              </h3>
              {regionSummary && (
                <Badge variant="derived">{regionSummary.total_cells} Cells</Badge>
              )}
            </div>

            {regionSummary ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="p-2.5 bg-raised rounded-btn space-y-1">
                  <div className="font-bold text-text-primary">{regionSummary.region_name}</div>
                  <div className="text-[11px] text-text-muted">
                    Spatial Scale Window: {regionSummary.scale_m}m | Coverage: 100%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-panel rounded border border-border">
                    <div className="text-text-muted text-[10px]">Mean Relative Elev</div>
                    <div className="font-bold text-text-primary text-xs">
                      {regionSummary.elevation_relative_mean?.toFixed(1) ?? "--"} m
                    </div>
                  </div>
                  <div className="p-2 bg-panel rounded border border-border">
                    <div className="text-text-muted text-[10px]">Elev Std Deviation</div>
                    <div className="font-bold text-text-primary text-xs">
                      &plusmn;{regionSummary.elevation_relative_std?.toFixed(1) ?? "--"} m
                    </div>
                  </div>
                  <div className="p-2 bg-panel rounded border border-border">
                    <div className="text-text-muted text-[10px]">Mean Slope</div>
                    <div className="font-bold text-accent-cyan text-xs">
                      {regionSummary.slope_deg_mean?.toFixed(2) ?? "--"}°
                    </div>
                  </div>
                  <div className="p-2 bg-panel rounded border border-border">
                    <div className="text-text-muted text-[10px]">Max Slope</div>
                    <div className="font-bold text-status-warn text-xs">
                      {regionSummary.slope_deg_max?.toFixed(2) ?? "--"}°
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-panel rounded border border-border text-[11px] flex justify-between items-center">
                  <span className="text-text-muted">Mean Surface Roughness:</span>
                  <span className="font-bold text-text-primary">
                    {regionSummary.roughness_m_mean?.toFixed(2) ?? "--"} m
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-text-muted font-mono">
                Loading region terrain statistics...
              </div>
            )}
          </Card>

          {/* User-Drawn Bbox Sampling Results */}
          <Card className="space-y-3 border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-heading font-bold text-text-primary uppercase tracking-wide">
                Bbox Sampling Inspector
              </h3>
              {bboxResult && (
                <Badge variant={bboxResult.status === "ok" ? "ok" : "warn"}>
                  {bboxResult.status === "ok" ? `${bboxResult.cell_count} Cells` : "Out of bounds"}
                </Badge>
              )}
            </div>

            {isSampling ? (
              <div className="py-8 text-center text-xs font-mono text-text-muted animate-pulse">
                Sampling raster cells within bounding box...
              </div>
            ) : bboxResult ? (
              bboxResult.status === "ok" ? (
                <div className="space-y-2 text-xs font-mono">
                  {bboxCoords && (
                    <div className="text-[10px] text-text-muted">
                      Sample Extent: [{bboxCoords.map((n) => n.toFixed(2)).join(", ")}]
                    </div>
                  )}
                  <div className="p-2 bg-status-ok/10 border border-status-ok/20 rounded text-[11px] text-status-ok">
                    {bboxResult.message}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <div className="p-2 bg-raised rounded border border-border text-center">
                      <div className="text-text-muted">Elev Mean</div>
                      <div className="font-bold text-text-primary">{bboxResult.elevation_relative?.mean} m</div>
                    </div>
                    <div className="p-2 bg-raised rounded border border-border text-center">
                      <div className="text-text-muted">Slope Mean</div>
                      <div className="font-bold text-accent-cyan">{bboxResult.slope_deg?.mean}°</div>
                    </div>
                    <div className="p-2 bg-raised rounded border border-border text-center">
                      <div className="text-text-muted">Roughness</div>
                      <div className="font-bold text-text-primary">{bboxResult.roughness_m?.mean} m</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-status-warn/10 border border-status-warn/30 rounded text-xs font-mono text-status-warn space-y-1">
                  <div className="font-bold">Outside Coverage</div>
                  <p className="text-[11px] text-text-muted leading-tight">
                    {bboxResult.message}
                  </p>
                </div>
              )
            ) : (
              <div className="py-6 text-center text-xs text-text-muted font-mono space-y-1">
                <div>No active bounding box selection</div>
                <p className="text-[10px] text-text-muted/60">
                  Hold Shift and drag over the map to query cells directly from processed DEMs.
                </p>
              </div>
            )}
          </Card>

          {/* Region Comparison Mode Toggle */}
          <div className="pt-2">
            <Button
              variant={isComparing ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsComparing(!isComparing)}
              className="w-full text-xs font-mono"
            >
              {isComparing ? "Close Region Comparison" : "Compare With Another Region"}
            </Button>
          </div>

          {/* Side-by-Side Region Comparison Drawer */}
          {isComparing && (
            <Card className="space-y-4 border-accent-cyan/50 bg-raised/80">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h4 className="text-xs font-heading font-bold text-text-primary uppercase">
                  Select Comparison Target
                </h4>
                <Badge variant="planned">Side-by-Side</Badge>
              </div>

              <select
                value={compareRegionId || ""}
                onChange={(e) => setCompareRegionId(Number(e.target.value))}
                className="w-full bg-panel border border-border rounded-btn px-2.5 py-1.5 text-xs text-text-primary font-mono"
              >
                <option value="">Select second region to compare...</option>
                <option value={1}>Lanzarote Volcanic Field (Earth)</option>
                <option value={2}>Jezero Crater Floor & Delta (Mars)</option>
                <option value={3}>Mare Tranquillitatis Basin (Moon)</option>
              </select>

              {compareSummary && regionSummary && (
                <div className="space-y-3 text-xs font-mono">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-panel text-text-muted text-[10px]">
                      <tr>
                        <th className="p-1.5">Metric</th>
                        <th className="p-1.5 text-right">{regionSummary.region_name.split(" ")[0]}</th>
                        <th className="p-1.5 text-right">{compareSummary.region_name.split(" ")[0]}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="p-1.5 text-text-muted">Slope Mean</td>
                        <td className="p-1.5 text-right font-bold text-accent-cyan">
                          {regionSummary.slope_deg_mean?.toFixed(2)}°
                        </td>
                        <td className="p-1.5 text-right font-bold text-status-ok">
                          {compareSummary.slope_deg_mean?.toFixed(2)}°
                        </td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-text-muted">Slope Max</td>
                        <td className="p-1.5 text-right">{regionSummary.slope_deg_max?.toFixed(1)}°</td>
                        <td className="p-1.5 text-right">{compareSummary.slope_deg_max?.toFixed(1)}°</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-text-muted">Roughness</td>
                        <td className="p-1.5 text-right">{regionSummary.roughness_m_mean?.toFixed(2)} m</td>
                        <td className="p-1.5 text-right">{compareSummary.roughness_m_mean?.toFixed(2)} m</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Histogram comparison */}
                  <div className="h-32 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: "Mean Slope",
                            regionA: regionSummary.slope_deg_mean,
                            regionB: compareSummary.slope_deg_mean,
                          },
                          {
                            name: "Roughness",
                            regionA: regionSummary.roughness_m_mean,
                            regionB: compareSummary.roughness_m_mean,
                          },
                        ]}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0D1322",
                            borderColor: "#1E293B",
                            fontSize: "11px",
                          }}
                        />
                        <Bar dataKey="regionA" fill="#0284C7" name={regionSummary.region_name.split(" ")[0]} />
                        <Bar dataKey="regionB" fill="#10B981" name={compareSummary.region_name.split(" ")[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
