"use client";

import { useAnnouncements } from "@/lib/hooks/useAnnouncements";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { RoomInfoCard } from "./RoomInfoCard";
import { SquadList } from "./SquadList";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslations } from "next-intl";
import type { Tournament, Registration } from "@/lib/types";

interface TournamentDashboardProps {
  tournament: Tournament;
  myRegistration: Registration | null;
}

export function TournamentDashboard({ tournament, myRegistration }: TournamentDashboardProps) {
  const t = useTranslations("dashboard");
  const { announcements, loading } = useAnnouncements(tournament.id);

  const showRoomInfo =
    tournament.status === "ongoing" &&
    tournament.roomId &&
    tournament.roomPassword &&
    myRegistration?.approvalStatus === "approved";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
      {/* Left: Room info + Announcements */}
      <div className="lg:col-span-3 space-y-6">
        {showRoomInfo && (
          <RoomInfoCard
            roomId={tournament.roomId!}
            roomPassword={tournament.roomPassword!}
          />
        )}

        <div>
          <h2 className="font-display text-2xl text-foreground tracking-wide mb-4">
            {t("announcements")}
          </h2>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-xl">
              <p className="text-2xl mb-2">📢</p>
              <p className="text-muted-foreground text-sm">{t("noAnnouncements")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Registered squads (names + slots only, no personal info) */}
      <div className="lg:col-span-2">
        <h2 className="font-display text-2xl text-foreground tracking-wide mb-4">
          {t("squads")}
        </h2>
        <SquadList tournamentId={tournament.id} maxSlots={tournament.maxSlots} />
      </div>
    </div>
  );
}
