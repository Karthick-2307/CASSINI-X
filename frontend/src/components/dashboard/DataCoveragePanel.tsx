import React from "react";
import { Card, Badge, EmptyState } from "../ui";
import { DashboardSummaryResponse } from "../../api/client";

interface DataCoveragePanelProps {
  coverageItems: DashboardSummaryResponse["data_coverage"];
}

export const DataCoveragePanel: React.FC<DataCoveragePanelProps> = ({ coverageItems }) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-base font-heading font-bold text-text-primary">
            Dataset Ingestion Coverage
          </h3>
          <p className="text-xs text-text-muted">
            Spatial raster coverage percentage by planetary body.
          </p>
        </div>
        <Badge variant="measured">{coverageItems.length} Cataloged</Badge>
      </div>

      {coverageItems.length === 0 ? (
        <EmptyState
          title="No Datasets Ingested Yet"
          description="Raster digital elevation models (SRTM, LOLA, MOLA) have not been ingested into the raw archive yet."
          reason="Ingestion pipelines are scheduled for Phase 4."
        />
      ) : (
        <div className="space-y-3">
          {coverageItems.map((ds) => (
            <div key={ds.dataset_id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-text-primary">{ds.name} ({ds.planet})</span>
                <span className="font-mono text-text-muted">
                  {ds.coverage_percent !== null ? `${ds.coverage_percent.toFixed(1)}%` : "Pending calculation"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-raised overflow-hidden">
                <div
                  className="h-full bg-accent-cyan rounded-full transition-all"
                  style={{ width: `${ds.coverage_percent || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
