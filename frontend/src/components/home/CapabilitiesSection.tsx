import React from "react";
import { Card, SectionHeading } from "../ui";

export const CapabilitiesSection: React.FC = () => {
  const items = [
    {
      title: "Ranked Earth locations on a map",
      description:
        "Interactive global MapLibre viewport plotting terrestrial candidate sites with color-coded similarity markers.",
    },
    {
      title: "Separate similarity and confidence scores",
      description:
        "Physical morphometric affinity and dataset coverage confidence are computed and reported as independent values.",
    },
    {
      title: "Feature-by-feature explanation",
      description:
        "Transparent breakdowns showing target vs. candidate elevation, slope, and roughness values, with why-it-matches rationales.",
    },
    {
      title: "Standardized geospatial exports",
      description:
        "Export discovery records directly to KML for Google Earth, GeoJSON, CSV, or compile a complete scientific PDF report.",
    },
  ];

  return (
    <section className="space-y-8 pt-4 pb-6">
      <SectionHeading
        kicker="Outputs"
        title="What you get"
        subtitle="Key deliverables provided for every planetary analog analysis."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item, idx) => (
          <Card key={idx} className="space-y-2.5 bg-surface border-border p-5">
            <span className="text-xs font-mono text-accent">0{idx + 1}</span>
            <h3 className="text-base font-heading font-semibold text-text-primary">
              {item.title}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              {item.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
};
