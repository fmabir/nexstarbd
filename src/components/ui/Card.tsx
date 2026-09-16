import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "primary" | "secondary" | "none";
  /** Render children directly on the pink frame instead of the white panel. */
  bare?: boolean;
}

/**
 * A pink brand frame wrapping a white content panel.
 *
 * The frame carries the colour; the panel carries the text. Content in this
 * app is dense (prize, mode, date, slot counts, countdowns), and a white
 * ground keeps it readable instead of stacking dark text on saturated pink.
 */
export function Card({ children, className = "", accent = "none", bare = false }: CardProps) {
  const accentStyles = {
    primary: "border-l-4 border-l-primary",
    secondary: "border-l-4 border-l-secondary",
    none: "",
  };

  return (
    <div
      className={`bg-card rounded-2xl shadow-sm p-1.5 ${accentStyles[accent]} ${className}`}
    >
      {bare ? children : <div className="bg-panel rounded-xl p-5">{children}</div>}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-display text-xl text-foreground ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
