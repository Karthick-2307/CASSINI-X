import React, { useState, useEffect } from "react";
import {
  SectionHeading,
  Card,
  Badge,
  Button,
  LoadingSpinner,
  EmptyState,
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
  const [reportTitle, setReportTitle] = useState<string>("ASTRA-X Terrestrial Analog Scientific Dossier");
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initial load
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
        console.error("Reports page load error:", err);
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
      setSuccessMsg(`Report generated successfully: ${newReport.title} (${(newReport.file_size_bytes / 1024).toFixed(1)} KB)`);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Documentation & Export"
          title="Scientific Reports & Mission Dossiers"
          subtitle="Generate and download publication-ready scientific analog reports with ReportLab + Matplotlib charts, strict provenance, and disclaimers."
        />
        <div className="flex items-center space-x-2">
          <Badge variant="ok">Part 7 Active</Badge>
          <Badge variant="neutral">ReportLab PDF</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Report Configuration Form */}
        <Card className="lg:col-span-5 space-y-5 border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wide">
              Compile Scientific Dossier
            </h3>
            <Badge variant="ok">Live Generator</Badge>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-text-muted">Target Analysis Run</label>
              {analyses.length > 0 ? (
                <select
                  value={selectedAnalysisId || ""}
                  onChange={(e) => setSelectedAnalysisId(Number(e.target.value))}
                  className="w-full bg-raised border border-border rounded-btn px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-cyan"
                >
                  {analyses.map((an) => (
                    <option key={an.id} value={an.id}>
                      Analysis #{an.id}: {an.target_region_name} ({an.planet})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs font-mono text-status-warn p-2 bg-raised rounded border border-border">
                  No similarity analyses run yet. Run an analysis from the Discovery / Analysis page first.
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-text-muted">Dossier Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="ASTRA-X Terrestrial Analog Scientific Dossier"
                className="w-full bg-raised border border-border rounded-btn px-3 py-2 text-xs font-sans text-text-primary focus:outline-none focus:border-accent-cyan"
              />
            </div>

            {/* Included PDF Sections Overview */}
            <div className="space-y-2 text-xs font-mono pt-1">
              <label className="text-text-muted">Standard Dossier Structure (ReportLab):</label>
              <div className="p-3 bg-raised border border-border rounded-panel space-y-1 text-text-muted text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-accent-cyan font-bold">•</span>
                  <span>Title Page (CASSIN X, ASTRA-X, Generation Timestamp)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-cyan font-bold">•</span>
                  <span>Planetary Target Region Physical Parameters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-cyan font-bold">•</span>
                  <span>Ranked Terrestrial Candidates (Similarity, Confidence, Suitability)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-cyan font-bold">•</span>
                  <span>Feature-Level Dimensional Comparison Table</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-cyan font-bold">•</span>
                  <span>Embedded Matplotlib Elevation Profile & Feature Distribution Chart</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-cyan font-bold">•</span>
                  <span>Dataset Provenance Table (Resolution, Sensor, Licence, Version)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-cyan font-bold">•</span>
                  <span>Uncertainty, Limitations, and Part 0 Mandatory Disclaimers</span>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs font-mono text-status-danger p-2 bg-rose-950/20 border border-rose-900 rounded">
                {error}
              </p>
            )}

            {successMsg && (
              <p className="text-xs font-mono text-status-success p-2 bg-emerald-950/20 border border-emerald-900 rounded">
                {successMsg}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={generating || !selectedAnalysisId}
              className="w-full"
            >
              {generating ? "Compiling PDF Dossier..." : "Generate PDF Dossier"}
            </Button>
          </form>
        </Card>

        {/* Right: Generated Reports Archive */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wide">
              Generated Reports Archive
            </h3>
            <Badge variant="neutral">{reports.length} Dossier{reports.length === 1 ? "" : "s"}</Badge>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : reports.length === 0 ? (
            <EmptyState
              title="No Reports Generated Yet"
              description="Generated PDF dossiers will be indexed here with direct download links, timestamps, target analyses, and exact file sizes."
              reason="Configure an analysis run on the left and click 'Generate PDF Dossier'."
            />
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <Card
                  key={rep.id}
                  className="p-4 bg-slate-900/80 border-white/10 hover:border-sky-400 shadow-lg transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-slate-100"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-sky-400">
                        Dossier #{rep.id}
                      </span>
                      <Badge variant="ok">PDF</Badge>
                      <span className="text-[11px] font-mono text-slate-400">
                        Analysis #{rep.analysis_id}
                      </span>
                    </div>
                    <h4 className="text-sm font-heading font-bold text-white">
                      {rep.title}
                    </h4>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-3">
                      <span>Created: {new Date(rep.created_at).toLocaleString()}</span>
                      <span>Size: {formatFileSize(rep.file_size_bytes)}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <a
                      href={api.getReportDownloadUrl(rep.id)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary" size="sm">
                        Download PDF
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
