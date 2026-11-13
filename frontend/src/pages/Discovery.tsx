import React from "react";
import { SectionHeading, Card, Badge, EmptyState } from "../components/ui";

export const Discovery: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Geospatial Mapping"
          title="Discovery Explorer"
          subtitle="Interactive dual-map interface pairing target planetary zones with ranked Earth analogs."
        />
        <Badge variant="planned">Phase 6 Planned</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <EmptyState
            title="Interactive MapLibre Canvas"
            description="The dual-globe synchronous terrain viewer will be integrated in Part 6, connecting target coordinate queries with real elevation rasters."
            reason="Awaiting Part 4 raster ingestion pipeline and Part 5 similarity engine."
          />
        </div>
        <div className="lg:col-span-4">
          <Card className="space-y-4">
            <h3 className="text-sm font-heading font-semibold text-text-primary">
              Candidate Analog Rankings
            </h3>
            <p className="text-xs text-text-muted">
              Rankings appear here once a reference target region is selected on Mars or the Moon.
            </p>
            <div className="text-xs font-mono text-text-muted/60 italic py-6 text-center border border-dashed border-border rounded-btn">
              No target selected yet
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
