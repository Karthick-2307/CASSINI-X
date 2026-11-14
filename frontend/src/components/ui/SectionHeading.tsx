import React from "react";

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  align?: "left" | "center";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  kicker,
  align = "left",
  className = "",
}) => {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col space-y-2 ${alignment} ${className}`}>
      {kicker && (
        <span className="text-xs font-mono font-semibold tracking-widest text-sky-400 uppercase px-2.5 py-0.5 rounded-full bg-sky-950/60 border border-sky-500/30 inline-block shadow-sm">
          {kicker}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

