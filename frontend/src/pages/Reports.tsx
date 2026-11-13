import React from "react";
import {
  SectionHeading,
  Card,
  Badge,
  Button,
  EmptyState,
} from "../components/ui";

export const Reports: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Documentation & Export"
          title="Reports & Mission Dossiers"
          subtitle="Generate and download publication-ready scientific analog reports and PDF summaries documenting complete feature provenance."
        />
        <Badge variant="planned">Phase 7 Planned</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Report Configuration Form (Disabled) */}
        <Card className="lg:col-span-5 space-y-5 border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
              Compile Mission Dossier
            </h3>
            <span
              className="text-[11px] font-mono text-status-warn cursor-help"
              title="Form will activate once similarity analyses exist"
            >
              Form Inactive
            </span>
          </div>

          <div className="p-3 bg-panel border border-border rounded-btn text-xs text-text-muted space-y-1">
            <span className="font-semibold text-text-primary">Prerequisite Requirement:</span>
            <p>Report generation requires at least one completed similarity analysis in the database.</p>
          </div>

          <div className="space-y-4 opacity-50">
            <div className="space-y-1">
              <label className="text-xs font-mono text-text-muted">Target Analysis Run</label>
              <select disabled className="w-full bg-raised border border-border rounded-btn px-3 py-2 text-xs text-text-primary cursor-not-allowed">
                <option>No analyses available in database</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-text-muted">Dossier Classification</label>
              <select disabled className="w-full bg-raised border border-border rounded-btn px-3 py-2 text-xs text-text-primary cursor-not-allowed">
                <option>Full Scientific Dossier (PDF)</option>
                <option>Executive Mission Brief (Summary)</option>
                <option>Geological Context Summary</option>
              </select>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <label className="text-text-muted">Dossier Sections</label>
              <div className="space-y-1.5">
                <label className="flex items-center space-x-2 text-text-muted cursor-not-allowed">
                  <input type="checkbox" checked disabled className="rounded border-border" />
                  <span>Topographic Feature Distribution Charts</span>
                </label>
                <label className="flex items-center space-x-2 text-text-muted cursor-not-allowed">
                  <input type="checkbox" checked disabled className="rounded border-border" />
                  <span>Ranked Earth Candidates & Distance Metrics</span>
                </label>
                <label className="flex items-center space-x-2 text-text-muted cursor-not-allowed">
                  <input type="checkbox" checked disabled className="rounded border-border" />
                  <span>Dataset Provenance & Spatial Resolution Citations</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="md" disabled className="w-full">
                Generate Dossier PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Right: Generated Reports Archive (Empty State) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-heading font-bold text-text-primary uppercase tracking-wide">
              Generated Reports Archive
            </h3>
            <Badge variant="neutral">0 Dossiers</Badge>
          </div>

          <EmptyState
            title="No Reports Generated Yet"
            description="Generated PDF dossiers will be indexed here with download links, timestamps, target planetary bodies, and file sizes."
            reason="ReportLab compilation engine scheduled for Part 7."
          />
        </div>
      </div>
    </div>
  );
};
