import React, { useRef, useEffect } from "react";
import {
  GlobePlanet,
  NASAThreeGlobeScene,
} from "./NASAThreeGlobeRenderer";

export interface RotatingPlanetGlobeProps {
  activePlanet?: GlobePlanet;
  className?: string;
}

export const RotatingPlanetGlobe: React.FC<RotatingPlanetGlobeProps> = ({
  activePlanet = "mars",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<NASAThreeGlobeScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High resolution canvas buffer for smooth spherical rendering
    const size = 600;
    const scene = new NASAThreeGlobeScene(canvas, size, size);
    sceneRef.current = scene;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      scene.setRotation(false);
    } else {
      scene.setRotation(true);
      scene.setSpeed(0.7); // Majestic slow rotation
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
    <div
      className={`relative w-full flex items-center justify-center select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px] lg:w-[580px] lg:h-[580px] touch-none cursor-grab active:cursor-grabbing bg-transparent"
        aria-label={`Interactive 3D representation of ${activePlanet}`}
      />
    </div>
  );
};
