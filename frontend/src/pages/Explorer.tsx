import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SectionHeading, Button } from "../components/ui";
import { PlanetaryMap } from "../components/PlanetaryMap";
import {
  api,
  Region,
  TerrainSummary,
  BboxSampleResponse,
  GazetteerItem,
} from "../api/client";
import {
  BboxInspector,
  RegionComparisonDrawer,
  LayerCatalogCard,
  BodyContextCard,
  LayerControlBar,
  RegionStatisticsCard,
  ExplorerSearchHeader,
  PlanetBody,
  BODY_DESCRIPTIONS,
} from "../components/explorer";

export const Explorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawBody = searchParams.get("body")?.toLowerCase();
  const activeBody: PlanetBody =
    rawBody === "moon" || rawBody === "mars" ? rawBody : "earth";

  // Regions state
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [regionSummary, setRegionSummary] = useState<TerrainSummary | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GazetteerItem | null>(null);

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

  const handleSelectBody = (body: PlanetBody) => {
    setSearchParams({ body });
    setSelectedFeature(null);
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

  // Handle gazetteer feature selection with instant provisioning
  const handleSelectGazetteerFeature = async (item: GazetteerItem) => {
    setSelectedFeature(item);
    let targetRegionId = item.region_id;
    if (!targetRegionId) {
      try {
        const activated = await api.activateGazetteerFeature(item.id);
        targetRegionId = activated.region_id;
        const planetList = await api.getPlanets();
        const curPlanet = planetList.find((p) => p.name.toLowerCase() === activeBody.toLowerCase());
        if (curPlanet) {
          const rList = await api.getRegions(curPlanet.id);
          setRegions(rList);
        }
      } catch {
        // fallback
      }
    }
    if (targetRegionId) {
      setSelectedRegionId(targetRegionId);
    }
  };

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

  const currentInfo = BODY_DESCRIPTIONS[activeBody];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header with Working Planet Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Terrain Intelligence"
          title="Planetary Terrain Explorer"
          subtitle="Explore topographic contours, slope distributions, and raster layers across planetary bodies."
        />

        <div className="inline-flex rounded-xl bg-slate-900/90 border border-white/10 p-1 space-x-1 self-start sm:self-auto backdrop-blur-md shadow-sm">
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
      <BodyContextCard activeBody={activeBody} />

      {/* Interactive Planetary Search & Location Header */}
      <ExplorerSearchHeader
        activeBody={activeBody}
        regions={regions}
        selectedRegionId={selectedRegionId}
        onSelectRegionId={(id) => {
          setSelectedRegionId(id);
          const r = regions.find((x) => x.id === id);
          if (r) {
            setSelectedFeature({
              id: `reg-${r.id}`,
              name: r.name,
              planet: activeBody,
              feature_type: "Study Area",
              lat: r.lat,
              lon: r.lon,
              elevation_approx_m: r.elevation_m,
              slope_deg: r.slope_deg,
              roughness_m: r.roughness_m,
              description: r.description || "Ingested reference study area",
              is_ingested: true,
              region_id: r.id,
            });
          }
        }}
        selectedFeature={selectedFeature}
        onSelectFeature={handleSelectGazetteerFeature}
      />

      {/* Main Map & Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Center Map Viewport (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-primary">
              Interactive Topographic Viewport
            </span>
            <span className="text-[11px] font-mono text-text-muted">
              Shift + Drag on map to sample bounding box
            </span>
          </div>

          {/* Interactive MapLibre Map */}
          <PlanetaryMap
            planet={activeBody}
            activeRegionId={selectedRegionId}
            targetCoords={selectedFeature ? { lon: selectedFeature.lon, lat: selectedFeature.lat } : null}
            showHillshade={showHillshade}
            showSlope={showSlope}
            onBboxSelected={handleBboxSelected}
            className="h-[520px]"
          />

          {/* Layer Control Bar */}
          <LayerControlBar
            showHillshade={showHillshade}
            setShowHillshade={setShowHillshade}
            showSlope={showSlope}
            setShowSlope={setShowSlope}
            currentInfo={currentInfo}
          />
        </div>

        {/* Right Inspection & Comparison Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <LayerCatalogCard datasetName={currentInfo.dataset} />
          <RegionStatisticsCard regionSummary={regionSummary} />
          <BboxInspector
            bboxResult={bboxResult}
            isSampling={isSampling}
            bboxCoords={bboxCoords}
          />
          <RegionComparisonDrawer
            isComparing={isComparing}
            setIsComparing={setIsComparing}
            compareRegionId={compareRegionId}
            setCompareRegionId={setCompareRegionId}
            regionSummary={regionSummary}
            compareSummary={compareSummary}
          />
        </div>
      </div>
    </div>
  );
};
