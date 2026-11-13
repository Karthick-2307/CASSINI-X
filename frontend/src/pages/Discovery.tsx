import React, { useState, useEffect, useMemo } from "react";
import {
  SectionHeading,
  Card,
  Badge,
  Button,
} from "../components/ui";
import { PlanetaryMap } from "../components/PlanetaryMap";
import {
  api,
  Planet,
  Region,
  CandidateMatch,
  AnalysisDetailResponse,
} from "../api/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type TerrainCategory = "all" | "flat" | "rolling" | "rugged";

export const Discovery: React.FC = () => {
  // Planetary & Region selections
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedPlanetName, setSelectedPlanetName] = useState<string>("Mars");
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

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
        const nonEarth = data.filter((p) => p.name !== "Earth");
        if (nonEarth.length > 0) {
          setSelectedPlanetName(nonEarth[0].name);
        }
      })
      .catch((err) => setErrorMessage(err.message));
  }, []);

  // 2. Load regions when selected planet changes
  useEffect(() => {
    if (!selectedPlanetName || planets.length === 0) return;
    const targetPlanet = planets.find((p) => p.name.toLowerCase() === selectedPlanetName.toLowerCase());
    if (!targetPlanet) return;

    api.getRegions(targetPlanet.id)
      .then((data) => {
        setRegions(data);
        if (data.length > 0) {
          setSelectedRegionId(data[0].id);
        } else {
          setSelectedRegionId(null);
        }
      })
      .catch((err) => setErrorMessage(err.message));
  }, [selectedPlanetName, planets]);

  // 3. Load most recent existing analysis if available
  useEffect(() => {
    api.getAnalyses()
      .then((list) => {
        if (list.length > 0) {
          api.getAnalysisById(list[0].id).then((res) => {
            setAnalysisResult(res);
            if (res.candidates.length > 0) {
              setSelectedCandidate(res.candidates[0]);
            }
          });
        }
      })
      .catch(() => {});
  }, []);

  // Handle Feature Checkbox Change
  const handleToggleFeature = (feat: string) => {
    const updated = { ...selectedFeatures, [feat]: !selectedFeatures[feat] };
    setSelectedFeatures(updated);

    // Re-normalize active weights
    const activeFeats = Object.keys(updated).filter((k) => updated[k]);
    if (activeFeats.length > 0) {
      const eqWeight = 1.0 / activeFeats.length;
      const newWeights: Record<string, number> = {};
      Object.keys(updated).forEach((k) => {
        newWeights[k] = updated[k] ? eqWeight : 0.0;
      });
      setFeatureWeights(newWeights);
    }
  };

  // Handle Weight Slider Change
  const handleWeightChange = (feat: string, val: number) => {
    setFeatureWeights((prev) => ({ ...prev, [feat]: val }));
  };

  // Run Similarity Analysis Pipeline
  const handleRunAnalysis = async () => {
    if (!selectedRegionId) {
      setErrorMessage("Please select a target planetary reference region.");
      return;
    }

    const activeFeats = Object.keys(selectedFeatures).filter((k) => selectedFeatures[k]);
    if (activeFeats.length === 0) {
      setErrorMessage("At least one feature dimension must be selected.");
      return;
    }

    setIsRunning(true);
    setErrorMessage(null);

    try {
      const runRes = await api.runAnalysis({
        target_region_id: selectedRegionId,
        features: activeFeats,
        weights: featureWeights,
        threshold: similarityThreshold,
        top_k: topK,
      });

      const detail = await api.getAnalysisById(runRes.analysis_id);
      setAnalysisResult(detail);
      if (detail.candidates.length > 0) {
        setSelectedCandidate(detail.candidates[0]);
      } else {
        setSelectedCandidate(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred running analysis.");
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Filter candidates by terrain category and similarity threshold
  const filteredCandidates = useMemo(() => {
    if (!analysisResult) return [];

    return analysisResult.candidates.filter((cand) => {
      // Similarity threshold filter
      if (cand.similarity < similarityThreshold) return false;

      // Geomorphic category filter based on candidate slope
      const slopeItem = cand.feature_comparison.find((f) => f.feature === "slope_deg");
      const slopeVal = slopeItem ? slopeItem.candidate_value : 0;

      if (terrainCategory === "flat" && slopeVal >= 5.0) return false;
      if (terrainCategory === "rolling" && (slopeVal < 5.0 || slopeVal > 15.0)) return false;
      if (terrainCategory === "rugged" && slopeVal <= 15.0) return false;

      return true;
    });
  }, [analysisResult, similarityThreshold, terrainCategory]);

  // Sort candidates
  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => {
      let valA = a.similarity;
      let valB = b.similarity;
      if (sortField === "confidence") {
        valA = a.confidence;
        valB = b.confidence;
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredCandidates, sortField, sortAsc]);

  // Handle multi-select for side-by-side comparison
  const handleToggleCompare = (id: number) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert("You can select up to 3 candidates for side-by-side comparison.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Analog Search Engine"
          title="Analog Discovery Explorer"
          subtitle="Pair planetary reference regions on Mars and the Moon with ranked Earth analogs using multi-attribute topographic distance metrics."
        />
        <div className="flex items-center space-x-2">
          {selectedForCompare.length >= 2 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCompareModalOpen(true)}
            >
              Compare Selected ({selectedForCompare.length})
            </Button>
          )}
          <Badge variant="measured">Part 6 Integrated</Badge>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-panel text-xs text-status-danger font-mono">
          {errorMessage}
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Controls (3 cols) */}
        <Card className="lg:col-span-3 space-y-5 border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
              Target Filters
            </h3>
            <Badge variant="neutral">Config</Badge>
          </div>

          {/* Planet Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">Target Planetary Body</label>
            <select
              value={selectedPlanetName}
              onChange={(e) => setSelectedPlanetName(e.target.value)}
              className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-cyan"
            >
              {planets
                .filter((p) => p.name !== "Earth")
                .map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Target Reference Region */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">Reference Study Area</label>
            <select
              value={selectedRegionId || ""}
              onChange={(e) => setSelectedRegionId(Number(e.target.value))}
              className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-cyan"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Terrain Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">Terrain Category Filter</label>
            <select
              value={terrainCategory}
              onChange={(e) => setTerrainCategory(e.target.value as TerrainCategory)}
              className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-cyan"
            >
              <option value="all">All Terrain Categories</option>
              <option value="flat">Flat Plain (Slope &lt; 5°)</option>
              <option value="rolling">Rolling Terrain (5° &ndash; 15°)</option>
              <option value="rugged">Rugged Relief (Slope &gt; 15°)</option>
            </select>
          </div>

          {/* Feature Dimensions & Sliders */}
          <div className="space-y-3 pt-1 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-text-muted">Feature Weighting</label>
              <span className="text-[10px] font-mono text-text-muted/70">Sum: 1.0</span>
            </div>
            <p className="text-[11px] font-mono text-text-muted/60 leading-tight">
              Note: Weights are exploratory, not calibrated probabilities.
            </p>

            {/* Feature 1: Elevation Relative */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.elevation_relative}
                    onChange={() => handleToggleFeature("elevation_relative")}
                    className="rounded border-border text-accent-cyan"
                  />
                  <span>Relative Elevation</span>
                </label>
                <span className="text-accent-cyan">{(featureWeights.elevation_relative * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                disabled={!selectedFeatures.elevation_relative}
                value={featureWeights.elevation_relative}
                onChange={(e) => handleWeightChange("elevation_relative", parseFloat(e.target.value))}
                className="w-full accent-accent-cyan"
              />
            </div>

            {/* Feature 2: Slope */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.slope_deg}
                    onChange={() => handleToggleFeature("slope_deg")}
                    className="rounded border-border text-accent-cyan"
                  />
                  <span>Slope Inclination</span>
                </label>
                <span className="text-accent-cyan">{(featureWeights.slope_deg * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                disabled={!selectedFeatures.slope_deg}
                value={featureWeights.slope_deg}
                onChange={(e) => handleWeightChange("slope_deg", parseFloat(e.target.value))}
                className="w-full accent-accent-cyan"
              />
            </div>

            {/* Feature 3: Roughness */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.roughness_m}
                    onChange={() => handleToggleFeature("roughness_m")}
                    className="rounded border-border text-accent-cyan"
                  />
                  <span>Surface Roughness</span>
                </label>
                <span className="text-accent-cyan">{(featureWeights.roughness_m * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                disabled={!selectedFeatures.roughness_m}
                value={featureWeights.roughness_m}
                onChange={(e) => handleWeightChange("roughness_m", parseFloat(e.target.value))}
                className="w-full accent-accent-cyan"
              />
            </div>
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

          {/* Run Analysis Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              disabled={isRunning || !selectedRegionId}
              onClick={handleRunAnalysis}
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

        {/* Center Map & Ranking Table Area (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-text-primary">
              Global Earth Candidates Viewport
            </h3>
            <span className="text-xs font-mono text-text-muted">
              {filteredCandidates.length} Active Candidates
            </span>
          </div>

          {/* MapLibre Global Candidates Map */}
          <PlanetaryMap
            planet="earth"
            candidates={filteredCandidates}
            selectedCandidateId={selectedCandidate?.id || null}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            className="h-[420px]"
          />

          {/* Ranking Table with Independent Columns */}
          <Card className="p-0 overflow-hidden border-border">
            <div className="p-3 bg-panel border-b border-border flex items-center justify-between">
              <h4 className="text-xs font-heading font-bold text-text-primary uppercase tracking-wide">
                Ranked Candidates Table
              </h4>
              <span className="text-[11px] font-mono text-text-muted">
                Separated Scores (Similarity vs Confidence vs Suitability)
              </span>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-raised/70 text-text-muted uppercase text-[10px] sticky top-0 z-10 border-b border-border">
                  <tr>
                    <th className="py-2 px-3 w-8">Sel</th>
                    <th
                      className="py-2 px-3 cursor-pointer hover:text-text-primary"
                      onClick={() => {
                        setSortField("rank");
                        setSortAsc(!sortAsc);
                      }}
                    >
                      #
                    </th>
                    <th className="py-2 px-3">Location</th>
                    <th
                      className="py-2 px-3 cursor-pointer hover:text-text-primary"
                      onClick={() => {
                        setSortField("similarity");
                        setSortAsc(!sortAsc);
                      }}
                    >
                      Similarity
                    </th>
                    <th
                      className="py-2 px-3 cursor-pointer hover:text-text-primary"
                      onClick={() => {
                        setSortField("confidence");
                        setSortAsc(!sortAsc);
                      }}
                    >
                      Confidence
                    </th>
                    <th className="py-2 px-3 text-text-muted/60" title="Suitability stays null until Part 7">
                      Suitability
                    </th>
                    <th className="py-2 px-3">Coverage</th>
                    <th className="py-2 px-3">Cluster</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-text-muted">
                        No candidates match active threshold ({similarityThreshold}%) or filters.
                      </td>
                    </tr>
                  ) : (
                    sortedCandidates.map((cand, idx) => {
                      const isSelected = selectedCandidate?.id === cand.id;
                      const isCheckedForCompare = selectedForCompare.includes(cand.id);

                      return (
                        <tr
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-accent-cyan/15 text-text-primary font-semibold"
                              : "hover:bg-raised/50 text-text-muted"
                          }`}
                        >
                          <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isCheckedForCompare}
                              onChange={() => handleToggleCompare(cand.id)}
                              className="rounded border-border text-accent-cyan"
                            />
                          </td>
                          <td className="py-2 px-3">{idx + 1}</td>
                          <td className="py-2 px-3 text-text-primary font-medium truncate max-w-[120px]">
                            {cand.location_name}
                          </td>
                          <td className="py-2 px-3 text-accent-cyan font-bold">
                            {cand.similarity.toFixed(1)}%
                          </td>
                          <td className="py-2 px-3 text-status-ok">
                            {cand.confidence.toFixed(1)}%
                          </td>
                          <td className="py-2 px-3 text-text-muted/50 font-mono italic">
                            &mdash;
                          </td>
                          <td className="py-2 px-3">
                            {((cand.data_coverage || 1.0) * 100).toFixed(0)}%
                          </td>
                          <td className="py-2 px-3 font-mono">
                            C{cand.cluster_id !== undefined ? cand.cluster_id : 0}
                          </td>
                          <td className="py-2 px-3">
                            {cand.is_anomaly ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-status-warn/20 text-status-warn border border-status-warn/30">
                                Unusual
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-raised text-text-muted">
                                Nominal
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Candidate Detail Panel (3 cols) */}
        <Card className="lg:col-span-3 space-y-4 border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
              Candidate Detail
            </h3>
            {selectedCandidate && (
              <Badge variant="derived">
                {selectedCandidate.similarity.toFixed(1)}% Match
              </Badge>
            )}
          </div>

          {!selectedCandidate ? (
            <div className="py-16 text-center text-xs text-text-muted font-mono space-y-2">
              <div>No candidate selected</div>
              <p className="text-[11px] text-text-muted/60">
                Click any row in the table or pin on the map to inspect feature contributions.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Location Header */}
              <div className="bg-raised p-3 rounded-btn space-y-1 border border-border">
                <div className="font-heading font-bold text-text-primary text-sm">
                  {selectedCandidate.location_name}
                </div>
                <div className="font-mono text-text-muted text-[11px]">
                  Coordinates: {selectedCandidate.lat.toFixed(4)}°N, {selectedCandidate.lon.toFixed(4)}°E
                </div>
                <div className="flex items-center space-x-2 pt-1 font-mono text-[11px]">
                  <span className="text-accent-cyan">Similarity: {selectedCandidate.similarity.toFixed(1)}%</span>
                  <span>|</span>
                  <span className="text-status-ok">Confidence: {selectedCandidate.confidence.toFixed(1)}%</span>
                </div>
              </div>

              {/* Feature Comparison Table */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold text-text-muted uppercase">
                  Topographic Comparison
                </h4>
                <div className="border border-border rounded-btn overflow-hidden">
                  <table className="w-full text-[11px] font-mono">
                    <thead className="bg-raised text-text-muted text-[10px]">
                      <tr>
                        <th className="py-1 px-2 text-left">Feature</th>
                        <th className="py-1 px-2 text-right">Target</th>
                        <th className="py-1 px-2 text-right">Candidate</th>
                        <th className="py-1 px-2 text-right">&Delta;</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedCandidate.feature_comparison.map((f) => (
                        <tr key={f.feature}>
                          <td className="py-1 px-2 text-text-primary capitalize truncate max-w-[80px]">
                            {f.feature.replace("_", " ")}
                          </td>
                          <td className="py-1 px-2 text-right text-text-muted">
                            {f.target_value.toFixed(1)} {f.unit}
                          </td>
                          <td className="py-1 px-2 text-right text-text-primary font-medium">
                            {f.candidate_value.toFixed(1)} {f.unit}
                          </td>
                          <td
                            className={`py-1 px-2 text-right font-semibold ${
                              f.kind === "matching"
                                ? "text-status-ok"
                                : f.difference > 0
                                ? "text-status-warn"
                                : "text-accent-cyan"
                            }`}
                          >
                            {f.difference > 0 ? `+${f.difference.toFixed(1)}` : f.difference.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Explainability Contribution Bar Chart */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold text-text-muted uppercase">
                  Per-Feature Distance Contribution
                </h4>
                <div className="h-28 w-full bg-raised p-2 rounded-btn border border-border">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedCandidate.feature_comparison.map((f) => ({
                        name: f.feature.split("_")[0],
                        contribution: f.contribution,
                      }))}
                      layout="vertical"
                      margin={{ top: 4, right: 10, left: 10, bottom: 4 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        width={45}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0D1322",
                          borderColor: "#1E293B",
                          fontSize: "11px",
                        }}
                      />
                      <Bar dataKey="contribution" fill="#0284C7" radius={[0, 4, 4, 0]}>
                        {selectedCandidate.feature_comparison.map((_, i) => (
                          <Cell
                            key={i}
                            fill={i === 0 ? "#10B981" : i === 1 ? "#0284C7" : "#F59E0B"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Factual Explainability Statements */}
              <div className="space-y-2 bg-panel p-3 rounded-btn border border-border">
                {selectedCandidate.explanation.similarities.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-status-ok font-bold">
                      Why It Matches:
                    </span>
                    <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                      {selectedCandidate.explanation.similarities.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCandidate.explanation.differences.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border">
                    <span className="text-[10px] font-mono uppercase text-status-warn font-bold">
                      How It Differs:
                    </span>
                    <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                      {selectedCandidate.explanation.differences.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confidence Components */}
              {selectedCandidate.confidence_components && (
                <div className="p-2.5 bg-raised rounded-btn border border-border text-[11px] font-mono space-y-1">
                  <div className="font-bold text-text-primary text-xs">Diagnostic Quality</div>
                  <div className="grid grid-cols-2 gap-1 text-text-muted pt-1">
                    <div>Coverage: {selectedCandidate.confidence_components.coverage_score}%</div>
                    <div>Res Scale: {selectedCandidate.confidence_components.resolution_score}%</div>
                    <div>Features: {selectedCandidate.confidence_components.feature_score}%</div>
                    <div>Spread: {selectedCandidate.confidence_components.spread_score}%</div>
                  </div>
                </div>
              )}

              {/* Mandatory Scientific Disclaimer */}
              <div className="p-2.5 bg-panel border-l-2 border-status-warn rounded-r text-[10px] text-text-muted leading-tight font-mono">
                Comparable on the selected features only. Not identical to the target. Not an assessment of mission safety.
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-panel border border-border rounded-panel max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-text-primary">
                  Side-by-Side Analog Candidate Comparison
                </h3>
                <p className="text-xs text-text-muted font-mono">
                  Comparing {selectedForCompare.length} candidates evaluated against {analysisResult?.target_region_name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCompareModalOpen(false)}
              >
                Close
              </Button>
            </div>

            {/* Comparison Columns Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-${selectedForCompare.length} gap-4`}>
              {selectedForCompare.map((id) => {
                const c = analysisResult?.candidates.find((x) => x.id === id);
                if (!c) return null;

                return (
                  <Card key={c.id} className="bg-raised border-border space-y-4">
                    <div className="border-b border-border pb-2">
                      <div className="font-heading font-bold text-sm text-text-primary">
                        {c.location_name}
                      </div>
                      <div className="text-[11px] font-mono text-text-muted">
                        {c.lat.toFixed(4)}°N, {c.lon.toFixed(4)}°E
                      </div>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Similarity Score:</span>
                        <span className="text-accent-cyan font-bold">{c.similarity.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Confidence Score:</span>
                        <span className="text-status-ok font-bold">{c.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Mission Suitability:</span>
                        <span className="text-text-muted italic">&mdash; (Part 7)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Coverage:</span>
                        <span>{((c.data_coverage || 1.0) * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="text-xs font-mono font-semibold text-text-primary">
                        Feature Differences:
                      </div>
                      <div className="space-y-1 text-[11px] font-mono">
                        {c.feature_comparison.map((f) => (
                          <div key={f.feature} className="flex justify-between">
                            <span className="text-text-muted capitalize">
                              {f.feature.split("_")[0]}:
                            </span>
                            <span
                              className={
                                f.kind === "matching"
                                  ? "text-status-ok"
                                  : f.difference > 0
                                  ? "text-status-warn"
                                  : "text-accent-cyan"
                              }
                            >
                              {f.candidate_value.toFixed(1)} {f.unit} (&Delta; {f.difference.toFixed(1)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCompareModalOpen(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
