import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SectionHeading, Button } from "../components/ui";
import {
  api,
  AnalysisDetailResponse,
  AnalysisSummaryItem,
  CandidateMatch,
  BenchmarkValidationResponse,
} from "../api/client";
import {
  FeatureComparisonTab,
  SimilarityCalculationTab,
  ClustersTab,
  RankingTab,
  ExplainabilityTab,
  CoverageTab,
} from "../components/analysis";

type AnalysisTab =
  | "features"
  | "similarity"
  | "clusters"
  | "ranking"
  | "explainability"
  | "uncertainty";

export const Analysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("features");
  const [analysesList, setAnalysesList] = useState<AnalysisSummaryItem[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [analysisDetail, setAnalysisDetail] = useState<AnalysisDetailResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(null);
  const [validationReport, setValidationReport] = useState<BenchmarkValidationResponse | null>(null);

  const tabs: { id: AnalysisTab; label: string }[] = [
    { id: "features", label: "1. Feature Comparison" },
    { id: "similarity", label: "2. Similarity Calculation" },
    { id: "clusters", label: "3. Clusters & Anomaly" },
    { id: "ranking", label: "4. Multi-Attribute Ranking" },
    { id: "explainability", label: "5. Explainability Breakdown" },
    { id: "uncertainty", label: "6. Coverage & Uncertainty" },
  ];

  // Load analyses list on mount
  useEffect(() => {
    api.getAnalyses()
      .then((list) => {
        setAnalysesList(list);
        if (list.length > 0) {
          setSelectedAnalysisId(list[0].id);
        }
      })
      .catch(() => {});

    // Also load validation report
    api.getValidationReport()
      .then((rep) => setValidationReport(rep))
      .catch(() => {});
  }, []);

  // Load detailed analysis when selectedAnalysisId changes
  useEffect(() => {
    if (selectedAnalysisId) {
      api.getAnalysisById(selectedAnalysisId)
        .then((detail) => {
          setAnalysisDetail(detail);
          if (detail.candidates.length > 0) {
            setSelectedCandidate(detail.candidates[0]);
          } else {
            setSelectedCandidate(null);
          }
        })
        .catch(() => setAnalysisDetail(null));
    }
  }, [selectedAnalysisId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header with Analysis Selector Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Mathematical Intelligence"
          title="AI & Similarity Analysis"
          subtitle="Explore multi-dimensional feature space alignments comparing elevation, slope, and roughness distributions at standardized spatial scales."
        />

        <div className="flex items-center space-x-3">
          <label className="text-xs font-mono text-text-muted whitespace-nowrap">
            Select Analysis Run:
          </label>
          <select
            value={selectedAnalysisId || ""}
            onChange={(e) => setSelectedAnalysisId(Number(e.target.value))}
            className="bg-raised border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary font-mono"
            disabled={analysesList.length === 0}
          >
            {analysesList.length === 0 ? (
              <option value="">No analyses run yet</option>
            ) : (
              analysesList.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} &mdash; {a.target_region_name} ({a.planet}) [{a.candidate_count} candidates]
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {analysesList.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="text-sm font-mono text-text-muted">
            No similarity analysis has been executed yet.
          </div>
          <Link to="/discovery">
            <Button variant="primary">Launch Analog Discovery</Button>
          </Link>
        </div>
      ) : !analysisDetail ? (
        <div className="py-20 text-center font-mono text-sm text-text-muted">
          Loading mathematical feature vectors...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b border-border overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-mono font-medium rounded-t border-t border-x transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-panel text-accent-cyan border-border border-b-transparent -mb-px"
                    : "text-text-muted border-transparent hover:text-text-primary hover:bg-raised/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Feature Comparison */}
          {activeTab === "features" && (
            <FeatureComparisonTab
              analysisDetail={analysisDetail}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
            />
          )}

          {/* TAB 2: Similarity Calculation & Worked Example */}
          {activeTab === "similarity" && (
            <SimilarityCalculationTab
              analysisDetail={analysisDetail}
              selectedCandidate={selectedCandidate}
            />
          )}

          {/* TAB 3: Clusters & Anomaly Detection */}
          {activeTab === "clusters" && (
            <ClustersTab analysisDetail={analysisDetail} />
          )}

          {/* TAB 4: Multi-Attribute Ranking Table */}
          {activeTab === "ranking" && (
            <RankingTab analysisDetail={analysisDetail} />
          )}

          {/* TAB 5: Explainability Breakdown */}
          {activeTab === "explainability" && (
            <ExplainabilityTab selectedCandidate={selectedCandidate} />
          )}

          {/* TAB 6: Coverage & Uncertainty */}
          {activeTab === "uncertainty" && (
            <CoverageTab
              selectedCandidate={selectedCandidate}
              validationReport={validationReport}
            />
          )}
        </div>
      )}
    </div>
  );
};
