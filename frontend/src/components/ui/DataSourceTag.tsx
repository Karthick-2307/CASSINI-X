import React from "react";
import { Badge } from "./Badge";

export interface DataSourceTagProps {
  name: string;
  source: string;
  resolution?: string;
  status?: "planned" | "active" | "unavailable";
  className?: string;
}

export const DataSourceTag: React.FC<DataSourceTagProps> = ({
  name,
  source,
  resolution,
  status = "planned",
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-btn bg-panel border border-border text-xs ${className}`}
    >
      <span className="font-heading font-semibold text-text-primary">{name}</span>
      <span className="text-text-muted">•</span>
      <span className="font-mono text-text-muted">{source}</span>
      {resolution && (
        <>
          <span className="text-text-muted">•</span>
          <span className="font-mono text-accent-cyan/80">{resolution}</span>
        </>
      )}
      <Badge variant={status === "active" ? "active" : status === "unavailable" ? "unavailable" : "planned"}>
        {status}
      </Badge>
    </div>
  );
};
