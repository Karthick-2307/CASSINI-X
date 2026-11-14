import React from "react";
import { Card, Badge } from "../ui";
import { CandidateMatch, BenchmarkValidationResponse } from "../../api/client";

interface CoverageTabProps {
  selectedCandidate: CandidateMatch | null;
  validationReport: BenchmarkValidationResponse | null;
}

export const CoverageTab: React.FC<CoverageTabProps> = ({
  selectedCandidate,
  validationReport,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
            Confidence Decomposition
          </h3>
          <Badge variant="measured">0 &ndash; 100 Score</Badge>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <p className="text-text-muted text-[11px] leading-relaxed">
            Confidence measures observational integrity, data coverage, resolution mismatch penalty, and regional spread &mdash; independently of similarity.
          </p>

          {selectedCandidate?.confidence_components && (
            <div className="space-y-2">
              <div className="p-2.5 bg-raised rounded-btn border border-border flex justify-between items-center">
                <div>
                  <div className="font-bold text-text-primary">Data Coverage (Valid Fraction)</div>
                  <div className="text-[10px] text-text-muted">Weight: 35% | Fraction of non-nodata pixels</div>
                </div>
                <span className="font-bold text-status-ok text-sm">
                  {selectedCandidate.confidence_components.coverage_score}%
                </span>
              </div>

              <div className="p-2.5 bg-raised rounded-btn border border-border flex justify-between items-center">
                <div>
                  <div className="font-bold text-text-primary">Resolution Mismatch Penalty</div>
                  <div className="text-[10px] text-text-muted">
                    Weight: 25% | Mismatch Ratio: {selectedCandidate.confidence_components.resolution_mismatch_ratio}x
                  </div>
                </div>
                <span className="font-bold text-accent-cyan text-sm">
                  {selectedCandidate.confidence_components.resolution_score}%
                </span>
              </div>

              <div className="p-2.5 bg-raised rounded-btn border border-border flex justify-between items-center">
                <div>
                  <div className="font-bold text-text-primary">Feature Completeness</div>
                  <div className="text-[10px] text-text-muted">
                    Weight: 20% | {selectedCandidate.confidence_components.features_available} of 3 features present
                  </div>
                </div>
                <span className="font-bold text-text-primary text-sm">
                  {selectedCandidate.confidence_components.feature_score}%
                </span>
              </div>

              <div className="p-2.5 bg-raised rounded-btn border border-border flex justify-between items-center">
                <div>
                  <div className="font-bold text-text-primary">Reference Region Spread</div>
                  <div className="text-[10px] text-text-muted">
                    Weight: 20% | Target normalized spread: {selectedCandidate.confidence_components.reference_spread}
                  </div>
                </div>
                <span className="font-bold text-status-warn text-sm">
                  {selectedCandidate.confidence_components.spread_score}%
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-heading font-bold text-text-primary uppercase">
            Validation Against Baselines
          </h3>
          <Badge variant="derived">Leave-One-Region-Out</Badge>
        </div>

        {validationReport ? (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-panel rounded-btn border border-border space-y-2">
              <div className="font-bold text-text-primary text-xs">Model vs Baseline Ranks:</div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 bg-raised rounded border border-border">
                  <div className="text-[10px] text-text-muted">Model Mean Rank</div>
                  <div className="font-bold text-status-ok text-sm">
                    #{validationReport.metrics_summary.model.mean_rank}
                  </div>
                </div>
                <div className="p-2 bg-raised rounded border border-border">
                  <div className="text-[10px] text-text-muted">Slope Baseline</div>
                  <div className="font-bold text-accent-cyan text-sm">
                    #{validationReport.metrics_summary.baseline_slope.mean_rank}
                  </div>
                </div>
                <div className="p-2 bg-raised rounded border border-border">
                  <div className="text-[10px] text-text-muted">Random Expected</div>
                  <div className="font-bold text-text-muted text-sm">
                    #{validationReport.metrics_summary.baseline_random_expected_rank}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-status-warn/10 border border-status-warn/30 rounded-btn space-y-1">
              <div className="font-bold text-status-warn text-xs uppercase">
                Statistical Power & Scientific Limitations:
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                {validationReport.statistical_power_note}
              </p>
            </div>

            <div className="p-2 bg-raised rounded text-[10px] text-text-muted">
              Evaluated on: {validationReport.timestamp} across {validationReport.benchmark_evaluations.length} curated planetary benchmark pairings.
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-mono text-text-muted">
            Loading validation report...
          </div>
        )}
      </Card>
    </div>
  );
};

