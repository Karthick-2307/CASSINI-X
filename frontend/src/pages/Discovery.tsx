import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SectionHeading } from "../components/ui";
import { PlanetaryMap } from "../components/PlanetaryMap";
import {
  api,
  Planet,
  Region,
  CandidateMatch,
  AnalysisDetailResponse,
  GazetteerItem,
} from "../api/client";
import {
  DiscoveryFilters,
  CandidateTable,
  CandidateDetailPanel,
  CandidateCompareModal,
  TerrainCategory,
  filterCandidates,
  sortCandidates,
} from "../components/discovery";

export const Discovery: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryPlanet = searchParams.get("planet");
  const queryRegionId = searchParams.get("regionId") ? Number(searchParams.get("regionId")) : null;

  // Planetary & Region selections
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedPlanetName, setSelectedPlanetName] = useState<string>(queryPlanet || "Mars");
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(queryRegionId);

  // Filter settings
  const [terrainCategory, setTerrainCategory] = useState<TerrainCategory>("all");
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({
    elevation_relative: true,
    slope_deg: true,
    roughness_m: true,
  });
  const [featureWeights, setFeatureWeights] = useState<Record<string, number>>({
    elevation_relative: 0.333,
    slope_deg: 0.333,
    roughness_m: 0.334,
  });
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.0);
  const [topK, setTopK] = useState<number>(20);

  // Execution & results state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisDetailResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(null);

  // Sorting state for ranking table
  const [sortField, setSortField] = useState<"similarity" | "confidence" | "rank">("similarity");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Side-by-side comparison selection (2-3 items)
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // 1. Load planets on mount
  useEffect(() => {
    api.getPlanets()
      .then((data) => {
        setPlanets(data);
        if (!queryPlanet) {
          const nonEarth = data.filter((p) => p.name !== "Earth");
          if (nonEarth.length > 0) setSelectedPlanetName(nonEarth[0].name);
        }
      })
      .catch((err) => setErrorMessage(err.message));
  }, [queryPlanet]);

  // 2. Load regions when selected planet changes
  useEffect(() => {
    if (!selectedPlanetName || planets.length === 0) return;
    const targetPlanet = planets.find((p) => p.name.toLowerCase() === selectedPlanetName.toLowerCase());
    if (!targetPlanet) return;

    api.getRegions(targetPlanet.id)
      .then((data) => {
        setRegions(data);
        if (queryRegionId && data.some((r) => r.id === queryRegionId)) {
          setSelectedRegionId(queryRegionId);
        } else if (data.length > 0 && !selectedRegionId) {
          setSelectedRegionId(data[0].id);
        }
      })
      .catch((err) => setErrorMessage(err.message));
  }, [selectedPlanetName, planets, queryRegionId]);

  // 3. Load initial recent analysis if available
  useEffect(() => {
    api.getAnalyses()
      .then((list) => {
        if (list.length > 0 && !analysisResult) {
          api.getAnalysisById(list[0].id).then((res) => {
            setAnalysisResult(res);
            if (res.candidates.length > 0) setSelectedCandidate(res.candidates[0]);
          });
        }
      })
      .catch(() => {});
  }, [analysisResult]);

  const handleToggleFeature = (feat: string) => {
    setSelectedFeatures((prev) => ({ ...prev, [feat]: !prev[feat] }));
  };

  const handleWeightChange = (feat: string, val: number) => {
    setFeatureWeights((prev) => ({ ...prev, [feat]: val }));
  };

  const handleSelectGazetteerFeature = async (item: GazetteerItem) => {
    try {
      let activeRegionId = item.region_id;
      if (!activeRegionId) {
        setIsRunning(true);
        const activated = await api.activateGazetteerFeature(item.id);
        activeRegionId = activated.region_id;
        const targetPlanet = planets.find((p) => p.name.toLowerCase() === selectedPlanetName.toLowerCase());
        if (targetPlanet) {
          const updatedRegions = await api.getRegions(targetPlanet.id);
          setRegions(updatedRegions);
        }
      }
      if (activeRegionId) {
        setSelectedRegionId(activeRegionId);
        handleRunAnalysis(activeRegionId);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to activate gazetteer feature.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAnalysis = async (overrideRegionId?: number) => {
    const targetId = overrideRegionId || selectedRegionId;
    if (!targetId) return;
    setIsRunning(true);
    setErrorMessage(null);

    const activeFeatures = Object.keys(selectedFeatures).filter((k) => selectedFeatures[k]);
    if (activeFeatures.length === 0) {
      setErrorMessage("Please select at least one physical feature dimension.");
      setIsRunning(false);
      return;
    }

    try {
      const runRes = await api.runAnalysis({
        target_region_id: targetId,
        features: activeFeatures,
        weights: featureWeights,
        threshold: similarityThreshold,
        top_k: topK,
      });

      const fullAnalysis = await api.getAnalysisById(runRes.analysis_id);
      setAnalysisResult(fullAnalysis);
      setSelectedCandidate(fullAnalysis.candidates.length > 0 ? fullAnalysis.candidates[0] : null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to execute analysis.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleToggleCompare = (id: number) => {
    setSelectedForCompare((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id]
    );
  };

  const filteredCandidates = useMemo(() => {
    if (!analysisResult) return [];
    return filterCandidates(analysisResult.candidates, similarityThreshold, terrainCategory);
  }, [analysisResult, similarityThreshold, terrainCategory]);

  const sortedCandidates = useMemo(() => {
    return sortCandidates(filteredCandidates, sortField, sortAsc);
  }, [filteredCandidates, sortField, sortAsc]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Scientific Search"
          title="Planetary Analog Discovery"
          subtitle="Discover and evaluate Earth sites sharing topographic relief, slope, and roughness distributions with extraterrestrial target regions."
        />
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-text-muted">
            {analysisResult ? `Analysis Run #${analysisResult.id}` : "Ready"}
          </span>
          <span className="w-2 h-2 rounded-full bg-status-ok" />
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-status-danger/20 border border-status-danger/40 rounded-btn text-xs text-status-danger font-mono">
          {errorMessage}
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <DiscoveryFilters
          planets={planets}
          selectedPlanetName={selectedPlanetName}
          setSelectedPlanetName={setSelectedPlanetName}
          regions={regions}
          selectedRegionId={selectedRegionId}
          setSelectedRegionId={setSelectedRegionId}
          terrainCategory={terrainCategory}
          setTerrainCategory={setTerrainCategory}
          selectedFeatures={selectedFeatures}
          onToggleFeature={handleToggleFeature}
          featureWeights={featureWeights}
          onWeightChange={handleWeightChange}
          similarityThreshold={similarityThreshold}
          setSimilarityThreshold={setSimilarityThreshold}
          topK={topK}
          setTopK={setTopK}
          isRunning={isRunning}
          onRunAnalysis={handleRunAnalysis}
          selectedForCompareCount={selectedForCompare.length}
          onOpenCompareModal={() => setIsCompareModalOpen(true)}
          onSelectGazetteerFeature={handleSelectGazetteerFeature}
        />

        {/* Center Map & Ranking Table Area */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-text-primary">
              Global Earth Candidates Viewport
            </h3>
            <span className="text-xs font-mono text-text-muted">
              {filteredCandidates.length} Active Candidates
            </span>
          </div>

          <PlanetaryMap
            planet="earth"
            candidates={filteredCandidates}
            selectedCandidateId={selectedCandidate?.id || null}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            className="h-[420px]"
          />

          <CandidateTable
            candidates={sortedCandidates}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            selectedForCompare={selectedForCompare}
            onToggleCompare={handleToggleCompare}
            sortField={sortField}
            setSortField={setSortField}
            sortAsc={sortAsc}
            setSortAsc={setSortAsc}
            similarityThreshold={similarityThreshold}
          />
        </div>

        {/* Right Candidate Detail Panel */}
        <CandidateDetailPanel selectedCandidate={selectedCandidate} />
      </div>

      {/* Side-by-Side Comparison Modal */}
      <CandidateCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        selectedForCompare={selectedForCompare}
        analysisResult={analysisResult}
      />
    </div>
  );
};
