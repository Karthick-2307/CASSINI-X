import React from "react";
import { Button } from "./Button";

export interface ErrorMessageProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Notice",
  message,
  code,
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`rounded-card border border-status-error/40 bg-surface p-4 text-text-primary space-y-2.5 ${className}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-status-error font-medium text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-heading font-semibold">{title}</span>
        </div>
        {code && (
          <span className="font-mono text-xs text-status-error bg-raised px-2 py-0.5 rounded border border-border">
            {code}
          </span>
        )}
      </div>

      <p className="text-sm text-text-muted leading-relaxed font-sans">{message}</p>

      {onRetry && (
        <div className="pt-1">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
