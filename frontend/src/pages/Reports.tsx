import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SectionHeading,
  Card,
  Button,
  LoadingSpinner,
  EmptyState,
  ErrorMessage,
} from "../components/ui";
import {
  api,
  AnalysisSummaryItem,
  ReportItemResponse,
} from "../api/client";

export const Reports: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisSummaryItem[]>([]);
  const [reports, setReports] = useState<ReportItemResponse[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [reportTitle, setReportTitle] = useState<string>("ASTRA-X Terrestrial Analog Dossier");
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [anList, repList] = await Promise.all([
          api.getAnalyses(),
          api.getReports(),
        ]);
        setAnalyses(anList);
        setReports(repList);
        if (anList.length > 0) {
          setSelectedAnalysisId(anList[0].id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnalysisId) return;

    try {
      setGenerating(true);
      setError(null);
      setSuccessMsg(null);

      const newReport = await api.generateReport({
        analysis_id: selectedAnalysisId,
        title: reportTitle.trim() || undefined,
      });

      setReports((prev) => [newReport, ...prev]);
      setSuccessMsg(`Report generated: ${newReport.title} (${(newReport.file_size_bytes / 1024).toFixed(1)} KB)`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to compile PDF report.");
    } finally {
      setGenerating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <SectionHeading
          kicker="Documentation"
          title="Scientific reports"
          subtitle="Generate and download publication-ready analog dossiers with complete feature attribution and provenance."
        />
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {successMsg && (
        <div className="p-3 bg-raised border border-status-ok/40 rounded-btn text-xs text-status-ok font-mono">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Compile Report Form */}
        <Card className="lg:col-span-5 space-y-4 bg-surface border-border p-6">
          <h3 className="text-base font-heading font-semibold text-text-primary">
            Compile new dossier
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-text-muted mb-1">Source Analysis Run</label>
              {analyses.length > 0 ? (
                <select
                  value={selectedAnalysisId || ""}
                  onChange={(e) => setSelectedAnalysisId(Number(e.target.value))}
                  className="w-full bg-raised border border-border rounded px-3 py-2 text-xs text-text-primary font-mono"
                >
                  {analyses.map((an) => (
                    <option key={an.id} value={an.id}>
                      Analysis #{an.id}: {an.target_region_name} ({an.planet})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded bg-raised border border-border text-text-muted">
                  No analyses run yet.{" "}
                  <Link to="/discovery" className="text-accent underline">
                    Run an analysis first
                  </Link>
                  .
                </div>
              )}
            </div>

            <div>
              <label className="block text-text-muted mb-1">Report Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="ASTRA-X Terrestrial Analog Dossier"
                className="w-full bg-raised border border-border rounded px-3 py-2 text-xs text-text-primary font-sans"
              />
            </div>

            <div className="p-3 rounded bg-raised border border-border text-[11px] text-text-muted leading-relaxed">
              Included sections: Target telemetry, candidate ranking, feature contribution charts, confidence breakdown, and dataset citations.
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={generating || analyses.length === 0}
              className="w-full font-medium"
            >
              {generating ? "Compiling PDF..." : "Generate PDF report"}
            </Button>
          </form>
        </Card>

        {/* Right: List of Generated Reports */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-base font-heading font-semibold text-text-primary">
            Generated reports ({reports.length})
          </h3>

          {loading ? (
            <LoadingSpinner label="Loading report history..." />
          ) : reports.length === 0 ? (
            <EmptyState
              title="No reports compiled yet"
              description="Compile a PDF dossier using the form on the left or export directly from candidate details in Discovery."
            />
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <Card
                  key={rep.id}
                  className="bg-surface border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="font-heading font-semibold text-text-primary text-sm">
                      {rep.title}
                    </h4>
                    <div className="flex items-center space-x-3 text-xs font-mono text-text-muted">
                      <span>Analysis #{rep.analysis_id}</span>
                      <span>•</span>
                      <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{formatFileSize(rep.file_size_bytes)}</span>
                    </div>
                  </div>

                  <a
                    href={api.getReportDownloadUrl(rep.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center py-1.5 px-3 rounded-btn bg-raised border border-border text-xs font-sans text-accent hover:border-accent/60 transition-colors shrink-0"
                  >
                    Download PDF ↓
                  </a>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
