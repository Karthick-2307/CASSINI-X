import React from "react";
import { SectionHeading, Badge, EmptyState } from "../components/ui";

export const Explorer: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Terrain Intelligence"
          title="Planetary Explorer"
          subtitle="Topographic cross-sections, elevation distributions, and slope inclination profiles."
        />
        <Badge variant="planned">Phase 6 Planned</Badge>
      </div>

      <EmptyState
        title="Orbital Terrain Profiler"
        description="Inspect high-resolution DEM cross-sections, slope variance histograms, and surface roughness distributions across target lunar and Martian regions."
        reason="Scheduled for Part 6."
      />
    </div>
  );
};
