import React from "react";
import { Card, Badge } from "../ui";

export type PlanetBody = "earth" | "moon" | "mars";

export interface BodyInfo {
  title: string;
  dataset: string;
  resolution: string;
  radius: string;
  gravity: string;
  desc: string;
}

export const BODY_DESCRIPTIONS: Record<PlanetBody, BodyInfo> = {
  earth: {
    title: "Earth (Terrestrial Baseline)",
    dataset: "NASA SRTM 1-Arc-Second (30m)",
    resolution: "30 meters",
    radius: "6,371.0 km",
    gravity: "9.807 m/s²",
    desc: "Lanzarote Volcanic Field: basaltic lava flows and volcanic cones used as reference analog study terrain.",
  },
  moon: {
    title: "The Moon (Lunar Surface)",
    dataset: "LRO LOLA Global Digital Elevation Model (118m)",
    resolution: "118 meters",
    radius: "1,737.4 km",
    gravity: "1.620 m/s²",
    desc: "Mare Tranquillitatis (Apollo 11 Basin): basaltic mare plains with impact craters and regolith mantling.",
  },
  mars: {
    title: "Mars (Martian Surface)",
    dataset: "MGS MOLA MEGDR Global DEM (463m)",
    resolution: "463 meters",
    radius: "3,389.5 km",
    gravity: "3.710 m/s²",
    desc: "Jezero Crater Floor & Delta: ancient lacustrine sedimentary fan and volcanic crater floor.",
  },
};

interface BodyContextCardProps {
  activeBody: PlanetBody;
}

export const BodyContextCard: React.FC<BodyContextCardProps> = ({ activeBody }) => {
  const currentInfo = BODY_DESCRIPTIONS[activeBody];

  return (
    <Card className="bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-heading font-extrabold text-white tracking-wide">
              {currentInfo.title}
            </h2>
            <Badge variant="measured">Active Viewport: {activeBody.toUpperCase()}</Badge>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            {currentInfo.desc}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono shrink-0">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 text-center min-w-[110px] backdrop-blur-md shadow-sm">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Mean Radius</div>
            <div className="font-bold text-white text-sm">{currentInfo.radius}</div>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 text-center min-w-[110px] backdrop-blur-md shadow-sm">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Surface Gravity</div>
            <div className="font-bold text-sky-400 text-sm">{currentInfo.gravity}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
