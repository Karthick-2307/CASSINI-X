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
  LocationImagePopout,
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
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(queryRegionId || null);

  // Local Image Upload State
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Execution & Results State
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisDetailResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(null);

  // Switch planet tab without forcing unwanted immediate search
  const handleSelectPlanet = async (planetName: string) => {
    setSelectedPlanetName(planetName);
    setErrorMessage(null);
    const targetPlanet = planets.find((p) => p.name.toLowerCase() === planetName.toLowerCase());
    const planetId = targetPlanet ? targetPlanet.id : (planetName.toLowerCase() === "moon" ? 2 : 3);
    try {
      const regData = await api.getRegions(planetId);
      setRegions(regData);
      if (regData.length > 0) {
        setSelectedRegionId(regData[0].id);
      }
    } catch {
      // fallback
    }
  };

  // 1. Load Planets
  useEffect(() => {
    api.getPlanets()
      .then((data) => {
        setPlanets(data);
      })
      .catch((err) => console.warn("Planets fetch:", err));
  }, []);

  // 2. Load Regions (only execute search if queryRegionId is explicitly provided in URL)
  useEffect(() => {
    const targetPlanet = planets.find((p) => p.name.toLowerCase() === selectedPlanetName.toLowerCase());
    const planetId = targetPlanet ? targetPlanet.id : (selectedPlanetName.toLowerCase() === "moon" ? 2 : 3);

    api.getRegions(planetId)
      .then((data) => {
        setRegions(data);
        if (data.length > 0) {
          const matchingRegion = queryRegionId && data.find((r) => r.id === queryRegionId);
          const nextRegionId = matchingRegion ? matchingRegion.id : data[0].id;
          setSelectedRegionId(nextRegionId);
          if (queryRegionId) {
            handleTriggerSearch(nextRegionId);
          }
        }
      })
      .catch(() => {
        // silent fallback
      });
  }, [selectedPlanetName, planets, queryRegionId]);

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
    let targetId = overrideRegionId || selectedRegionId;
    if (!targetId) {
      targetId = selectedPlanetName.toLowerCase() === "moon" ? 3 : 2;
      setSelectedRegionId(targetId);
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

  const handleImageSelected = async (file: File | null, url: string | null) => {
    setUploadedImage(file);
    setUploadedImageUrl(url);
    if (!file) return;

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const result = await api.searchByImage({
            image_base64: base64Data,
            filename: file.name,
            target_body: selectedPlanetName,
            ground_resolution_m: 6.0,
          });
          setAnalysisResult(result);
          if (result.candidates.length > 0) {
            setSelectedCandidate(result.candidates[0]);
          }
        } catch (err: unknown) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to process and search uploaded image.");
        } finally {
          setIsSearching(false);
        }
      };
      reader.onerror = () => {
        setErrorMessage("Failed to read image file.");
        setIsSearching(false);
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Image processing error.");
      setIsSearching(false);
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
        setSelectedPlanetName={handleSelectPlanet}
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

      {/* POP-OUT SATELLITE IMAGE OF CLICKED LOCATION BELOW THE MAP */}
      {selectedCandidate && (
        <LocationImagePopout
          candidate={selectedCandidate}
          targetRegionName={activeRegionObj?.name || `${selectedPlanetName} Terrain`}
          uploadedImageUrl={uploadedImageUrl}
          onScrollToDetails={scrollToDetails}
        />
      )}

      {/* 4. DETAILS BELOW: WHY IT MATCHES & STATISTICS GRAPH */}
      <DiscoveryResultsSection
        candidates={activeCandidates}
        selectedCandidate={selectedCandidate}
        onSelectCandidate={(cand) => setSelectedCandidate(cand)}
        targetRegionName={activeRegionObj?.name || `${selectedPlanetName} Terrain`}
        uploadedImageUrl={uploadedImageUrl}
        visualSearchInfo={analysisResult?.visual_search_info}
      />
    </div>
  );
};

export default Discovery;
