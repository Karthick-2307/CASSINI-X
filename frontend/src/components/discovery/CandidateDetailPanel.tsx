import React, { useState } from "react";
import { Card, Badge, Button } from "../ui";
import { CandidateMatch, api } from "../../api/client";
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
  uploadedImageUrl?: string | null;
  uploadedResolutionMPerPx?: number | "";
  onGenerateReport?: (candidateId: number) => void;
}

type DetailTab = "summary" | "features" | "explanation" | "sources";

export const CandidateDetailPanel: React.FC<CandidateDetailPanelProps> = ({
  selectedCandidate,
  uploadedImageUrl,
  uploadedResolutionMPerPx,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>("summary");
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (!selectedCandidate) {
    return (
      <Card className="lg:col-span-3 space-y-4 border-[#243044] bg-[#111826] p-5 shadow-sm">
        <h3 className="text-sm font-heading font-semibold text-[#F8FAFC]">
          Candidate Analysis
        </h3>
        <div className="py-16 text-center text-xs text-[#94A3B8] font-sans space-y-1">
          <div className="text-[#E5E7EB] font-medium">No candidate selected</div>
          <p className="text-[11px] text-[#94A3B8]/80">
            Click any row in the ranking table or map pin to inspect candidate characteristics.
          </p>
        </div>
      </Card>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/@${selectedCandidate.lat},${selectedCandidate.lon},15z/data=!3m1!1e3`;
  const googleEarthUrl = `https://earth.google.com/web/@${selectedCandidate.lat},${selectedCandidate.lon},0a,5000d,35y,0h,0t,0r`;

  // Geospatial exports
  const handleExportGeoJSON = () => {
    const geojson = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [selectedCandidate.lon, selectedCandidate.lat],
      },
      properties: {
        name: selectedCandidate.location_name,
        similarity: selectedCandidate.similarity,
        confidence: selectedCandidate.confidence,
        coverage: selectedCandidate.data_coverage,
        cluster: selectedCandidate.cluster_id,
        is_anomaly: selectedCandidate.is_anomaly,
      },
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCandidate.location_name.replace(/\s+/g, "_")}_analog.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice("GeoJSON exported successfully.");
  };

  const handleExportKML = () => {
    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Placemark>
    <name>${selectedCandidate.location_name}</name>
    <description>ASTRA-X Terrestrial Analog. Similarity: ${selectedCandidate.similarity.toFixed(1)}%, Confidence: ${selectedCandidate.confidence.toFixed(1)}%</description>
    <Point>
      <coordinates>${selectedCandidate.lon},${selectedCandidate.lat},0</coordinates>
    </Point>
  </Placemark>
</kml>`;
    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCandidate.location_name.replace(/\s+/g, "_")}_analog.kml`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice("KML exported successfully.");
  };

  const handleExportCSV = () => {
    const headers = "Location,Latitude,Longitude,Similarity,Confidence,Coverage,Cluster,Anomaly\n";
    const row = `"${selectedCandidate.location_name}",${selectedCandidate.lat},${selectedCandidate.lon},${selectedCandidate.similarity.toFixed(2)},${selectedCandidate.confidence.toFixed(2)},${selectedCandidate.data_coverage},${selectedCandidate.cluster_id ?? 0},${selectedCandidate.is_anomaly ? "True" : "False"}\n`;
    const blob = new Blob([headers + row], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCandidate.location_name.replace(/\s+/g, "_")}_analog.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice("CSV exported successfully.");
  };

  const handleGeneratePdf = async () => {
    try {
      setPdfGenerating(true);
      setExportNotice(null);
      const res = await api.generateReport({
        analysis_id: selectedCandidate.target_region_id || 1,
        candidate_ids: [selectedCandidate.id],
        title: `Analog Dossier: ${selectedCandidate.location_name}`,
      });
      window.open(api.getReportDownloadUrl(res.id), "_blank");
      setExportNotice("PDF report generated successfully.");
    } catch {
      setExportNotice("PDF generation failed: check backend reports service.");
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <Card className="lg:col-span-3 space-y-4 border-[#243044] bg-[#111826] p-5 shadow-sm text-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#243044]">
        <div>
          <h3 className="text-sm font-heading font-semibold text-[#F8FAFC]">
            {selectedCandidate.location_name}
          </h3>
          <div className="text-[11px] font-mono text-[#94A3B8]">
            {selectedCandidate.lat.toFixed(4)}°N, {selectedCandidate.lon.toFixed(4)}°E
          </div>
        </div>
        <Badge variant="derived" className="bg-[#162033] border-[#38BDF8]/40 text-[#38BDF8] font-mono font-bold">
          {selectedCandidate.similarity.toFixed(1)}% Sim
        </Badge>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center space-x-1 p-1 rounded-btn bg-[#162033] border border-[#243044]">
        {(["summary", "features", "explanation", "sources"] as DetailTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 text-center rounded capitalize text-[11px] font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#111826] text-[#38BDF8] font-semibold border border-[#38BDF8]/40 shadow-sm"
                : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === "summary" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className="p-3 rounded-card bg-[#162033] border border-[#243044] shadow-sm">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] block mb-1">Similarity Score</span>
              <span className="text-xl font-mono font-bold text-[#38BDF8]">
                {selectedCandidate.similarity.toFixed(1)}%
              </span>
            </div>
            <div className="p-3 rounded-card bg-[#162033] border border-[#243044] shadow-sm">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] block mb-1">Confidence Score</span>
              <span className="text-xl font-mono font-bold text-[#34D399]">
                {selectedCandidate.confidence.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Visual scale comparison if image mode */}
          {uploadedImageUrl && (
            <div className="p-3 rounded-card bg-[#162033] border border-[#243044] space-y-2 shadow-sm">
              <div className="text-[11px] font-medium text-[#F8FAFC]">
                Orbital Image vs Terrestrial Tile
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <img
                    src={uploadedImageUrl}
                    alt="Target orbital patch"
                    className="h-20 w-full object-cover rounded border border-[#243044]"
                  />
                  <div className="text-[10px] font-mono text-[#94A3B8] mt-1 text-center">
                    Target (~{uploadedResolutionMPerPx || 6} m/px)
                  </div>
                </div>
                <div>
                  <div className="h-20 w-full bg-[#0B0F17] rounded border border-[#243044] flex items-center justify-center text-[10px] font-mono text-[#94A3B8]">
                    SRTM Tile (30m/px)
                  </div>
                  <div className="text-[10px] font-mono text-[#94A3B8] mt-1 text-center">
                    Earth Candidate
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-card bg-[#162033]/60 border border-[#243044] text-[11px] text-[#94A3B8] leading-relaxed">
            ASTRA-X provides scientific decision support. Results do not certify landing or habitation safety.
          </div>
        </div>
      )}

      {/* TAB 2: FEATURES */}
      {activeTab === "features" && (
        <div className="space-y-3">
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-[11px] font-mono">
              <thead className="bg-raised text-text-muted text-[10px]">
                <tr>
                  <th className="py-1 px-2 text-left">Feature</th>
                  <th className="py-1 px-2 text-right">Target</th>
                  <th className="py-1 px-2 text-right">Cand</th>
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
                      {f.target_value.toFixed(1)}
                    </td>
                    <td className="py-1 px-2 text-right text-text-primary">
                      {f.candidate_value.toFixed(1)}
                    </td>
                    <td className="py-1 px-2 text-right text-accent font-medium">
                      {f.difference > 0 ? `+${f.difference.toFixed(1)}` : f.difference.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-feature contribution bar chart */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-text-muted block">
              Feature Distance Contribution
            </span>
            <div className="h-24 w-full bg-raised p-2 rounded border border-border">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedCandidate.feature_comparison.map((f) => ({
                    name: f.feature.split("_")[0],
                    contribution: f.contribution,
                  }))}
                  layout="vertical"
                  margin={{ top: 2, right: 6, left: 6, bottom: 2 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 9, fill: "#94A3B8" }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111826",
                      borderColor: "#1E293B",
                      fontSize: "10px",
                    }}
                  />
                  <Bar dataKey="contribution" fill="#38BDF8" radius={[0, 2, 2, 0]}>
                    {selectedCandidate.feature_comparison.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? "#38BDF8" : i === 1 ? "#34D399" : "#FBBF24"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPLANATION */}
      {activeTab === "explanation" && (
        <div className="space-y-2.5">
          {selectedCandidate.explanation.similarities.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-status-ok font-semibold block">
                Why it matches:
              </span>
              <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                {selectedCandidate.explanation.similarities.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedCandidate.explanation.differences.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-border">
              <span className="text-[10px] font-mono uppercase text-status-warn font-semibold block">
                How it differs:
              </span>
              <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                {selectedCandidate.explanation.differences.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-2 rounded bg-raised border border-border text-[11px] font-mono space-y-1 mt-2">
            <div>Cluster: Group {selectedCandidate.cluster_id ?? 0}</div>
            <div>
              Status:{" "}
              {selectedCandidate.is_anomaly ? (
                <span className="text-status-warn">Morphological anomaly / outlier</span>
              ) : (
                <span className="text-status-ok">Nominal morphological cluster</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SOURCES & PROVENANCE */}
      {activeTab === "sources" && (
        <div className="space-y-2.5 text-[11px] font-mono">
          <div className="p-2.5 rounded bg-raised border border-border space-y-1">
            <div className="text-text-primary font-medium">Dataset Lineage</div>
            <div className="text-text-muted">Target: NASA MOLA / LOLA Altimetry (500m resampled)</div>
            <div className="text-text-muted">Candidate: NASA SRTM Global 30m DEM</div>
            <div className="text-text-muted">Algorithm: Multi-attribute Euclidean distance</div>
          </div>

          {selectedCandidate.confidence_components && (
            <div className="p-2.5 rounded bg-raised border border-border space-y-1">
              <div className="text-text-primary font-medium">Confidence Diagnostics</div>
              <div className="grid grid-cols-2 gap-1 text-text-muted">
                <div>Coverage: {selectedCandidate.confidence_components.coverage_score}%</div>
                <div>Scale: {selectedCandidate.confidence_components.resolution_score}%</div>
                <div>Features: {selectedCandidate.confidence_components.feature_score}%</div>
                <div>Spread: {selectedCandidate.confidence_components.spread_score}%</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* External Mapping Links */}
      <div className="pt-3 border-t border-[#243044] space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block">
          External Visualization
        </span>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center py-2 px-2.5 rounded-btn bg-[#162033] border border-[#243044] text-xs font-sans font-medium text-[#F8FAFC] hover:border-[#38BDF8] hover:text-[#38BDF8] transition-colors shadow-sm"
          >
            Open in Google Maps ↗
          </a>
          <a
            href={googleEarthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center py-2 px-2.5 rounded-btn bg-[#162033] border border-[#243044] text-xs font-sans font-medium text-[#F8FAFC] hover:border-[#38BDF8] hover:text-[#38BDF8] transition-colors shadow-sm"
          >
            Open in Google Earth ↗
          </a>
        </div>
      </div>

      {/* Export Actions */}
      <div className="pt-3 border-t border-[#243044] space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block">
          Export Candidate Data
        </span>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportKML} className="text-xs">
            KML
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportGeoJSON} className="text-xs">
            GeoJSON
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportCSV} className="text-xs">
            CSV
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleGeneratePdf}
          disabled={pdfGenerating}
          className="w-full text-xs font-semibold py-2 mt-2 shadow-sm"
        >
          {pdfGenerating ? "Generating..." : "Generate PDF report"}
        </Button>

        {exportNotice && (
          <p className="text-[10px] font-mono text-status-ok text-center mt-1">
            {exportNotice}
          </p>
        )}
      </div>
    </Card>
  );
};
