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
    default: "bg-panel border-border",
    raised: "bg-raised border-border",
    interactive:
      "bg-panel border-border hover:border-accent-cyan/50 hover:bg-raised transition-all cursor-pointer",
  }[variant];

  return (
    <div
      className={`rounded-panel border p-5 transition-colors ${variantStyles} ${className}`}
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
      className={`rounded-panel border border-border/80 bg-panel/75 backdrop-blur-md shadow-2xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

