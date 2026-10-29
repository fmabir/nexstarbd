import type { Announcement, AnnouncementType } from "@/lib/types";
import { timeAgo } from "@/lib/utils/formatDate";
import { Chip, mCard, type ChipTone } from "@/components/mobile/ui/primitives";
import { PinIcon } from "@/components/mobile/ui/icons";

const typeLook: Record<AnnouncementType, { label: string; tone: ChipTone }> = {
  info: { label: "Info", tone: "neutral" },
  warning: { label: "Warning", tone: "amber" },
  roomInfo: { label: "Room info", tone: "red" },
  result: { label: "Result", tone: "green" },
};

/** One announcement as a list row. `clamp` trims long bodies in previews. */
export function AnnouncementItem({ announcement: a, clamp = false }: { announcement: Announcement; clamp?: boolean }) {
  const look = typeLook[a.type] ?? typeLook.info;

  return (
    <article className="py-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Chip tone={look.tone} dot>
          {look.label}
        </Chip>
        {a.isPinned && (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-m-dim">
            <PinIcon size={14} />
            Pinned
          </span>
        )}
        <span className="ml-auto text-[12px] text-m-faint whitespace-nowrap">{timeAgo(a.createdAt)}</span>
      </div>
      {a.title && <h3 className="text-[15px] font-semibold leading-snug text-m-text">{a.title}</h3>}
      <p className={`mt-0.5 text-[14px] leading-relaxed text-m-dim whitespace-pre-line ${clamp ? "line-clamp-3" : ""}`}>
        {a.body}
      </p>
    </article>
  );
}

/** Announcements stacked in one card with hairline separators. */
export function AnnouncementList({ announcements, clamp = false }: { announcements: Announcement[]; clamp?: boolean }) {
  return (
    <div className={`${mCard} px-4 divide-y divide-m-line`}>
      {announcements.map((a) => (
        <AnnouncementItem key={a.id} announcement={a} clamp={clamp} />
      ))}
    </div>
  );
}
