import React from "react";

export interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-3 ${className}`}>
      <div
        className={`${sizeClasses} border-border border-t-accent-cyan rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {label && <p className="text-xs font-mono text-text-muted">{label}</p>}
    </div>
  );
};
