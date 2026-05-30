"use client";

import { useState, useEffect } from "react";
import { useAnnouncements } from "@/lib/hooks/useAnnouncements";
import { AnnouncementCard } from "./AnnouncementCard";
import { Spinner } from "@/components/ui/Spinner";

export function AnnouncementsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { announcements, loading } = useAnnouncements(null);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
              <h2 className="font-display text-2xl text-foreground">
                All Announcements
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Spinner />
              </div>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <p className="text-base">No announcements yet</p>
                <p className="text-sm">Check back later for updates</p>
              </div>
            ) : (
              <div className="space-y-3 p-6">
                {announcements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && announcements.length > 0 && (
            <div className="border-t border-border px-6 py-4 bg-muted/30 text-center text-xs text-muted-foreground">
              {announcements.length} announcement
              {announcements.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
