import type { Announcement, AnnouncementType } from "@/lib/types";
import { timeAgo } from "@/lib/utils/formatDate";

const typeConfig: Record<
  AnnouncementType,
  { border: string; bg: string; badge: string; label: string }
> = {
  info: {
    border: "border-l-secondary",
    bg: "bg-secondary-light",
    badge: "bg-secondary text-white",
    label: "Info",
  },
  warning: {
    border: "border-l-amber-400",
    bg: "bg-amber-50",
    badge: "bg-amber-500 text-white",
    label: "Warning",
  },
  roomInfo: {
    border: "border-l-primary",
    bg: "bg-primary-light",
    badge: "bg-primary text-white",
    label: "Room Info",
  },
  result: {
    border: "border-l-secondary",
    bg: "bg-secondary-light",
    badge: "bg-secondary text-white",
    label: "Result",
  },
};

export function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement;
}) {
  const config = typeConfig[announcement.type];

  return (
    <div
      className={`border-l-4 ${config.border} ${config.bg} rounded-r-xl px-4 py-3`}
    >
      <div className="flex items-start gap-2 flex-wrap mb-1">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
          {config.label}
        </span>
        {announcement.isPinned && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-800 text-white">
            📌 Pinned
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {timeAgo(announcement.createdAt)}
        </span>
      </div>
      {announcement.title && (
        <h4 className="font-semibold text-foreground text-sm mb-1">
          {announcement.title}
        </h4>
      )}
      <p className="text-sm text-foreground/80 whitespace-pre-line">
        {announcement.body}
      </p>
    </div>
  );
}
