"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { ClockIcon } from "./icons";

const pad = (n: number) => String(n).padStart(2, "0");
const noSubscribe = () => () => {};

/**
 * Takes epoch millis rather than a Date so the target is stable across
 * renders — useCountdown restarts its interval whenever the Date changes.
 */
export function Countdown({
  targetMs,
  label,
  expiredLabel,
  variant = "inline",
}: {
  targetMs: number;
  label: string;
  expiredLabel: string;
  variant?: "inline" | "boxes";
}) {
  const target = useMemo(() => new Date(targetMs), [targetMs]);
  const c = useCountdown(target);
  // The clock differs between server and phone; render it only on the client
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);

  if (!mounted) {
    return <div className={`rounded-xl bg-m-raised animate-pulse ${variant === "boxes" ? "h-[86px]" : "h-10"}`} />;
  }

  if (c.isExpired) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-m-raised text-[13px] font-medium text-m-dim">
        <ClockIcon size={16} />
        {expiredLabel}
      </div>
    );
  }

  if (variant === "inline") {
    const clock = `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`;
    return (
      <div className="flex items-center justify-between gap-3 h-10 px-3 rounded-xl bg-m-raised">
        <span className="flex items-center gap-2 text-[13px] text-m-dim">
          <ClockIcon size={16} />
          {label}
        </span>
        <span className="font-m-display font-semibold text-[17px] tabular-nums text-m-text">
          {c.days > 0 && <span>{c.days}d </span>}
          {clock}
        </span>
      </div>
    );
  }

  const parts = [
    ...(c.days > 0 ? [{ v: c.days, l: "Days" }] : []),
    { v: c.hours, l: "Hours" },
    { v: c.minutes, l: "Min" },
    { v: c.seconds, l: "Sec" },
  ];

  return (
    <div>
      <p className="text-[13px] text-m-dim mb-2">{label}</p>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${parts.length}, minmax(0, 1fr))` }}>
        {parts.map((p) => (
          <div key={p.l} className="rounded-xl bg-m-raised border border-m-line py-2.5 text-center">
            <span className="block font-m-display font-bold text-[28px] leading-none tabular-nums text-m-text">
              {pad(p.v)}
            </span>
            <span className="block mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-m-faint">{p.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
