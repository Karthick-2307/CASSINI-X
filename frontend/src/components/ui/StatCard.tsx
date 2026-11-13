import React from "react";
import { Card } from "./Card";

export interface StatCardProps {
  label: string;
  value?: number | string | null;
  unit?: string;
  emptyText?: string;
  className?: string;
  provenance?: "measured" | "derived" | "inferred";
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  emptyText = "No data computed yet",
  className = "",
  provenance,
}) => {
  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <Card className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase font-mono tracking-wider text-text-muted">
          {label}
        </span>
        {provenance && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-raised text-accent-cyan border border-border">
            {provenance}
          </span>
        )}
      </div>

      <div className="mt-3">
        {hasValue ? (
          <div className="flex items-baseline space-x-1.5 font-mono">
            <span className="text-2xl font-bold text-text-primary tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-xs text-text-muted">{unit}</span>}
          </div>
        ) : (
          <div className="text-xs text-text-muted italic py-1">
            {emptyText}
          </div>
        )}
      </div>
    </Card>
  );
};
