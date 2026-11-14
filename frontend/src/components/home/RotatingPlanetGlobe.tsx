import React, { useRef, useEffect, useState } from "react";
import {
  GlobePlanet,
  NASAThreeGlobeScene,
  PLANET_CONFIGS,
} from "./NASAThreeGlobeRenderer";

interface PlanetTelemetry {
  name: string;
  radiusKm: string;
  gravity: string;
  rotationPeriod: string;
  axialTilt: string;
}

const PLANET_TELEMETRY: Record<GlobePlanet, PlanetTelemetry> = {
  earth: {
    name: "Earth (Terra)",
    radiusKm: "6,371 km",
    gravity: "9.81 m/s²",
    rotationPeriod: "23.93h",
    axialTilt: "23.44°",
  },
  moon: {
    name: "Moon (Luna)",
    radiusKm: "1,737 km",
    gravity: "1.62 m/s²",
    rotationPeriod: "27.32d",
    axialTilt: "1.54°",
  },
  mars: {
    name: "Mars",
    radiusKm: "3,390 km",
    gravity: "3.72 m/s²",
    rotationPeriod: "24.62h",
    axialTilt: "25.19°",
  },
};

const PLANET_LIST: GlobePlanet[] = ["earth", "moon", "mars"];

export const RotatingPlanetGlobe: React.FC = () => {
  const [activePlanet, setActivePlanet] = useState<GlobePlanet>("earth");
  const [isRotating, setIsRotating] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<NASAThreeGlobeScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 440;
    const scene = new NASAThreeGlobeScene(canvas, size, size);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setPlanet(activePlanet);
    }
  }, [activePlanet]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setRotation(isRotating);
    }
  }, [isRotating]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setSpeed(speed);
    }
  }, [speed]);

  const cycleNextPlanet = () => {
    const idx = PLANET_LIST.indexOf(activePlanet);
    const next = PLANET_LIST[(idx + 1) % PLANET_LIST.length];
    setActivePlanet(next);
  };

  const meta = PLANET_TELEMETRY[activePlanet];
  const cfg = PLANET_CONFIGS[activePlanet];

  return (
    <div className="w-full flex flex-col items-center justify-center relative select-none">
      {/* Floating Selector Pills (No enclosing box) */}
      <div className="flex items-center space-x-2 mb-2 z-20">
        <div className="inline-flex items-center space-x-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-2xl">
          {PLANET_LIST.map((p) => {
            const isSelected = activePlanet === p;
            return (
              <button
                key={p}
                onClick={() => setActivePlanet(p)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-all duration-200 ${
                  isSelected
                    ? "bg-white text-slate-950 shadow-glow"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? "Pause planetary spin" : "Resume spin"}
          className="px-3 py-1.5 rounded-full text-xs font-mono bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 font-medium transition-colors backdrop-blur-md"
        >
          {isRotating ? "Pause" : "Spin"}
        </button>

        <button
          onClick={() => setSpeed((prev) => (prev >= 2 ? 0.5 : prev + 0.5))}
          title="Adjust rotation speed"
          className="px-3 py-1.5 rounded-full text-xs font-mono bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 font-medium transition-colors backdrop-blur-md"
        >
          {speed}x
        </button>
      </div>

      {/* 3D Celestial Body Canvas (Direct in space - NO surrounding box outline) */}
      <div
        onClick={cycleNextPlanet}
        title="Click globe to cycle body (Earth • Moon • Mars) • Drag to rotate"
        className="relative cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-[0.99] flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          width={440}
          height={440}
          className="rounded-full touch-none"
        />

        {/* Minimal Floating Axial Tilt Tag */}
        <div className="absolute top-4 right-4 text-[10px] font-mono tracking-widest uppercase text-slate-300/80 bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10 pointer-events-none">
          Tilt {meta.axialTilt}
        </div>

        {/* Minimal Floating Cycle Hint */}
        <div className="absolute bottom-4 text-[10px] font-mono tracking-widest uppercase text-slate-400/80 bg-black/60 backdrop-blur-sm px-3 py-0.5 rounded-full border border-white/10 pointer-events-none">
          Click to cycle body
        </div>
      </div>

      {/* Minimal Floating Telemetry Strip (Text only, no box outlines) */}
      <div className="w-full text-center space-y-1.5 mt-2 z-10 font-mono">
        <div className="text-sm font-heading font-extrabold text-white tracking-wide">
          {meta.name}
        </div>
        <div className="text-[11px] text-slate-400 space-x-3">
          <span>Radius: <strong className="text-white font-semibold">{meta.radiusKm}</strong></span>
          <span>•</span>
          <span>Gravity: <strong className="text-sky-400 font-semibold">{meta.gravity}</strong></span>
          <span>•</span>
          <span>Day: <strong className="text-slate-300 font-semibold">{meta.rotationPeriod}</strong></span>
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest pt-0.5">
          {cfg.provenance} • Drag to rotate in 3D
        </div>
      </div>
    </div>
  );
};
