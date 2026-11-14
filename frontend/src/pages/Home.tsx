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
    <div className="space-y-16 py-2">
      {/* 1. HERO SECTION */}
      <HeroSection onScrollToHowItWorks={scrollToHowItWorks} />

      {/* 2. HOW IT WORKS (3 steps, plain cards) */}
      <HowItWorksSection />

      {/* 3. WHAT YOU GET (4 short items) */}
      <CapabilitiesSection />

      {/* 4. DATA SOURCES (Compact factual list) */}
      <DatasetCatalogSection datasets={datasets} />
    </div>
  );
};

export default Home;
