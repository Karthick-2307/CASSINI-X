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
    // Scientific honesty rules (Part 0 Section 0.7)
    measured: "bg-blue-950/70 text-accent-blue border-blue-800/80",
    derived: "bg-cyan-950/70 text-accent-cyan border-cyan-800/80",
    inferred: "bg-purple-950/70 text-accent-violet border-purple-800/80",
    demo: "bg-amber-950/80 text-status-warn border-amber-700/90 font-bold",
    unavailable: "bg-rose-950/70 text-status-bad border-rose-800/80",

    // Integration & Lifecycle states
    planned: "bg-raised text-text-muted border-border",
    active: "bg-emerald-950/70 text-status-ok border-emerald-800/80",

    // Metric & Status states
    ok: "bg-emerald-950/70 text-status-ok border-emerald-800/80",
    warn: "bg-amber-950/70 text-status-warn border-amber-800/80",
    bad: "bg-rose-950/70 text-status-bad border-rose-800/80",
    neutral: "bg-raised text-text-muted border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border uppercase tracking-wider select-none ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

