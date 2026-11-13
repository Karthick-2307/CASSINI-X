import React, { useState } from "react";
import {
  SectionHeading,
  Card,
  Badge,
  EmptyState,
} from "../components/ui";

type AnalysisTab =
  | "features"
  | "similarity"
  | "clusters"
  | "ranking"
  | "explainability"
  | "uncertainty";

export const Analysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("features");

  const tabs: { id: AnalysisTab; label: string }[] = [
    { id: "features", label: "Feature Comparison" },
    { id: "similarity", label: "Similarity Calculation" },
    { id: "clusters", label: "Clusters & PCA" },
    { id: "ranking", label: "Multi-Attribute Ranking" },
    { id: "explainability", label: "Explainability Decomposition" },
    { id: "uncertainty", label: "Coverage & Uncertainty" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Mathematical Intelligence"
          title="AI & Similarity Analysis"
          subtitle="Explore multi-dimensional feature space alignments comparing elevation, slope, and roughness distributions at standardized spatial scales."
        />
        <Badge variant="planned">Phase 5-6 Planned</Badge>
      </div>

      {/* Real Working Tab Switcher */}
      <div className="border-b border-border">
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-btn text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-panel text-accent-cyan border border-border border-b-transparent shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-panel/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels with Honest Empty States */}
      <Card className="min-h-[420px] flex items-center justify-center p-8">
        {activeTab === "features" && (
          <EmptyState
            title="Feature Comparison Matrix"
            description="Parallel coordinate plots comparing relative elevation, slope inclination, and surface roughness distributions between the selected target and Earth candidates."
            reason="No target region selected yet. Available once analyses are executed in Part 5."
          />
        )}

        {activeTab === "similarity" && (
          <EmptyState
            title="Weighted Distance Formulation"
            description="Normalized Euclidean and Mahalanobis terrain distance formulations computed across equal default weights for elevation, slope, and roughness."
            reason="Similarity calculation engine will be implemented in Part 5."
          />
        )}

        {activeTab === "clusters" && (
          <EmptyState
            title="Multivariate Clustering & PCA Projection"
            description="2D/3D Principal Component Analysis projecting Earth analog candidate clusters alongside Martian and Lunar target geomorphology."
            reason="Scikit-learn clustering and decomposition pipelines scheduled for Part 5."
          />
        )}

        {activeTab === "ranking" && (
          <EmptyState
            title="Independent Multi-Attribute Ranking"
            description="Separated ranking table showing Similarity Score, Confidence Score, and Mission Suitability Score as three strictly independent columns."
            reason="Requires active candidate generation in Part 5."
          />
        )}

        {activeTab === "explainability" && (
          <EmptyState
            title="Explainability Score Decomposition"
            description="Transparent breakdown detailing exact feature contributions to the overall distance score, ensuring zero black-box scoring."
            reason="Explainability engine scheduled for Part 5."
          />
        )}

        {activeTab === "uncertainty" && (
          <EmptyState
            title="Coverage Fraction & Spatial Uncertainty"
            description="Explicit reporting of nodata pixel percentages, interpolation bounds, and orbital altimeter track spacing."
            reason="Uncertainty quantification will be computed alongside raster ingestion in Part 4."
          />
        )}
      </Card>
    </div>
  );
};
