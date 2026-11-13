import React from "react";
import { Card } from "./Card";

export interface EmptyStateProps {
  title: string;
  description: string;
  reason?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  reason,
  action,
  className = "",
}) => {
  return (
    <Card className={`text-center py-10 px-6 flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-raised border border-border flex items-center justify-center text-text-muted mb-1">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-base font-heading font-semibold text-text-primary">
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-md leading-relaxed">
        {description}
      </p>
      {reason && (
        <span className="text-xs font-mono text-accent-cyan/90 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
          Reason: {reason}
        </span>
      )}
      {action && <div className="pt-2">{action}</div>}
    </Card>
  );
};

