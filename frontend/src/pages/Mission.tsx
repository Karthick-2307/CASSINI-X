import React, { useState } from "react";
import {
  SectionHeading,
  Card,
  Badge,
  EmptyState,
} from "../components/ui";

type MissionTab =
  | "risk"
  | "screening"
  | "routes"
  | "comparison";

export const Mission: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MissionTab>("risk");

  const tabs: { id: MissionTab; label: string }[] = [
    { id: "risk", label: "Terrain Risk Assessment" },
    { id: "screening", label: "Landing-Region Screening" },
    { id: "routes", label: "Rover Traverse Routes" },
    { id: "comparison", label: "Route Cost Comparison" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Operations & Traversability"
          title="Mission Suitability & Traversability"
          subtitle="Operational screening for rover traversal, slope hazard constraints, and astronaut field simulation testing."
        />
        <Badge variant="planned">Phase 7 Planned</Badge>
      </div>

      {/* Decision Support Disclaimer Callout */}
      <div className="p-3 bg-panel border border-border rounded-panel text-xs text-text-muted flex items-center justify-between">
        <span>Scientific Decision Support: Suitability metrics evaluate relative operational feasibility; results are never certified for flight landing safety.</span>
        <Badge variant="inferred">Guidance Only</Badge>
      </div>

      {/* Real Working Tabs Switcher */}
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
        {activeTab === "risk" && (
          <EmptyState
            title="Terrain Risk Analysis"
            description="Slope threshold exceedance masks (>15° rover limit), negative obstacle detection, and roughness dispersion mapping."
            reason="Awaiting Part 7 mission risk modeling engine."
          />
        )}

        {activeTab === "screening" && (
          <EmptyState
            title="Landing-Region Screening"
            description="Statistical evaluation of topographic landing ellipses assessing touchdown crater density, relief variances, and slope stability."
            reason="Screening algorithms scheduled for Part 7."
          />
        )}

        {activeTab === "routes" && (
          <EmptyState
            title="Rover Traverse Pathfinding"
            description="A* traversability cost surface computation optimizing multi-waypoint traverse paths while avoiding critical slope hazards."
            reason="Traverse pathfinding engine scheduled for Part 7."
          />
        )}

        {activeTab === "comparison" && (
          <EmptyState
            title="Route Cost & Hazard Comparison"
            description="Comparative profiles showing cumulative energy cost, path tortuosity, and slope exposure across competing traverse corridors."
            reason="Route comparison tools scheduled for Part 7."
          />
        )}
      </Card>
    </div>
  );
};
