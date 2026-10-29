"use client";

import { useTranslations } from "next-intl";
import { useAnnouncements } from "@/lib/hooks/useAnnouncements";
import { useTournamentWinners } from "@/lib/hooks/useTournamentWinners";
import type { Registration, Tournament } from "@/lib/types";
import { EmptyState, PlaceBadge, Section, Skeleton, art, mCard } from "@/components/mobile/ui/primitives";
import { MegaphoneIcon } from "@/components/mobile/ui/icons";
import { AnnouncementList } from "@/components/mobile/announcements/AnnouncementItem";
import { RoomCard } from "./RoomCard";

function Results({ tournamentId }: { tournamentId: string }) {
  const { winners, loading } = useTournamentWinners(tournamentId);

  if (loading) return <Skeleton className="h-40" />;

  if (winners.length === 0) {
    return (
      <EmptyState
        art={art.trophy}
        title="Results not posted yet"
        text="Check back after the tournament — winners will appear here."
        className="bg-m-surface"
      />
    );
  }

  return (
    <ol className={`${mCard} px-4 divide-y divide-m-line`}>
      {winners.map((w) => (
        <li key={w.id} className="flex items-center gap-3 py-3.5">
          <PlaceBadge place={w.position} />
          <div className="flex-1 min-w-0">
            <p className="font-m-display font-bold text-[19px] leading-tight text-m-text truncate">{w.squadName}</p>
            <p className="text-[12px] text-m-dim truncate">{w.players.join(" · ")}</p>
          </div>
          <span className="shrink-0 font-m-display font-semibold text-[17px] text-m-gold-text">{w.prize}</span>
        </li>
      ))}
    </ol>
  );
}

/** Room details, announcements, and (for registered squads) results — the live part of a tournament page. */
export function MobileTournamentDashboard({
  tournament,
  myRegistration,
}: {
  tournament: Tournament;
  myRegistration: Registration | null;
}) {
  const t = useTranslations("dashboard");
  const { announcements, loading } = useAnnouncements(tournament.id);

  const showRoomInfo =
    tournament.status === "ongoing" &&
    tournament.roomId &&
    tournament.roomPassword &&
    myRegistration?.approvalStatus === "approved";

  return (
    <div className="mt-8">
      {showRoomInfo && (
        <div className="px-4 pb-7">
          <RoomCard roomId={tournament.roomId!} roomPassword={tournament.roomPassword!} />
        </div>
      )}

      <Section title={t("announcements")} tone="blue">
        <div className="px-4">
          {loading ? (
            <Skeleton className="h-32" />
          ) : announcements.length === 0 ? (
            <EmptyState icon={<MegaphoneIcon size={22} />} title={t("noAnnouncements")} className="bg-m-surface" />
          ) : (
            <AnnouncementList announcements={announcements} />
          )}
        </div>
      </Section>

      {/* Results are shown to registered players only, as on desktop */}
      {myRegistration && (
        <Section title="Results" tone="gold">
          <div className="px-4">
            <Results tournamentId={tournament.id} />
          </div>
        </Section>
      )}
    </div>
  );
}
