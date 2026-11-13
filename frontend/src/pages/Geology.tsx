import React from "react";
import { SectionHeading, Badge, EmptyState } from "../components/ui";

export const Geology: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Planetary Geology"
          title="Geological Context"
          subtitle="Lithologic classifications, impact crater mechanics, volcanology, and permafrost analogs."
        />
        <Badge variant="planned">Phase 7 Planned</Badge>
      </div>

      <EmptyState
        title="Geological & Lithological Intelligence"
        description="Connect surface morphometry with comparative planetary geology, basaltic lava tube structures, and hyper-arid weathering analogues."
        reason="Scheduled for Part 7."
      />
    </div>
  );
};
