import React, { useRef, useEffect } from "react";
import { NASAThreeGlobeScene } from "./NASAThreeGlobeRenderer";

export interface RotatingPlanetGlobeProps {
  className?: string;
}

export const RotatingPlanetGlobe: React.FC<RotatingPlanetGlobeProps> = ({
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<NASAThreeGlobeScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || window.innerWidth || 1200;
    const height = container.clientHeight || 750;

    const scene = new NASAThreeGlobeScene(canvas, width, height);
    sceneRef.current = scene;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      scene.setRotation(false);
    } else {
      scene.setRotation(true);
      scene.setSpeed(0.8);
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      scene.setRotation(!e.matches);
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Responsive resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && sceneRef.current) {
          sceneRef.current.resize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", handleMotionChange);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none cursor-grab active:cursor-grabbing bg-transparent"
        aria-label="Interactive 3D simulation of Earth rotating with Moon orbiting in space"
      />
    </div>
  );
};
