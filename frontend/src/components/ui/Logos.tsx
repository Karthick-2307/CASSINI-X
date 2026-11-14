import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AstraXLogo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  const svgSizes = {
    sm: 16,
    md: 20,
    lg: 28,
  }[size];

  return (
    <div className={`inline-flex items-center space-x-1 font-heading font-semibold tracking-wider select-none ${sizeClasses} ${className}`}>
      <span className="text-text-primary">ASTRA</span>
      <span className="text-text-muted">-</span>
      <div className="relative inline-flex items-center justify-center">
        {/* Custom SVG "X" glyph in solid accent color */}
        <svg
          width={svgSizes}
          height={svgSizes}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block align-middle"
          aria-label="X glyph"
        >
          <line x1="4" y1="4" x2="20" y2="20" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="4" x2="4" y2="20" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" fill="#38BDF8" />
        </svg>
      </div>
    </div>
  );
};

export const CassinXLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center space-x-1 select-none font-sans text-xs tracking-wider text-text-muted ${className}`}>
      <span>CASSIN</span>
      <span className="text-accent font-semibold">X</span>
    </div>
  );
};
