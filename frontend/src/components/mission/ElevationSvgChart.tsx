import React from "react";

export interface ElevationSvgChartProps {
  profile: Array<{ distance_m: number; elevation_m: number; slope_deg: number }>;
}

export const ElevationSvgChart: React.FC<ElevationSvgChartProps> = ({ profile }) => {
  if (!profile || profile.length < 2) return null;

  const totalDist = profile[profile.length - 1].distance_m;
  const elevations = profile.map((p) => p.elevation_m);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = maxElev - minElev || 1.0;

  const width = 600;
  const height = 160;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 25;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const points = profile.map((p) => {
    const x = padLeft + (p.distance_m / (totalDist || 1)) * chartWidth;
    const y = padTop + chartHeight - ((p.elevation_m - minElev) / elevRange) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M ${points[0]} L ${points.join(" L ")} L ${points[points.length - 1].split(",")[0]},${padTop + chartHeight} L ${padLeft},${padTop + chartHeight} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <path d={areaD} fill="rgba(6, 182, 212, 0.12)" />
        <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
        <line
          x1={padLeft}
          y1={padTop + chartHeight}
          x2={width - padRight}
          y2={padTop + chartHeight}
          stroke="#334155"
          strokeWidth="1"
        />
        <text
          x={padLeft - 6}
          y={padTop + 8}
          textAnchor="end"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="monospace"
        >
          {maxElev.toFixed(0)}m
        </text>
        <text
          x={padLeft - 6}
          y={padTop + chartHeight}
          textAnchor="end"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="monospace"
        >
          {minElev.toFixed(0)}m
        </text>
        <text
          x={padLeft}
          y={height - 6}
          textAnchor="start"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="monospace"
        >
          0 km
        </text>
        <text
          x={width - padRight}
          y={height - 6}
          textAnchor="end"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="monospace"
        >
          {(totalDist / 1000).toFixed(2)} km
        </text>
      </svg>
    </div>
  );
};

