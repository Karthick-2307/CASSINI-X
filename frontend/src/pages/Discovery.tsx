import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SectionHeading, EmptyState, LoadingSpinner, ErrorMessage } from "../components/ui";
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
  CandidateTable,
  CandidateDetailPanel,
  ImageWorkflowControls,
  ImageMetadata,
  RegionWorkflowControls,
  ReferenceRegionViewer,
  filterCandidates,
  sortCandidates,
} from "../components/discovery";

export const Discovery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentMode = searchParams.get("mode") === "region" ? "region" : "image";
  const queryPlanet = searchParams.get("planet");
  const queryRegionId = searchParams.get("regionId") ? Number(searchParams.get("regionId")) : null;

  // Mode selection: "image" or "region"
  const handleModeChange = (newMode: "image" | "region") => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("mode", newMode);
    setSearchParams(nextParams);
  };

  // Image mode state
  const [imageMeta, setImageMeta] = useState<ImageMetadata>({
    file: null,
    previewUrl: null,
    body: "Mars",
    instrument: "",
    resolutionMPerPx: 6.0,
    lat: "",
    lon: "",
    acquisitionDate: "",
    method: "embedding",
    topK: 20,
  });

  // Region mode state
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedPlanetName, setSelectedPlanetName] = useState<string>(queryPlanet || "Mars");
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(queryRegionId);
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({
    elevation_relative: true,
    slope_deg: true,
    roughness_m: true,
  });
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.0);
  const [topK, setTopK] = useState<number>(20);

  // Center viewport toggle: "earth" (candidates) vs "reference" (Mars/Moon)
  const [centerView, setCenterView] = useState<"earth" | "reference">("earth");

  // Execution & results state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisDetailResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(null);

  // Sorting state for table
  const [sortField, setSortField] = useState<"similarity" | "confidence" | "rank">("similarity");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);

  // 1. Load planets
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
        handleRunRegionAnalysis(activeRegionId);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to activate gazetteer feature.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunRegionAnalysis = async (overrideRegionId?: number) => {
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
        threshold: similarityThreshold,
        top_k: topK,
      });

      const fullAnalysis = await api.getAnalysisById(runRes.analysis_id);
      setAnalysisResult(fullAnalysis);
      setSelectedCandidate(fullAnalysis.candidates.length > 0 ? fullAnalysis.candidates[0] : null);
      setCenterView("earth");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to execute analysis.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleToggleCompare = (id: number) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredCandidates = useMemo(() => {
    if (!analysisResult) return [];
    return filterCandidates(analysisResult.candidates, similarityThreshold, "all");
  }, [analysisResult, similarityThreshold]);

  const sortedCandidates = useMemo(() => {
    return sortCandidates(filteredCandidates, sortField, sortAsc);
  }, [filteredCandidates, sortField, sortAsc]);

  const activeRegionObj = useMemo(() => {
    return regions.find((r) => r.id === selectedRegionId) || null;
  }, [regions, selectedRegionId]);

  return (
    <div className="space-y-6">
      {/* Page Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Analog Intelligence"
          title="Planetary Analog Discovery"
          subtitle="Upload orbital observations or select reference features to identify comparable Earth terrains."
        />

        {/* Mode Switch (Image vs Region) */}
        <div className="inline-flex items-center p-1 rounded-btn bg-surface border border-border">
          <button
            type="button"
            onClick={() => handleModeChange("image")}
            className={`px-4 py-1.5 rounded text-xs font-sans font-medium transition-colors ${
              currentMode === "image"
                ? "bg-raised text-accent font-semibold border border-border"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Image Mode
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("region")}
            className={`px-4 py-1.5 rounded text-xs font-sans font-medium transition-colors ${
              currentMode === "region"
                ? "bg-raised text-accent font-semibold border border-border"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Region Mode
          </button>
        </div>
      </div>

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onRetry={() => setErrorMessage(null)}
        />
      )}

      {/* Main 3-Column Layout (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls (approx 320px -> 3 cols of 12) */}
        <div className="lg:col-span-3">
          {currentMode === "image" ? (
            <ImageWorkflowControls
              metadata={imageMeta}
              setMetadata={setImageMeta}
            />
          ) : (
            <RegionWorkflowControls
              planets={planets}
              selectedPlanetName={selectedPlanetName}
              setSelectedPlanetName={setSelectedPlanetName}
              regions={regions}
              selectedRegionId={selectedRegionId}
              setSelectedRegionId={setSelectedRegionId}
              selectedFeatures={selectedFeatures}
              onToggleFeature={handleToggleFeature}
              similarityThreshold={similarityThreshold}
              setSimilarityThreshold={setSimilarityThreshold}
              topK={topK}
              setTopK={setTopK}
              isRunning={isRunning}
              onRunAnalysis={() => handleRunRegionAnalysis()}
              onSelectGazetteerFeature={handleSelectGazetteerFeature}
            />
          )}
        </div>

        {/* Center Viewport: Candidates Map OR Reference Region (6 cols of 12) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-1">
            {/* Viewport switch: Earth Candidates vs Target Region */}
            <div className="inline-flex items-center p-0.5 rounded bg-surface border border-border text-xs font-sans">
              <button
                type="button"
                onClick={() => setCenterView("earth")}
                className={`px-3 py-1 rounded transition-colors ${
                  centerView === "earth"
                    ? "bg-raised text-accent font-medium border border-border"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Earth Candidates ({filteredCandidates.length})
              </button>
              <button
                type="button"
                onClick={() => setCenterView("reference")}
                className={`px-3 py-1 rounded transition-colors ${
                  centerView === "reference"
                    ? "bg-raised text-accent font-medium border border-border"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Target {selectedPlanetName} Region
              </button>
            </div>

            <span className="text-[11px] font-mono text-text-muted">
              {centerView === "earth" ? "Global MapLibre View" : "Local Altimetry View"}
            </span>
          </div>

          {/* Viewport content */}
          {centerView === "earth" ? (
            <PlanetaryMap
              planet="earth"
              candidates={filteredCandidates}
              selectedCandidateId={selectedCandidate?.id || null}
              onSelectCandidate={(cand) => setSelectedCandidate(cand)}
              className="h-[440px]"
            />
          ) : (
            <ReferenceRegionViewer
              region={activeRegionObj}
              planetName={selectedPlanetName}
            />
          )}

          {/* Candidate Table below Map */}
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

        {/* Right Column: Candidate Detail Panel (3 cols of 12) */}
        <div className="lg:col-span-3">
          {isRunning ? (
            <div className="h-[400px] flex items-center justify-center bg-surface border border-border rounded-card">
              <LoadingSpinner label="Running similarity comparison..." />
            </div>
          ) : !analysisResult && currentMode === "image" ? (
            <EmptyState
              title="No image analysis run yet"
              description="Upload an orbital image and configure ground resolution to begin comparison."
              reason="Visual texture backend is not implemented yet"
            />
          ) : !analysisResult ? (
            <EmptyState
              title="No analysis run yet"
              description="Select a planetary target region and click 'Run terrain discovery'."
            />
          ) : (
            <CandidateDetailPanel
              selectedCandidate={selectedCandidate}
              uploadedImageUrl={imageMeta.previewUrl}
              uploadedResolutionMPerPx={imageMeta.resolutionMPerPx}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Discovery;
