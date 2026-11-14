import React, { useRef, useEffect, useState } from "react";
import {
  GlobePlanet,
  NASAThreeGlobeScene,
} from "./NASAThreeGlobeRenderer";

const PLANET_LIST: GlobePlanet[] = ["earth", "moon", "mars"];

export const RotatingPlanetGlobe: React.FC = () => {
  const [activePlanet, setActivePlanet] = useState<GlobePlanet>("earth");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<NASAThreeGlobeScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 380;
    const scene = new NASAThreeGlobeScene(canvas, size, size);
    sceneRef.current = scene;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      scene.setRotation(false);
    } else {
      scene.setRotation(true);
      scene.setSpeed(0.5); // Calm, slow auto-rotation
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      scene.setRotation(!e.matches);
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setPlanet(activePlanet);
    }
  }, [activePlanet]);

  return (
    <div className="w-full flex flex-col items-center justify-center select-none">
      {/* Body Selector (Earth / Moon / Mars) */}
      <div className="flex items-center space-x-1 p-1 rounded-btn bg-surface border border-border mb-3 z-10">
        {PLANET_LIST.map((p) => {
          const isSelected = activePlanet === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setActivePlanet(p)}
              className={`px-3 py-1 rounded text-xs font-sans font-medium capitalize transition-colors ${
                isSelected
                  ? "bg-raised text-accent font-semibold border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* 3D Celestial Body Canvas */}
      <div className="relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="rounded-full touch-none cursor-grab active:cursor-grabbing"
          aria-label={`Interactive 3D representation of ${activePlanet}`}
        />
      </div>

      {/* Single Caption */}
      <p className="text-xs text-text-muted font-sans mt-3 text-center">
        Drag to rotate
      </p>
    </div>
  );
};
