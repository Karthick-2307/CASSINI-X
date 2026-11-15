import React, { useEffect, useState } from "react";
import { api, Dataset } from "../api/client";
import {
  HeroSection,
  HowItWorksSection,
  CapabilitiesSection,
  DatasetCatalogSection,
} from "../components/home";

export const Home: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    // Factual dataset records from backend
    api.getDatasets()
      .then((data) => {
        setDatasets(data);
      })
      .catch(() => {
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
    <div className="w-full space-y-16">
      {/* 1. HERO SECTION (SpaceX-style full-bleed cinematic hero) */}
      <HeroSection onScrollToHowItWorks={scrollToHowItWorks} />

      {/* 2-4. Containerized Discovery Guidelines & Data Sections */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 space-y-16 pb-12">
        {/* 2. HOW IT WORKS (3 steps, plain cards) */}
        <HowItWorksSection />

        {/* 3. WHAT YOU GET (4 short items) */}
        <CapabilitiesSection />

        {/* 4. DATA SOURCES (Compact factual list) */}
        <DatasetCatalogSection datasets={datasets} />
      </div>
    </div>
  );
};

export default Home;
