import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  GlassPanel,
  Badge,
  SectionHeading,
} from "../components/ui";
import { api, Dataset, AnalogMatch } from "../api/client";
import {
  HeroSection,
  HowItWorksSection,
  CapabilitiesSection,
  DatasetCatalogSection,
} from "../components/home";

export const Home: React.FC = () => {
  const [featuredAnalogs, setFeaturedAnalogs] = useState<AnalogMatch[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    // 5. Featured discoveries: loads from GET /api/analogs?limit=3.
    // If empty, hidden completely.
    api.getFeaturedAnalogs(3).then((data) => {
      setFeaturedAnalogs(data);
    });

    // 6. Real datasets response for status indicators
    api.getDatasets().then((data) => {
      setDatasets(data);
    }).catch(() => {
      setDatasets([]);
    });
  }, []);

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-24 py-6">
      {/* 1. HERO SECTION */}
      <HeroSection onScrollToHowItWorks={scrollToHowItWorks} />

      {/* 2. RESEARCH OBJECTIVE SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassPanel className="text-center py-10 px-6 sm:px-12 space-y-4 border border-sky-500/30 bg-slate-900/85 backdrop-blur-xl shadow-2xl">
          <span className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase px-3.5 py-1 rounded-full bg-sky-950/80 border border-sky-400/40 shadow-sm inline-block">
            Primary Scientific Objective
          </span>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white leading-tight pt-2 drop-shadow-sm">
            "Given a selected region on Mars or the Moon, which locations on Earth have comparable terrain characteristics?"
          </blockquote>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed pt-2">
            ASTRA-X extracts quantitative topographic morphology—relative elevation, slope, and roughness—from open orbital altimetry, performing transparent multi-attribute similarity matching against terrestrial terrains.
          </p>
        </GlassPanel>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <HowItWorksSection />

      {/* 4. CORE CAPABILITIES (6 MODULES) */}
      <CapabilitiesSection />

      {/* 5. FEATURED DISCOVERIES SECTION (HIDDEN COMPLETELY WHEN EMPTY) */}
      {featuredAnalogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeading
            kicker="Curated Matches"
            title="Featured Terrestrial Discoveries"
            subtitle="Verified terrestrial analog matches derived from open elevation dataset comparisons."
            align="center"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAnalogs.map((item) => (
              <Card key={item.id} className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-text-muted">
                  <span>Target: {item.target_planet}</span>
                  <Badge variant="derived">Score: {(item.similarity_score * 100).toFixed(1)}%</Badge>
                </div>
                <h3 className="text-lg font-heading font-bold text-text-primary">{item.earth_analog_name}</h3>
                <p className="text-xs text-text-muted">Analog for {item.target_region_name}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 6. DATASET SOURCES SECTION */}
      <DatasetCatalogSection datasets={datasets} />

      {/* 7. CALL TO ACTION SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassPanel className="text-center py-12 px-6 sm:px-12 space-y-6 border border-sky-500/30 bg-slate-900/85 backdrop-blur-xl shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
            Ready to Discover Analog Terrains?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Begin by selecting a reference crater, plain, or volcanic structure on Mars or the Moon to evaluate against Earth's topography.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link to="/discovery">
              <Button variant="primary" size="lg">
                Launch the explorer
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg">
                Explore Scientific Methodology
              </Button>
            </Link>
          </div>
        </GlassPanel>
      </section>
    </div>
  );
};
