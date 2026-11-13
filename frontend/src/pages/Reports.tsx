import React from "react";
import { SectionHeading, Badge, EmptyState } from "../components/ui";

export const Reports: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Documentation"
          title="Reports & Mission Dossiers"
          subtitle="Generate and download publication-ready scientific analog reports and PDF summaries."
        />
        <Badge variant="planned">Phase 7 Planned</Badge>
      </div>

      <EmptyState
        title="Automated PDF Report Compiler"
        description="Compile comprehensive analog dossiers with full provenance citation, coordinate extents, cross-sections, and validation scores."
        reason="Scheduled for Part 7."
      />
    </div>
  );
};
