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
        <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
        {provenance && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-raised text-accent border border-border">
            {provenance}
          </span>
        )}
      </div>

      <div className="mt-2">
        {hasValue ? (
          <div className="flex items-baseline space-x-1 font-mono">
            <span className="text-xl font-semibold text-text-primary">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-xs text-text-muted">{unit}</span>}
          </div>
        ) : (
          <div className="text-xs text-text-muted py-1 font-sans">
            {emptyText}
          </div>
        )}
      </div>
    </Card>
  );
};
