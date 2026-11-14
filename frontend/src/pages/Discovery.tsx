import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SectionHeading, ErrorMessage } from "../components/ui";
import {
  api,
  Planet,
  Region,
  CandidateMatch,
  AnalysisDetailResponse,
  GazetteerItem,
} from "../api/client";
import {
  UnifiedDiscoverySearch,
  GoogleEarthGlobeView,
  DiscoveryResultsSection,
  filterCandidates,
} from "../components/discovery";

export const Discovery: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryPlanet = searchParams.get("planet");
  const queryRegionId = searchParams.get("regionId") ? Number(searchParams.get("regionId")) : null;

  // Planetary & Reference Region State
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedPlanetName, setSelectedPlanetName] = useState<string>(queryPlanet || "Mars");
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(queryRegionId);

  // Local Image Upload State
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Execution & Results State
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisDetailResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(null);

  // 1. Load Planets
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

  // 2. Load Regions when Selected Planet Changes
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

  // Handle IAU Gazetteer selection
  const handleSelectGazetteerItem = async (item: GazetteerItem) => {
    try {
      let activeRegionId = item.region_id;
      if (!activeRegionId) {
        setIsSearching(true);
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
        handleTriggerSearch(activeRegionId);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to activate gazetteer feature.");
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger discovery search
  const handleTriggerSearch = async (overrideRegionId?: number) => {
    const targetId = overrideRegionId || selectedRegionId;
    if (!targetId) {
      setErrorMessage("Please select or search a reference planetary region first.");
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const runRes = await api.runAnalysis({
        target_region_id: targetId,
        features: ["elevation_relative", "slope_deg", "roughness_m"],
        threshold: 0.0,
        top_k: 20,
      });

      const fullAnalysis = await api.getAnalysisById(runRes.analysis_id);
      setAnalysisResult(fullAnalysis);
      if (fullAnalysis.candidates.length > 0) {
        setSelectedCandidate(fullAnalysis.candidates[0]);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to execute analog search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageSelected = (file: File | null, url: string | null) => {
    setUploadedImage(file);
    setUploadedImageUrl(url);
    if (file) {
      // Trigger search with current selected region as the baseline
      handleTriggerSearch();
    }
  };

  const activeCandidates = useMemo(() => {
    if (!analysisResult) return [];
    return filterCandidates(analysisResult.candidates, 0.0, "all");
  }, [analysisResult]);

  const activeRegionObj = useMemo(() => {
    return regions.find((r) => r.id === selectedRegionId) || null;
  }, [regions, selectedRegionId]);

  const scrollToDetails = () => {
    const el = document.getElementById("discovery-details");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* 1. REQUIRED HEADING */}
      <div className="pb-4 border-b border-[#243044]">
        <SectionHeading
          kicker="Analog Intelligence"
          title="Planetary Analog Discovery"
          subtitle="Upload orbital observations or select reference features to identify comparable Earth terrains."
        />
      </div>

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onRetry={() => setErrorMessage(null)}
        />
      )}

      {/* 2. UNIFIED SEARCH BAR WITH INSERT IMAGE AT THE END */}
      <UnifiedDiscoverySearch
        planets={planets}
        selectedPlanetName={selectedPlanetName}
        setSelectedPlanetName={setSelectedPlanetName}
        regions={regions}
        selectedRegionId={selectedRegionId}
        onSelectRegion={(id) => {
          setSelectedRegionId(id);
          handleTriggerSearch(id);
        }}
        onSelectGazetteerItem={handleSelectGazetteerItem}
        uploadedImage={uploadedImage}
        uploadedImageUrl={uploadedImageUrl}
        onImageSelected={handleImageSelected}
        onTriggerSearch={() => handleTriggerSearch()}
        isSearching={isSearching}
      />

      {/* 3. GOOGLE EARTH-STYLE SPINNING GLOBE & SPECIFIC IMAGE POP-OUT */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            Interactive Earth Viewport
          </span>
          <span className="text-[11px] font-mono text-[#94A3B8]">
            Rotates automatically • Flies to matched coordinates when search is enabled
          </span>
        </div>

        <GoogleEarthGlobeView
          candidates={activeCandidates}
          selectedCandidate={selectedCandidate}
          onSelectCandidate={(cand) => setSelectedCandidate(cand)}
          onScrollToDetails={scrollToDetails}
        />
      </div>

      {/* 4. DETAILS BELOW: WHY IT MATCHES & STATISTICS GRAPH */}
      <DiscoveryResultsSection
        candidates={activeCandidates}
        selectedCandidate={selectedCandidate}
        onSelectCandidate={(cand) => setSelectedCandidate(cand)}
        targetRegionName={activeRegionObj?.name || `${selectedPlanetName} Terrain`}
        uploadedImageUrl={uploadedImageUrl}
      />
    </div>
  );
};

export default Discovery;
