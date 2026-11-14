import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CandidateMatch, api } from "../../api/client";
import { Card, Badge, Button } from "../ui";

export interface DiscoveryResultsSectionProps {
  candidates: CandidateMatch[];
  selectedCandidate: CandidateMatch | null;
  onSelectCandidate: (candidate: CandidateMatch) => void;
  targetRegionName?: string;
  uploadedImageUrl?: string | null;
}

export const DiscoveryResultsSection: React.FC<DiscoveryResultsSectionProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  targetRegionName = "Planetary Target",
  uploadedImageUrl,
}) => {
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (!selectedCandidate) {
    return (
      <Card className="p-8 text-center bg-[#111826] border border-[#243044]">
        <p className="text-xs text-[#94A3B8]">
          No analog candidate selected. Run a search or pick a feature to review match analytics.
        </p>
      </Card>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/@${selectedCandidate.lat},${selectedCandidate.lon},15z/data=!3m1!1e3`;
  const googleEarthUrl = `https://earth.google.com/web/@${selectedCandidate.lat},${selectedCandidate.lon},0a,5000d,35y,0h,0t,0r`;

  // Geospatial Exports
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
    const headers = "Location,Latitude,Longitude,Similarity,Confidence,Coverage,Cluster\n";
    const row = `"${selectedCandidate.location_name}",${selectedCandidate.lat},${selectedCandidate.lon},${selectedCandidate.similarity.toFixed(2)},${selectedCandidate.confidence.toFixed(2)},${selectedCandidate.data_coverage},${selectedCandidate.cluster_id ?? 0}\n`;
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

  // Prepare comparison data for Recharts BarChart
  const statsChartData = selectedCandidate.feature_comparison.map((f) => ({
    feature: f.feature.replace("_", " "),
    Target: Number(f.target_value.toFixed(1)),
    Candidate: Number(f.candidate_value.toFixed(1)),
    delta: Math.abs(f.difference),
    contribution: f.contribution,
  }));

  return (
    <div id="discovery-details" className="space-y-6 pt-2">
      {/* 1. Candidate Selection Strip (Ranked list) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            Ranked Terrestrial Analogs ({candidates.length})
          </span>
          <span className="text-[11px] font-mono text-[#94A3B8]">
            Click any site to fly the globe &amp; update analytics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {candidates.slice(0, 6).map((cand, idx) => {
            const isSelected = selectedCandidate.id === cand.id;
            return (
              <div
                key={cand.id}
                onClick={() => onSelectCandidate(cand)}
                className={`p-3 rounded-card border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#162033] border-[#38BDF8] shadow-md ring-1 ring-[#38BDF8]/40"
                    : "bg-[#111826] border-[#243044] hover:border-[#38BDF8]/60 hover:bg-[#162033]/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-[#38BDF8]">#{idx + 1}</span>
                  <Badge variant="derived">{cand.similarity.toFixed(1)}% Sim</Badge>
                </div>
                <div className="text-xs font-semibold text-[#F8FAFC] truncate">
                  {cand.location_name}
                </div>
                <div className="text-[10px] font-mono text-[#94A3B8] mt-0.5">
                  {cand.lat.toFixed(2)}°N, {cand.lon.toFixed(2)}°E • Conf: {cand.confidence.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Analytics & Graph Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Why It Matches & Explanation */}
        <Card className="lg:col-span-6 space-y-4 bg-[#111826] border border-[#243044] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#243044]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Scientific Explanation
              </span>
              <h3 className="text-base font-heading font-semibold text-[#F8FAFC]">
                Why it matches {targetRegionName}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#38BDF8]">
                {selectedCandidate.similarity.toFixed(1)}% Match
              </span>
            </div>
          </div>

          {/* Visual Thumbnail comparison if local image uploaded */}
          {uploadedImageUrl && (
            <div className="p-3 rounded-card bg-[#162033] border border-[#243044] space-y-2">
              <div className="text-xs font-medium text-[#F8FAFC]">
                Target Planetary Image vs Terrestrial Candidate Tile
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <img
                    src={uploadedImageUrl}
                    alt="Target orbital patch"
                    className="h-24 w-full object-cover rounded border border-[#243044]"
                  />
                  <div className="text-[10px] font-mono text-[#94A3B8] mt-1 text-center truncate">
                    Target Orbit (~6m/px)
                  </div>
                </div>
                <div>
                  <div className="h-24 w-full bg-[#0B0F17] rounded border border-[#243044] flex flex-col items-center justify-center text-[10px] font-mono text-[#94A3B8] p-2 text-center">
                    <span className="text-[#38BDF8] font-bold">SRTM 30m Tile</span>
                    <span>{selectedCandidate.location_name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#94A3B8] mt-1 text-center">
                    Earth Candidate
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Why it matches bullet list */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-[#34D399] font-bold block flex items-center space-x-1.5">
              <span>✓</span>
              <span>Morphological Concordance:</span>
            </span>
            <ul className="text-xs text-[#E5E7EB] space-y-2 list-none font-sans">
              {selectedCandidate.explanation.similarities.map((item, i) => (
                <li key={i} className="flex items-start space-x-2 bg-[#162033]/60 p-2 rounded border border-[#243044]/60">
                  <span className="text-[#34D399] font-bold">▪</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How it differs */}
          {selectedCandidate.explanation.differences.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#243044]">
              <span className="text-xs font-mono uppercase text-[#FBBF24] font-bold block flex items-center space-x-1.5">
                <span>⚠</span>
                <span>Topographic Differences:</span>
              </span>
              <ul className="text-xs text-[#94A3B8] space-y-1.5 list-none font-sans">
                {selectedCandidate.explanation.differences.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-[#FBBF24]">▪</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3 rounded bg-[#162033]/60 border border-[#243044] text-[11px] text-[#94A3B8] leading-relaxed">
            ASTRA-X provides scientific decision support. Results do not certify landing or habitation safety.
          </div>
        </Card>

        {/* Right Column: Comparative Statistics Graph (Recharts) */}
        <Card className="lg:col-span-6 space-y-4 bg-[#111826] border border-[#243044] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#243044]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Feature Diagnostics
              </span>
              <h3 className="text-base font-heading font-semibold text-[#F8FAFC]">
                Terrain Morphometry Statistics
              </h3>
            </div>
            <Badge variant="derived">Standardized 500m Scale</Badge>
          </div>

          {/* Recharts BarChart comparing Target vs Candidate */}
          <div className="h-64 w-full bg-[#162033] p-3 rounded-card border border-[#243044]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statsChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis
                  dataKey="feature"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111826",
                    borderColor: "#243044",
                    fontSize: "11px",
                    color: "#F8FAFC",
                    borderRadius: "6px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                <Bar dataKey="Target" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Planetary Target" />
                <Bar dataKey="Candidate" fill="#34D399" radius={[4, 4, 0, 0]} name="Earth Candidate" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature Delta Table */}
          <div className="border border-[#243044] rounded overflow-hidden">
            <table className="w-full text-[11px] font-mono">
              <thead className="bg-[#162033] text-[#94A3B8] border-b border-[#243044]">
                <tr>
                  <th className="py-1.5 px-3 text-left">Feature</th>
                  <th className="py-1.5 px-3 text-right">Target</th>
                  <th className="py-1.5 px-3 text-right">Earth Candidate</th>
                  <th className="py-1.5 px-3 text-right">&Delta; Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243044]/60">
                {selectedCandidate.feature_comparison.map((f) => (
                  <tr key={f.feature} className="hover:bg-[#162033]/40">
                    <td className="py-1.5 px-3 text-[#F8FAFC] capitalize">{f.feature.replace("_", " ")}</td>
                    <td className="py-1.5 px-3 text-right text-[#94A3B8]">{f.target_value.toFixed(1)}</td>
                    <td className="py-1.5 px-3 text-right text-[#F8FAFC] font-medium">{f.candidate_value.toFixed(1)}</td>
                    <td className="py-1.5 px-3 text-right text-[#38BDF8] font-bold">
                      {f.difference > 0 ? `+${f.difference.toFixed(1)}` : f.difference.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* External Links & Export Actions */}
          <div className="pt-2 border-t border-[#243044] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Export &amp; Mapping Actions:
              </span>
              <div className="flex items-center space-x-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-[#162033] border border-[#243044] text-[11px] font-medium text-[#F8FAFC] hover:border-[#38BDF8] hover:text-[#38BDF8] transition-colors"
                >
                  Google Maps ↗
                </a>
                <a
                  href={googleEarthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-[#162033] border border-[#243044] text-[11px] font-medium text-[#F8FAFC] hover:border-[#38BDF8] hover:text-[#38BDF8] transition-colors"
                >
                  Google Earth ↗
                </a>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportKML} className="text-xs">
                KML
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportGeoJSON} className="text-xs">
                GeoJSON
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportCSV} className="text-xs">
                CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGeneratePdf}
                disabled={pdfGenerating}
                className="text-xs font-semibold"
              >
                {pdfGenerating ? "Compiling..." : "PDF Report"}
              </Button>
            </div>

            {exportNotice && (
              <p className="text-[10px] font-mono text-status-ok text-center mt-1">
                {exportNotice}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
