import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui";
import { RotatingPlanetGlobe } from "./RotatingPlanetGlobe";

interface HeroSectionProps {
  onScrollToHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToHowItWorks }) => {
  return (
    <section className="pt-4 pb-12 sm:pt-8 sm:pb-16 border-b border-border">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Heading, Paragraph, Buttons */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold text-text-primary tracking-normal leading-tight">
            Discover planetary analogs
          </h1>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed font-sans max-w-xl">
            Upload an orbital image of a Mars or Moon region, or choose a reference region. ASTRA-X compares terrain and image texture with Earth locations and explains every match.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 items-center">
            <Link to="/discovery?mode=image">
              <Button variant="primary" size="lg">
                Upload a planetary image
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              onClick={onScrollToHowItWorks}
            >
              How it works
            </Button>
          </div>
        </div>

        {/* Right Column: Simplified 3D Globe */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <RotatingPlanetGlobe />
        </div>
      </div>
    </section>
  );
};
