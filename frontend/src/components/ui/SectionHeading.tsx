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
    <div className={`flex flex-col space-y-1.5 ${alignment} ${className}`}>
      {kicker && (
        <span className="text-[12px] font-sans font-medium uppercase tracking-wider text-[#94A3B8]">
          {kicker}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-[#F8FAFC] tracking-normal">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
