import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-btn transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-2.5 text-base gap-2.5 font-semibold",
  }[size];

  const variantStyles = {
    primary:
      "bg-accent-cyan text-base font-semibold hover:bg-cyan-300 active:bg-cyan-400 shadow-glow",
    secondary:
      "bg-raised text-text-primary border border-border hover:bg-raised/80 hover:border-text-muted/40 active:bg-panel",
    ghost:
      "bg-transparent text-text-muted hover:text-text-primary hover:bg-panel active:bg-raised",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
