import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "interactive";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const variantStyles = {
    default: "bg-[#111826] border-[#243044] text-[#F8FAFC]",
    raised: "bg-[#162033] border-[#243044] text-[#F8FAFC]",
    interactive:
      "bg-[#111826] border-[#243044] hover:border-accent/60 transition-colors cursor-pointer text-[#F8FAFC]",
  }[variant];

  return (
    <div
      className={`rounded-card border p-5 shadow-sm ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassPanel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`rounded-card border border-[#243044] bg-[#111826] p-6 text-[#F8FAFC] shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
