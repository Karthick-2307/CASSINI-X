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
    "inline-flex items-center justify-center font-sans font-medium rounded-btn transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-sm gap-2 font-medium",
  }[size];

  const variantStyles = {
    primary:
      "bg-accent text-[#0B0F17] hover:bg-accent/90 active:bg-accent/80 border border-transparent font-semibold shadow-sm",
    secondary:
      "bg-[#162033] text-[#F8FAFC] border border-[#243044] hover:bg-[#1E293B] hover:border-accent hover:text-accent shadow-sm font-medium",
    ghost:
      "bg-transparent text-text-muted hover:text-[#F8FAFC] hover:bg-[#162033]",
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
