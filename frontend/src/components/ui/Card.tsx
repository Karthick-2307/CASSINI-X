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
    default: "bg-surface border-border text-text-primary",
    raised: "bg-raised border-border text-text-primary",
    interactive:
      "bg-surface border-border hover:border-accent/60 transition-colors cursor-pointer text-text-primary",
  }[variant];

  return (
    <div
      className={`rounded-card border p-5 ${variantStyles} ${className}`}
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
      className={`rounded-card border border-border bg-surface p-6 text-text-primary ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
