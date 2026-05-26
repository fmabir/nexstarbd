import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "primary" | "secondary" | "none";
}

export function Card({ children, className = "", accent = "none" }: CardProps) {
  const accentStyles = {
    primary: "border-l-4 border-l-primary",
    secondary: "border-l-4 border-l-secondary",
    none: "",
  };

  return (
    <div
      className={`bg-card rounded-2xl shadow-sm border border-border p-5 ${accentStyles[accent]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-display text-xl text-foreground tracking-wide ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
