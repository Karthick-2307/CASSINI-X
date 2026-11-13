import React from "react";
import { SectionHeading, Badge, EmptyState } from "../components/ui";

export const Mission: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Traversability & Operations"
          title="Mission Suitability & Traversability"
          subtitle="Operational screening for rover traversal, landing ellipse roughness, and astronaut field training."
        />
        <Badge variant="planned">Phase 7 Planned</Badge>
      </div>

      <EmptyState
        title="Path Traversability Simulation"
        description="Run A* cost-surface pathfinding across slope and roughness constraints to evaluate field analog rover trials and EVA operational suitability."
        reason="Scheduled for Part 7."
      />
    </div>
  );
};
