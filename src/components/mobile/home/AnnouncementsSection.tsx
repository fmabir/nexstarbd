"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useAnnouncements } from "@/lib/hooks/useAnnouncements";
import { SeeAllButton, Section, Skeleton } from "@/components/mobile/ui/primitives";
import { Sheet } from "@/components/mobile/ui/Sheet";
import { AnnouncementItem, AnnouncementList } from "@/components/mobile/announcements/AnnouncementItem";

/** Two latest site-wide announcements, with the full list in a sheet. */
export function AnnouncementsSection() {
  const t = useTranslations("announcements");
  const { announcements, loading } = useAnnouncements(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (!loading && announcements.length === 0) return null;

  const hasMore = announcements.length > 2;

  return (
    <Section
      title={t("latest")}
      tone="blue"
      action={hasMore && <SeeAllButton onClick={() => setOpen(true)} label={`All ${announcements.length}`} />}
    >
      <div className="px-4">
        {loading ? <Skeleton className="h-40" /> : <AnnouncementList announcements={announcements.slice(0, 2)} clamp />}
      </div>

      <Sheet open={open} onClose={close} title="All announcements">
        <div className="divide-y divide-m-line">
          {announcements.map((a) => (
            <AnnouncementItem key={a.id} announcement={a} />
          ))}
        </div>
      </Sheet>
    </Section>
  );
}
