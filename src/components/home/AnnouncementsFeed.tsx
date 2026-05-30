"use client";

import { useState } from "react";
import { useAnnouncements } from "@/lib/hooks/useAnnouncements";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { AnnouncementsModal } from "@/components/announcements/AnnouncementsModal";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslations } from "next-intl";

export function AnnouncementsFeed() {
  const t = useTranslations("announcements");
  const { announcements, loading } = useAnnouncements(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!loading && announcements.length === 0) return null;

  const topAnnouncements = announcements.slice(0, 2);
  const hasMore = announcements.length > 2;

  return (
    <>
      <section className="py-12 bg-gray-50 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse" />
              <h2 className="font-display text-3xl text-foreground tracking-wide">
                {t("latest")}
              </h2>
            </div>
            {hasMore && (
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-semibold text-primary hover:underline transition-colors"
              >
                View All
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-3">
              {topAnnouncements.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))}

              {hasMore && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full mt-4 py-3 px-4 border border-border rounded-xl text-center font-semibold text-primary hover:bg-muted transition-colors"
                >
                  View All {announcements.length} Announcements →
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <AnnouncementsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
