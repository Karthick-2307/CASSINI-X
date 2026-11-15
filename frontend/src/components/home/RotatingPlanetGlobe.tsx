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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<NASAThreeGlobeScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High-resolution canvas size (SpaceX cinematic scale)
    const size = 720;
    const scene = new NASAThreeGlobeScene(canvas, size, size);
    sceneRef.current = scene;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      scene.setRotation(false);
    } else {
      scene.setRotation(true);
      scene.setSpeed(0.65); // Majestic cinematic slow rotation
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
      ref={containerRef}
      className={`relative w-full flex items-center justify-center select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={720}
        height={720}
        className="w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] lg:w-[720px] lg:h-[720px] max-w-none touch-none cursor-grab active:cursor-grabbing drop-shadow-[0_0_50px_rgba(249,115,22,0.12)]"
        aria-label={`Interactive 3D representation of ${activePlanet}`}
      />
    </div>
  );
};
