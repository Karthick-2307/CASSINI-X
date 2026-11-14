import React, { useState, useEffect } from "react";
import {
  SectionHeading,
  Card,
  Badge,
} from "../components/ui";
import {
  api,
  Region,
  LandingScreeningResponse,
  RoutePlanResponse,
} from "../api/client";
import {
  LandingScreeningTab,
  RoverRoutingTab,
  TraversalComparisonTab,
} from "../components/mission";

type MissionTab = "screening" | "routes" | "comparison";

export const Mission: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MissionTab>("screening");
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [loadingRegions, setLoadingRegions] = useState(true);

  // Screening state
  const [maxSlopeDeg, setMaxSlopeDeg] = useState<number>(10.0);
  const [maxRoughnessM, setMaxRoughnessM] = useState<number>(5.0);
  const [screeningResult, setScreeningResult] = useState<LandingScreeningResponse | null>(null);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screeningError, setScreeningError] = useState<string | null>(null);

  // Pathfinding state
  const [startLon, setStartLon] = useState<number>(77.40);
  const [startLat, setStartLat] = useState<number>(18.35);
  const [goalLon, setGoalLon] = useState<number>(77.65);
  const [goalLat, setGoalLat] = useState<number>(18.45);
  const [routeMode, setRouteMode] = useState<"balanced" | "shortest" | "safest">("balanced");
  const [maxTraverseSlope, setMaxTraverseSlope] = useState<number>(25.0);
  const [routeResult, setRouteResult] = useState<RoutePlanResponse | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Load regions
  useEffect(() => {
    async function load() {
      try {
        setLoadingRegions(true);
        const data = await api.getRegions();
        setRegions(data);
        if (data.length > 0) {
          const jezero = data.find((r) => r.name.toLowerCase().includes("jezero")) || data[0];
          setSelectedRegionId(jezero.id);
          applyPresetCoords(jezero);
        }
      } catch (err: unknown) {
        console.error("Failed to load regions:", err);
      } finally {
        setLoadingRegions(false);
      }
    }
    load();
  }, []);

  const getRegionBounds = (region: Region): [number, number, number, number] => {
    if (region.bbox_json) {
      try {
        const parsed = JSON.parse(region.bbox_json);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return [parsed[0], parsed[1], parsed[2], parsed[3]];
        }
      } catch {
        // Fallback
      }
    }
    return [region.lon - 0.25, region.lat - 0.25, region.lon + 0.25, region.lat + 0.25];
  };

  const applyPresetCoords = (region: Region) => {
    const [minLon, minLat, maxLon, maxLat] = getRegionBounds(region);
    const sLon = Number((minLon + (maxLon - minLon) * 0.25).toFixed(4));
    const sLat = Number((minLat + (maxLat - minLat) * 0.25).toFixed(4));
    const gLon = Number((minLon + (maxLon - minLon) * 0.75).toFixed(4));
    const gLat = Number((minLat + (maxLat - minLat) * 0.75).toFixed(4));

    setStartLon(sLon);
    setStartLat(sLat);
    setGoalLon(gLon);
    setGoalLat(gLat);
  };

  const handleRegionChange = (regId: number) => {
    setSelectedRegionId(regId);
    const reg = regions.find((r) => r.id === regId);
    if (reg) applyPresetCoords(reg);
    setScreeningResult(null);
    setRouteResult(null);
  };

  const handleRunScreening = async () => {
    if (!selectedRegionId) return;
    try {
      setScreeningLoading(true);
      setScreeningError(null);
      const res = await api.runLandingScreening({
        region_id: selectedRegionId,
        max_slope_deg: maxSlopeDeg,
        max_roughness_m: maxRoughnessM,
      });
      setScreeningResult(res);
    } catch (err: unknown) {
      setScreeningError(err instanceof Error ? err.message : "Screening calculation failed.");
    } finally {
      setScreeningLoading(false);
    }
  };

  const handleRunPathfinding = async () => {
    if (!selectedRegionId) return;
    try {
      setRouteLoading(true);
      setRouteError(null);
      const res = await api.planRoverRoute({
        region_id: selectedRegionId,
        start_coords: [startLon, startLat],
        goal_coords: [goalLon, goalLat],
        optimization_mode: routeMode,
        max_slope_deg: maxTraverseSlope,
      });
      setRouteResult(res);
      setSelectedRouteIndex(0);
    } catch (err: unknown) {
      setRouteError(err instanceof Error ? err.message : "Rover pathfinding calculation failed.");
    } finally {
      setRouteLoading(false);
    }
  };

  const activeRegion = regions.find((r) => r.id === selectedRegionId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Operations & Traversability"
          title="Mission Suitability & Rover Pathfinding"
          subtitle="Preliminary landing-site terrain screening, 8-connected A* traverse routing, and obstacle avoidance on real elevation rasters."
        />
        <div className="flex items-center space-x-2">
          <Badge variant="ok">Part 7 Active</Badge>
          <Badge variant="neutral">Strict Admissibility</Badge>
        </div>
      </div>

      {/* Mandatory Non-Certified Banner */}
      <Card className="border-amber-800/60 bg-amber-950/20 p-4 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-status-warn animate-pulse" />
          <h3 className="text-xs font-heading font-bold text-text-primary tracking-wide uppercase">
            Mandatory Decision Support Advisory
          </h3>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Preliminary screening for scientific decision support. Not certified landing or habitation safety. Operational suitability evaluates topographic smoothness and traverse slope constraints on ingested DEM rasters.
        </p>
      </Card>

      {/* Region Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-panel border border-border rounded-panel">
        <div className="space-y-1">
          <label className="text-xs font-mono font-semibold uppercase text-text-muted">
            Target Planetary Region
          </label>
          <p className="text-xs text-text-secondary">
            Select a planetary region with active elevation rasters to evaluate.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedRegionId || ""}
            onChange={(e) => handleRegionChange(Number(e.target.value))}
            className="bg-raised border border-border text-text-primary text-xs font-mono rounded-btn px-4 py-2 focus:outline-none focus:border-accent-cyan"
            disabled={loadingRegions}
          >
            {regions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name} ({reg.planet_id === 1 ? "Earth" : reg.planet_id === 2 ? "Mars" : "Moon"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("screening")}
            className={`px-4 py-2 rounded-btn text-xs font-mono font-medium transition-colors ${
              activeTab === "screening"
                ? "bg-panel text-accent-cyan border border-border shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-panel/40"
            }`}
          >
            Landing-Region Screening
          </button>
          <button
            onClick={() => setActiveTab("routes")}
            className={`px-4 py-2 rounded-btn text-xs font-mono font-medium transition-colors ${
              activeTab === "routes"
                ? "bg-panel text-accent-cyan border border-border shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-panel/40"
            }`}
          >
            A* Rover Pathfinding
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-4 py-2 rounded-btn text-xs font-mono font-medium transition-colors ${
              activeTab === "comparison"
                ? "bg-panel text-accent-cyan border border-border shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-panel/40"
            }`}
          >
            Traversal Mode Comparison
          </button>
        </div>
      </div>

      {/* TAB 1: LANDING-REGION SCREENING */}
      {activeTab === "screening" && (
        <LandingScreeningTab
          maxSlopeDeg={maxSlopeDeg}
          setMaxSlopeDeg={setMaxSlopeDeg}
          maxRoughnessM={maxRoughnessM}
          setMaxRoughnessM={setMaxRoughnessM}
          screeningResult={screeningResult}
          screeningLoading={screeningLoading}
          screeningError={screeningError}
          onRunScreening={handleRunScreening}
        />
      )}

      {/* TAB 2: ROVER PATHFINDING */}
      {activeTab === "routes" && (
        <RoverRoutingTab
          activeRegion={activeRegion}
          startLon={startLon}
          setStartLon={setStartLon}
          startLat={startLat}
          setStartLat={setStartLat}
          goalLon={goalLon}
          setGoalLon={setGoalLon}
          goalLat={goalLat}
          setGoalLat={setGoalLat}
          routeMode={routeMode}
          setRouteMode={setRouteMode}
          maxTraverseSlope={maxTraverseSlope}
          setMaxTraverseSlope={setMaxTraverseSlope}
          routeResult={routeResult}
          selectedRouteIndex={selectedRouteIndex}
          setSelectedRouteIndex={setSelectedRouteIndex}
          routeLoading={routeLoading}
          routeError={routeError}
          onRunPathfinding={handleRunPathfinding}
          getRegionBounds={getRegionBounds}
        />
      )}

      {/* TAB 3: TRAVERSAL MODE COMPARISON */}
      {activeTab === "comparison" && (
        <TraversalComparisonTab />
      )}
    </div>
  );
};
