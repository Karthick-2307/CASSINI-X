import React from "react";
import { SectionHeading, Badge, EmptyState } from "../components/ui";

export const Analysis: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Mathematical Models"
          title="AI & Similarity Analysis"
          subtitle="Transparent weighted distance models, multivariate feature clustering, and PCA projections."
        />
        <Badge variant="planned">Phase 5-6 Planned</Badge>
      </div>

      <EmptyState
        title="Similarity Distance Engine"
        description="Inspect multi-dimensional feature space alignments comparing elevation, slope, and roughness distributions at standardized spatial scales."
        reason="Scheduled for Part 5 (ML Engine) and Part 6 (Analysis UI)."
      />
    </div>
  );
};
