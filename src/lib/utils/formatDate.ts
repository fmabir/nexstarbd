import { formatDistanceToNow } from "date-fns";

const TIMEZONE = "Asia/Dhaka";

type TimestampLike =
  | { toDate(): Date }
  | { seconds: number; nanoseconds?: number }
  | { _seconds: number; _nanoseconds?: number };

export function toDate(ts: TimestampLike): Date {
  if ("toDate" in ts && typeof (ts as { toDate?: unknown }).toDate === "function") {
    return (ts as { toDate(): Date }).toDate();
  }
  if ("seconds" in ts) return new Date((ts as { seconds: number }).seconds * 1000);
  if ("_seconds" in ts) return new Date((ts as { _seconds: number })._seconds * 1000);
  return new Date();
}

function bdDate(date: Date, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TIMEZONE, ...opts }).format(date);
}

function bdTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatTournamentDate(ts: TimestampLike): string {
  const d = toDate(ts);
  return `${bdDate(d, { day: "2-digit", month: "short", year: "numeric" })}, ${bdTime(d)}`;
}

export function formatDateOnly(ts: TimestampLike): string {
  return bdDate(toDate(ts), { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTimeOnly(ts: TimestampLike): string {
  return bdTime(toDate(ts));
}

export function formatShortDate(ts: TimestampLike): string {
  return bdDate(toDate(ts), { day: "2-digit", month: "short", year: "numeric" });
}

export function timeAgo(ts: TimestampLike): string {
  return formatDistanceToNow(toDate(ts), { addSuffix: true });
}
