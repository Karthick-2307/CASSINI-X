import React from "react";
import { Card, Button } from "../ui";
import { AnalysisDetailResponse } from "../../api/client";

interface CandidateCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedForCompare: number[];
  analysisResult: AnalysisDetailResponse | null;
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({
  isOpen,
  onClose,
  selectedForCompare,
  analysisResult,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-panel border border-border rounded-panel max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Side-by-Side Analog Candidate Comparison
            </h3>
            <p className="text-xs text-text-muted font-mono">
              Comparing {selectedForCompare.length} candidates evaluated against {analysisResult?.target_region_name}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-${selectedForCompare.length} gap-4`}>
          {selectedForCompare.map((id) => {
            const c = analysisResult?.candidates.find((x) => x.id === id);
            if (!c) return null;

            return (
              <Card key={c.id} className="bg-raised border-border space-y-4">
                <div className="border-b border-border pb-2">
                  <div className="font-heading font-bold text-sm text-text-primary">
                    {c.location_name}
                  </div>
                  <div className="text-[11px] font-mono text-text-muted">
                    {c.lat.toFixed(4)}°N, {c.lon.toFixed(4)}°E
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Similarity Score:</span>
                    <span className="text-accent-cyan font-bold">{c.similarity.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Confidence Score:</span>
                    <span className="text-status-ok font-bold">{c.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Mission Suitability:</span>
                    <span className="text-text-muted italic">&mdash; (Part 7)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Coverage:</span>
                    <span>{((c.data_coverage || 1.0) * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="text-xs font-mono font-semibold text-text-primary">
                    Feature Differences:
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    {c.feature_comparison.map((f) => (
                      <div key={f.feature} className="flex justify-between">
                        <span className="text-text-muted capitalize">
                          {f.feature.split("_")[0]}:
                        </span>
                        <span
                          className={
                            f.kind === "matching"
                              ? "text-status-ok"
                              : f.difference > 0
                              ? "text-status-warn"
                              : "text-accent-cyan"
                          }
                        >
                          {f.candidate_value.toFixed(1)} {f.unit} (&Delta; {f.difference.toFixed(1)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="pt-2 text-right">
          <Button variant="primary" size="sm" onClick={onClose}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
};

