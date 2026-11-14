import React from "react";
import { Card, Badge } from "../ui";
import { AnalysisDetailResponse, CandidateMatch } from "../../api/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FeatureComparisonTabProps {
  analysisDetail: AnalysisDetailResponse;
  selectedCandidate: CandidateMatch | null;
  onSelectCandidate: (candidate: CandidateMatch) => void;
}

export const FeatureComparisonTab: React.FC<FeatureComparisonTabProps> = ({
  analysisDetail,
  selectedCandidate,
  onSelectCandidate,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
            Normalized Feature Distributions
          </h3>
          <Badge variant="derived">Standardized Vectors</Badge>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analysisDetail.features.map((feat) => {
                const normTarget = analysisDetail.target_summary
                  ? (analysisDetail.target_summary[feat]?.mean ?? 0)
                  : 0;

                let normCand = 0;
                if (selectedCandidate) {
                  const candItem = selectedCandidate.feature_comparison.find(
                    (f) => f.feature === feat
                  );
                  normCand = candItem?.normalized_difference
                    ? normTarget + candItem.normalized_difference
                    : 0;
                }

                return {
                  feature: feat.replace("_", " "),
                  target: Number(normTarget.toFixed(3)),
                  candidate: Number(normCand.toFixed(3)),
                };
              })}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <XAxis dataKey="feature" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D1322",
                  borderColor: "#1E293B",
                  fontSize: "11px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar dataKey="target" fill="#0284C7" name={`Reference: ${analysisDetail.target_region_name.split(" ")[0]}`} />
              <Bar dataKey="candidate" fill="#10B981" name={`Candidate: ${selectedCandidate?.location_name.split(" ")[0] || "Selected"}`} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="lg:col-span-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
            Select Candidate Point
          </h3>
          <Badge variant="neutral">{analysisDetail.candidate_count} Total</Badge>
        </div>

        <select
          value={selectedCandidate?.id || ""}
          onChange={(e) => {
            const cand = analysisDetail.candidates.find((c) => c.id === Number(e.target.value));
            if (cand) onSelectCandidate(cand);
          }}
          className="w-full bg-raised border border-border rounded-btn px-2.5 py-1.5 text-xs text-text-primary font-mono"
        >
          {analysisDetail.candidates.map((c, i) => (
            <option key={c.id} value={c.id}>
              #{i + 1} {c.location_name} ({c.similarity.toFixed(1)}%)
            </option>
          ))}
        </select>

        <div className="space-y-2 pt-2 border-t border-border text-xs font-mono">
          <div className="font-bold text-text-primary text-[11px] uppercase">
            Robust Scaler Parameters (Fit on Earth):
          </div>
          {analysisDetail.scaler_params &&
            Object.entries(analysisDetail.scaler_params).map(([k, v]) => (
              <div key={k} className="p-2 bg-raised rounded text-[11px] space-y-0.5 border border-border">
                <div className="text-accent-cyan capitalize font-semibold">{k.replace("_", " ")}</div>
                <div className="text-text-muted flex justify-between">
                  <span>Median: {v.median}</span>
                  <span>IQR: {v.iqr}</span>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

