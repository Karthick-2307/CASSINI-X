import React, { useMemo } from "react";

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  color: string;
  glow: string;
  duration: number;
  delay: number;
}

const STAR_COLORS = [
  { color: "#FFFFFF", glow: "rgba(255, 255, 255, 0.8)" },      // Brilliant diamond white
  { color: "#BAE6FD", glow: "rgba(56, 189, 248, 0.75)" },     // O/B-type celestial cyan-blue
  { color: "#FDE68A", glow: "rgba(251, 191, 36, 0.7)" },      // G-type warm solar gold
  { color: "#FCA5A5", glow: "rgba(248, 113, 113, 0.65)" },    // M-type soft ruby dwarf
  { color: "#DDD6FE", glow: "rgba(192, 132, 252, 0.7)" },     // Violet-white stellar nebula
  { color: "#E2E8F0", glow: "rgba(226, 232, 240, 0.6)" },     // Pure starlight silver
];

// Simple deterministic pseudo-random number generator for consistent star distribution
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const StarfieldBackground: React.FC = () => {
  const stars = useMemo<Star[]>(() => {
    const rng = seededRandom(42);
    const starList: Star[] = [];
    const count = 180;

    for (let i = 0; i < count; i++) {
      const colorScheme = STAR_COLORS[Math.floor(rng() * STAR_COLORS.length)];
      // Varied star sizes: majority are subtle 1px-1.5px, a few bright 2px-2.5px focal stars
      const sizeRand = rng();
      const size = sizeRand < 0.65 ? 1 : sizeRand < 0.90 ? 1.5 : 2.2;

      starList.push({
        id: i,
        top: Math.round(rng() * 1000) / 10,  // 0% to 100%
        left: Math.round(rng() * 1000) / 10, // 0% to 100%
        size,
        color: colorScheme.color,
        glow: colorScheme.glow,
        duration: Math.round((2.0 + rng() * 4.5) * 10) / 10, // 2.0s to 6.5s
        delay: Math.round((rng() * 5.0) * 10) / 10,          // 0s to 5.0s
      });
    }

    return starList;
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full star-twinkle"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow:
              star.size > 1.2
                ? `0 0 ${star.size * 2}px ${star.glow}`
                : undefined,
            // Custom CSS variables driving the async twinkle animation
            ["--twinkle-duration" as string]: `${star.duration}s`,
            ["--twinkle-delay" as string]: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default StarfieldBackground;
