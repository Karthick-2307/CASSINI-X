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

interface CandidateDetailPanelProps {
  selectedCandidate: CandidateMatch | null;
}

export const CandidateDetailPanel: React.FC<CandidateDetailPanelProps> = ({
  selectedCandidate,
}) => {
  return (
    <Card className="lg:col-span-3 space-y-4 border-border">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
          Candidate Detail
        </h3>
        {selectedCandidate && (
          <Badge variant="derived">
            {selectedCandidate.similarity.toFixed(1)}% Match
          </Badge>
        )}
      </div>

      {!selectedCandidate ? (
        <div className="py-16 text-center text-xs text-text-muted font-mono space-y-2">
          <div>No candidate selected</div>
          <p className="text-[11px] text-text-muted/60">
            Click any row in the table or pin on the map to inspect feature contributions.
          </p>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Location Header */}
          <div className="bg-raised p-3 rounded-btn space-y-1 border border-border">
            <div className="font-heading font-bold text-text-primary text-sm">
              {selectedCandidate.location_name}
            </div>
            <div className="font-mono text-text-muted text-[11px]">
              Coordinates: {selectedCandidate.lat.toFixed(4)}°N, {selectedCandidate.lon.toFixed(4)}°E
            </div>
            <div className="flex items-center space-x-2 pt-1 font-mono text-[11px]">
              <span className="text-accent-cyan">Similarity: {selectedCandidate.similarity.toFixed(1)}%</span>
              <span>|</span>
              <span className="text-status-ok">Confidence: {selectedCandidate.confidence.toFixed(1)}%</span>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono font-bold text-text-muted uppercase">
              Topographic Comparison
            </h4>
            <div className="border border-border rounded-btn overflow-hidden">
              <table className="w-full text-[11px] font-mono">
                <thead className="bg-raised text-text-muted text-[10px]">
                  <tr>
                    <th className="py-1 px-2 text-left">Feature</th>
                    <th className="py-1 px-2 text-right">Target</th>
                    <th className="py-1 px-2 text-right">Candidate</th>
                    <th className="py-1 px-2 text-right">&Delta;</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedCandidate.feature_comparison.map((f) => (
                    <tr key={f.feature}>
                      <td className="py-1 px-2 text-text-primary capitalize truncate max-w-[80px]">
                        {f.feature.replace("_", " ")}
                      </td>
                      <td className="py-1 px-2 text-right text-text-muted">
                        {f.target_value.toFixed(1)} {f.unit}
                      </td>
                      <td className="py-1 px-2 text-right text-text-primary font-medium">
                        {f.candidate_value.toFixed(1)} {f.unit}
                      </td>
                      <td
                        className={`py-1 px-2 text-right font-semibold ${
                          f.kind === "matching"
                            ? "text-status-ok"
                            : f.difference > 0
                            ? "text-status-warn"
                            : "text-accent-cyan"
                        }`}
                      >
                        {f.difference > 0 ? `+${f.difference.toFixed(1)}` : f.difference.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Explainability Contribution Bar Chart */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono font-bold text-text-muted uppercase">
              Per-Feature Distance Contribution
            </h4>
            <div className="h-28 w-full bg-raised p-2 rounded-btn border border-border">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedCandidate.feature_comparison.map((f) => ({
                    name: f.feature.split("_")[0],
                    contribution: f.contribution,
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 10, left: 10, bottom: 4 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0D1322",
                      borderColor: "#1E293B",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="contribution" fill="#0284C7" radius={[0, 4, 4, 0]}>
                    {selectedCandidate.feature_comparison.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? "#10B981" : i === 1 ? "#0284C7" : "#F59E0B"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Factual Explainability Statements */}
          <div className="space-y-2 bg-panel p-3 rounded-btn border border-border">
            {selectedCandidate.explanation.similarities.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-status-ok font-bold">
                  Why It Matches:
                </span>
                <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                  {selectedCandidate.explanation.similarities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCandidate.explanation.differences.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-border">
                <span className="text-[10px] font-mono uppercase text-status-warn font-bold">
                  How It Differs:
                </span>
                <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                  {selectedCandidate.explanation.differences.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confidence Components */}
          {selectedCandidate.confidence_components && (
            <div className="p-2.5 bg-raised rounded-btn border border-border text-[11px] font-mono space-y-1">
              <div className="font-bold text-text-primary text-xs">Diagnostic Quality</div>
              <div className="grid grid-cols-2 gap-1 text-text-muted pt-1">
                <div>Coverage: {selectedCandidate.confidence_components.coverage_score}%</div>
                <div>Res Scale: {selectedCandidate.confidence_components.resolution_score}%</div>
                <div>Features: {selectedCandidate.confidence_components.feature_score}%</div>
                <div>Spread: {selectedCandidate.confidence_components.spread_score}%</div>
              </div>
            </div>
          )}

          {/* Mandatory Scientific Disclaimer */}
          <div className="p-2.5 bg-panel border-l-2 border-status-warn rounded-r text-[10px] text-text-muted leading-tight font-mono">
            Comparable on the selected features only. Not identical to the target. Not an assessment of mission safety.
          </div>
        </div>
      )}
    </Card>
  );
};

