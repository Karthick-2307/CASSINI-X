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
    default: "bg-slate-900/80 backdrop-blur-md border-white/10 shadow-lg text-slate-100",
    raised: "bg-slate-800/80 backdrop-blur-md border-white/10 shadow-lg text-slate-100",
    interactive:
      "bg-slate-900/80 backdrop-blur-md border-white/10 hover:border-sky-400 hover:shadow-glow transition-all cursor-pointer text-slate-100",
  }[variant];

  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${variantStyles} ${className}`}
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
      className={`rounded-xl border border-white/10 bg-slate-900/75 backdrop-blur-xl shadow-2xl p-6 text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
