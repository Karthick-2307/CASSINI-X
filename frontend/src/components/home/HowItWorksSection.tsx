import React from "react";
import { Card, SectionHeading } from "../ui";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: "1",
      title: "Upload an image or choose a region",
      description:
        "Provide a high-resolution orbital image of a Mars or Moon feature, or pick a curated landmark from planetary nomenclature catalogs.",
    },
    {
      num: "2",
      title: "Compare terrain and texture with Earth areas",
      description:
        "ASTRA-X extracts morphometric features (relative elevation, slope, roughness) and image texture at standardized spatial scales.",
    },
    {
      num: "3",
      title: "Review ranked locations with explanations, confidence and sources",
      description:
        "Inspect ranked candidates with transparent mathematical delta breakdowns, independent confidence scores, and open dataset provenance.",
    },
  ];

  return (
    <section id="how-it-works" className="space-y-8 pt-4 pb-6 scroll-mt-20">
      <SectionHeading
        kicker="Methodology"
        title="How it works"
        subtitle="A transparent three-step process connecting planetary observations to comparable Earth terrains."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <Card key={step.num} className="space-y-3 bg-[#111826] border border-[#243044] p-6 hover:border-[#38BDF8]/50 transition-colors shadow-sm">
            <span className="text-sm font-mono font-bold text-[#38BDF8]">
              0{step.num}
            </span>
            <h3 className="text-lg font-heading font-semibold text-[#F8FAFC] leading-snug">
              {step.title}
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed font-sans">
              {step.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
};
