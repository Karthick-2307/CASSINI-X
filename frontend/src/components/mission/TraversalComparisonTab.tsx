import React from "react";
import { Card, Badge } from "../ui";

export const TraversalComparisonTab: React.FC = () => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
            Traversal Optimization Mode Trade-offs
          </h3>
          <p className="text-xs text-text-muted">
            Mathematical routing trade-offs between distance minimization and obstacle avoidance.
          </p>
        </div>
        <Badge variant="neutral">Formula: Cost = d * (1 + w * slope)</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 bg-raised border border-border rounded-panel space-y-2">
          <span className="font-bold text-accent-cyan">1. Shortest Mode (w=0.0)</span>
          <p className="text-text-muted font-sans text-xs">
            Minimizes pure Euclidean traversal distance on the grid. Ignores slope steepness unless the cell exceeds the max barrier threshold (25°).
          </p>
          <div className="text-[11px] text-text-muted">
            Trade-off: Fast execution, potentially higher energy consumption and motor strain on slopes.
          </div>
        </div>

        <div className="p-4 bg-raised border border-border rounded-panel space-y-2">
          <span className="font-bold text-accent-blue">2. Balanced Mode (w=3.0)</span>
          <p className="text-text-muted font-sans text-xs">
            Recommended operational default. Moderately penalizes slopes while avoiding excessive circuitous detours.
          </p>
          <div className="text-[11px] text-text-muted">
            Trade-off: Balanced battery expenditure and traverse travel time.
          </div>
        </div>

        <div className="p-4 bg-raised border border-border rounded-panel space-y-2">
          <span className="font-bold text-status-warn">3. Safest Mode (w=8.0)</span>
          <p className="text-text-muted font-sans text-xs">
            Aggressively avoids grades &gt; 5°. The planner navigates around ridge-lines and crater rims to stay on the smoothest planar ground.
          </p>
          <div className="text-[11px] text-text-muted">
            Trade-off: Longer path length, lowest slip and rollover risk.
          </div>
        </div>
      </div>
    </Card>
  );
};

