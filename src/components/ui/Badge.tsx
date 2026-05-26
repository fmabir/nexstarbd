import React from "react";

type BadgeVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-secondary-light text-secondary-dark",
  success: "bg-secondary-light text-secondary-dark",
  danger: "bg-primary-light text-primary",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
  neutral: "bg-muted text-muted-foreground",
};

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
