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
    "inline-flex items-center justify-center font-medium rounded-btn transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-2.5 text-base gap-2.5 font-semibold",
  }[size];

  const variantStyles = {
    primary:
      "bg-white text-slate-950 font-bold hover:bg-slate-200 active:bg-slate-300 shadow-glow border border-white tracking-wide uppercase text-xs",
    secondary:
      "bg-white/[0.04] text-slate-100 border border-white/20 hover:bg-white/10 hover:border-white/40 backdrop-blur-md shadow-sm tracking-wide uppercase text-xs",
    ghost:
      "bg-transparent text-slate-300 hover:text-white hover:bg-white/10 tracking-wide text-xs",
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
