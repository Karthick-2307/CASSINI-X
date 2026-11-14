import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AstraXLogo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  const svgSizes = {
    sm: 18,
    md: 22,
    lg: 32,
  }[size];

  return (
    <div className={`inline-flex items-center space-x-1.5 font-heading font-bold tracking-[0.2em] select-none ${sizeClasses} ${className}`}>
      <span className="text-white font-extrabold">ASTRA</span>
      <span className="text-slate-400 font-bold">-</span>
      <div className="relative inline-flex items-center justify-center">
        {/* Custom SVG "X" glyph with orbital/trajectory aesthetic */}
        <svg
          width={svgSizes}
          height={svgSizes}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block align-middle"
          aria-label="X orbit glyph"
        >
          <defs>
            <linearGradient id="orbitGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="orbitGradReverse" x1="22" y1="2" x2="2" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          {/* First trajectory line */}
          <line x1="4" y1="4" x2="20" y2="20" stroke="url(#orbitGrad)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Second trajectory line */}
          <line x1="20" y1="4" x2="4" y2="20" stroke="url(#orbitGradReverse)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Central orbital node */}
          <circle cx="12" cy="12" r="2.5" fill="#0284C7" />
        </svg>
      </div>
    </div>
  );
};

export const CassinXLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <span className="font-heading text-xs uppercase tracking-[0.25em] text-slate-300 hover:text-white font-medium transition-colors">
        CASSIN <span className="text-sky-400 font-bold">X</span>
      </span>
      <div className="w-full h-[1.5px] bg-gradient-to-r from-blue-500 via-sky-400 to-transparent mt-0.5" />
    </div>
  );
};

