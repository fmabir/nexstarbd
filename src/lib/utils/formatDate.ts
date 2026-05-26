import { format, formatDistanceToNow } from "date-fns";
import type { Timestamp } from "firebase/firestore";

export function toDate(ts: Timestamp): Date {
  return ts.toDate();
}

export function formatTournamentDate(ts: Timestamp): string {
  return format(toDate(ts), "dd MMM yyyy, hh:mm a");
}

export function formatShortDate(ts: Timestamp): string {
  return format(toDate(ts), "dd MMM yyyy");
}

export function timeAgo(ts: Timestamp): string {
  return formatDistanceToNow(toDate(ts), { addSuffix: true });
}
