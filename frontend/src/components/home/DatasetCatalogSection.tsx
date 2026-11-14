import React from "react";
import { Card, Badge, SectionHeading } from "../ui";
import { Dataset } from "../../api/client";

interface DatasetCatalogSectionProps {
  datasets: Dataset[];
}

export const DatasetCatalogSection: React.FC<DatasetCatalogSectionProps> = ({ datasets }) => {
  // Determine realistic status based on ingested dataset records
  const isIngested = (nameKeyword: string) =>
    datasets.some(
      (d) =>
        d.name.toLowerCase().includes(nameKeyword.toLowerCase()) ||
        d.source.toLowerCase().includes(nameKeyword.toLowerCase())
    );

  const catalog = [
    {
      name: "SRTM / NASADEM",
      body: "Earth",
      source: "NASA / USGS",
      resolution: "30 m",
      status: isIngested("SRTM") ? ("active" as const) : ("planned" as const),
      role: "Terrestrial digital elevation model",
    },
    {
      name: "MOLA MEGDR",
      body: "Mars",
      source: "NASA PDS / MGS",
      resolution: "463 m",
      status: isIngested("MOLA") ? ("active" as const) : ("planned" as const),
      role: "Martian topographic baseline",
    },
    {
      name: "LOLA DEM",
      body: "Moon",
      source: "NASA PDS / LRO",
      resolution: "118 m",
      status: isIngested("LOLA") ? ("active" as const) : ("planned" as const),
      role: "Lunar polar and global topographic model",
    },
    {
      name: "Copernicus GLO-30",
      body: "Earth",
      source: "ESA Copernicus",
      resolution: "30 m",
      status: "planned" as const,
      role: "High-resolution digital surface model",
    },
    {
      name: "CTX / HiRISE",
      body: "Mars",
      source: "NASA PDS / MRO",
      resolution: "0.25 - 6 m",
      status: "planned" as const,
      role: "High-resolution visual surface texture",
    },
    {
      name: "CRISM / M³ / EMIT",
      body: "Multi-body",
      source: "NASA PDS",
      resolution: "Varies",
      status: "planned" as const,
      role: "Hyperspectral surface mineralogy cubes",
    },
  ];

  return (
    <section className="space-y-6 pt-4 pb-8">
      <SectionHeading
        kicker="Data Sources"
        title="Integrated datasets"
        subtitle="Elevation models and imagery baselines used for terrain and texture characterization."
      />

      <Card className="p-0 overflow-hidden bg-surface border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-raised/60 border-b border-border text-text-muted">
              <tr>
                <th className="py-2.5 px-4 font-medium">Dataset</th>
                <th className="py-2.5 px-4 font-medium">Body</th>
                <th className="py-2.5 px-4 font-medium">Source</th>
                <th className="py-2.5 px-4 font-medium">Resolution</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {catalog.map((item) => (
                <tr key={item.name} className="hover:bg-raised/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-text-primary">
                    <div>{item.name}</div>
                    <div className="text-[11px] text-text-muted">{item.role}</div>
                  </td>
                  <td className="py-3 px-4 text-text-muted">{item.body}</td>
                  <td className="py-3 px-4 text-text-muted">{item.source}</td>
                  <td className="py-3 px-4 font-mono text-text-muted">{item.resolution}</td>
                  <td className="py-3 px-4">
                    <Badge variant={item.status === "active" ? "active" : "planned"}>
                      {item.status === "active" ? "Active" : "Planned"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
};
