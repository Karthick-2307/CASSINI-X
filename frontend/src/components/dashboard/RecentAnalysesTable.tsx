import React from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Button, EmptyState } from "../ui";
import { DashboardSummaryResponse } from "../../api/client";

interface RecentAnalysesTableProps {
  recentAnalyses: DashboardSummaryResponse["recent_analyses"];
  totalRuns: number;
}

export const RecentAnalysesTable: React.FC<RecentAnalysesTableProps> = ({
  recentAnalyses,
  totalRuns,
}) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-base font-heading font-bold text-text-primary">
            Recent Similarity Analyses
          </h3>
          <p className="text-xs text-text-muted">
            Latest executions of the weighted topographic distance engine.
          </p>
        </div>
        <Badge variant="derived">{totalRuns} Total Runs</Badge>
      </div>

      {recentAnalyses.length === 0 ? (
        <EmptyState
          title="No Analyses Executed Yet"
          description="Run an analog discovery calculation to compare target lunar or Martian topography against Earth."
          reason="Zero similarity analyses recorded in database."
          action={
            <Link to="/discovery">
              <Button variant="primary" size="sm">
                Start First Analysis
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-text-muted border-b border-border uppercase">
              <tr>
                <th className="py-2 px-3">Run ID</th>
                <th className="py-2 px-3">Target</th>
                <th className="py-2 px-3">Top Sim</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentAnalyses.map((a) => (
                <tr key={a.id} className="hover:bg-raised/50 transition-colors">
                  <td className="py-2 px-3 text-text-primary">#{a.id}</td>
                  <td className="py-2 px-3 text-text-primary">{a.reference_region}</td>
                  <td className="py-2 px-3 text-accent-cyan">
                    {a.top_similarity !== null ? `${(a.top_similarity * 100).toFixed(1)}%` : "N/A"}
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant={a.status === "completed" ? "ok" : "neutral"}>
                      {a.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
