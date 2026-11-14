import React from "react";
import { Card, Badge } from "../ui";
import { CandidateMatch } from "../../api/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ExplainabilityTabProps {
  selectedCandidate: CandidateMatch | null;
}

export const ExplainabilityTab: React.FC<ExplainabilityTabProps> = ({
  selectedCandidate,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
            Per-Feature Distance Breakdown
          </h3>
          {selectedCandidate && (
            <Badge variant="derived">{selectedCandidate.location_name}</Badge>
          )}
        </div>

        {selectedCandidate && (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={selectedCandidate.feature_comparison.map((f) => ({
                  feature: f.feature.replace("_", " "),
                  contribution: Number((f.contribution * 100).toFixed(3)),
                  difference: Number(f.difference.toFixed(2)),
                  unit: f.unit,
                }))}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <XAxis dataKey="feature" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D1322",
                    borderColor: "#1E293B",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="contribution" fill="#0284C7" name="Contribution to Distance (%)">
                  {selectedCandidate.feature_comparison.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#10B981" : i === 1 ? "#0284C7" : "#F59E0B"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="lg:col-span-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
            Factual Narrative
          </h3>
          <Badge variant="neutral">Template-based</Badge>
        </div>

        {selectedCandidate ? (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-panel border border-border rounded-btn space-y-1.5">
              <div className="text-status-ok font-bold text-[11px] uppercase">
                Matching Alignment Points:
              </div>
              <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                {selectedCandidate.explanation.similarities.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-panel border border-border rounded-btn space-y-1.5">
              <div className="text-status-warn font-bold text-[11px] uppercase">
                Topographic Discrepancies:
              </div>
              <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                {selectedCandidate.explanation.differences.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="p-2 bg-raised rounded text-[10px] text-text-muted">
              Zero black-box claims: all sentences are derived directly from verified difference thresholds.
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-mono text-text-muted">
            Select a candidate on Tab 1 to view narrative explainability.
          </div>
        )}
      </Card>
    </div>
  );
};

