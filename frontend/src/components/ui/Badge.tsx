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
    // Scientific categorization (Section 0.7 & Section 5)
    measured: "bg-surface text-accent border-[#1E293B]",
    derived: "bg-raised text-accent border-accent/30",
    inferred: "bg-surface text-text-muted border-border",
    demo: "bg-amber-950/30 text-status-warn border-status-warn/40 font-semibold",
    unavailable: "bg-red-950/30 text-status-error border-status-error/40",

    // Lifecycle
    planned: "bg-surface text-text-muted border-border",
    active: "bg-emerald-950/30 text-status-ok border-status-ok/40",

    // Status
    ok: "bg-emerald-950/30 text-status-ok border-status-ok/40",
    warn: "bg-amber-950/30 text-status-warn border-status-warn/40",
    bad: "bg-red-950/30 text-status-error border-status-error/40",
    neutral: "bg-surface text-text-muted border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border select-none ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
