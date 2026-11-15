import React, { useRef, useEffect } from "react";
import {
  GlobeViewMode,
  NASAThreeGlobeScene,
} from "./NASAThreeGlobeRenderer";

export interface RotatingPlanetGlobeProps {
  viewMode?: GlobeViewMode;
  className?: string;
}

export const RotatingPlanetGlobe: React.FC<RotatingPlanetGlobeProps> = ({
  viewMode = "earthrise",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<NASAThreeGlobeScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cinematic widescreen Earthrise resolution
    const width = 800;
    const height = 620;
    const scene = new NASAThreeGlobeScene(canvas, width, height);
    sceneRef.current = scene;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      scene.setRotation(false);
    } else {
      scene.setRotation(true);
      scene.setSpeed(0.8); // Smooth realistic rotation
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
      sceneRef.current.setMode(viewMode);
    }
  }, [viewMode]);

  return (
    <div
      className={`relative w-full flex items-center justify-center select-none overflow-visible ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={620}
        className="w-full max-w-[480px] sm:max-w-[620px] lg:max-w-[780px] h-auto aspect-[800/620] touch-none cursor-grab active:cursor-grabbing bg-transparent"
        aria-label="Interactive 3D representation of Earthrise from the Moon"
      />
    </div>
  );
};
