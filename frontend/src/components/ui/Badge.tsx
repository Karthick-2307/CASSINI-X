import React from "react";

export type BadgeVariant =
  | "measured"
  | "derived"
  | "inferred"
  | "demo"
  | "unavailable"
  | "planned"
  | "active"
  | "ok"
  | "warn"
  | "bad"
  | "neutral";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  className = "",
}) => {
  const styles: Record<BadgeVariant, string> = {
    // Scientific honesty rules (Part 0 Section 0.7) - Dark Space Contrast
    measured: "bg-blue-950/70 text-blue-300 border-blue-500/40",
    derived: "bg-sky-950/70 text-sky-300 border-sky-500/40",
    inferred: "bg-purple-950/70 text-purple-300 border-purple-500/40",
    demo: "bg-amber-950/80 text-amber-300 border-amber-500/50 font-bold",
    unavailable: "bg-rose-950/70 text-rose-300 border-rose-500/40",

    // Integration & Lifecycle states
    planned: "bg-slate-800/80 text-slate-300 border-slate-600/40",
    active: "bg-emerald-950/70 text-emerald-300 border-emerald-500/40",

    // Metric & Status states
    ok: "bg-emerald-950/70 text-emerald-300 border-emerald-500/40",
    warn: "bg-amber-950/80 text-amber-300 border-amber-500/50",
    bad: "bg-rose-950/70 text-rose-300 border-rose-500/40",
    neutral: "bg-slate-800/80 text-slate-300 border-slate-700/50",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border uppercase tracking-wider select-none ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

