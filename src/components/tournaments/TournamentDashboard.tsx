"use client";

import { useAnnouncements } from "@/lib/hooks/useAnnouncements";
import { useTournamentWinners } from "@/lib/hooks/useTournamentWinners";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { RoomInfoCard } from "./RoomInfoCard";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslations } from "next-intl";
import type { Tournament, Registration, Winner } from "@/lib/types";

const positionConfig: Record<number, { label: string; icon: string; bar: string; bg: string; text: string }> = {
  1: { label: "Champion",   icon: "🥇", bar: "bg-yellow-400", bg: "bg-yellow-50 border-yellow-200",  text: "text-yellow-800" },
  2: { label: "Runner-Up",  icon: "🥈", bar: "bg-gray-400",   bg: "bg-gray-50 border-gray-200",      text: "text-gray-700"   },
  3: { label: "3rd Place",  icon: "🥉", bar: "bg-amber-600",  bg: "bg-amber-50 border-amber-200",    text: "text-amber-800"  },
};

function WinnerCard({ winner }: { winner: Winner }) {
  const cfg = positionConfig[winner.position] ?? positionConfig[3];
  return (
    <div className={`rounded-2xl border-2 ${cfg.bg} overflow-hidden`}>
      <div className={`h-1.5 ${cfg.bar}`} />
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{cfg.icon}</span>
          <span className={`font-bold text-xs uppercase tracking-widest ${cfg.text}`}>{cfg.label}</span>
        </div>
        <p className="font-display text-xl sm:text-2xl text-foreground tracking-wide leading-tight mb-2">{winner.squadName}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {winner.players.map((p) => (
            <span key={p} className="text-xs font-medium bg-white/80 border border-black/10 px-2 py-0.5 rounded-full">
              {p}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-black/10">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Prize</span>
          <span className="font-display text-lg text-secondary tracking-wide">{winner.prize}</span>
        </div>
      </div>
    </div>
  );
}

function ResultsSection({ tournamentId }: { tournamentId: string }) {
  const { winners, loading } = useTournamentWinners(tournamentId);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="text-center py-8 bg-muted rounded-2xl">
        <p className="text-3xl mb-2">🏆</p>
        <p className="text-sm font-semibold text-foreground">Results not posted yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Check back after the tournament — winners will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {winners.map((w) => (
        <WinnerCard key={w.id} winner={w} />
      ))}
    </div>
  );
}

interface TournamentDashboardProps {
  tournament: Tournament;
  myRegistration: Registration | null;
}

export function TournamentDashboard({ tournament, myRegistration }: TournamentDashboardProps) {
  const t = useTranslations("dashboard");
  const { announcements, loading } = useAnnouncements(tournament.id);

  const isRegistered = myRegistration !== null;

  const showRoomInfo =
    tournament.status === "ongoing" &&
    tournament.roomId &&
    tournament.roomPassword &&
    myRegistration?.approvalStatus === "approved";

  return (
    <div className={`grid grid-cols-1 ${isRegistered ? "lg:grid-cols-5" : ""} gap-4 sm:gap-6 lg:gap-8`}>
      {/* Left: Room info + Announcements */}
      <div className={`${isRegistered ? "lg:col-span-3" : ""} space-y-6`}>
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

      {/* Right: Results — visible only to registered players */}
      {isRegistered && (
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full" />
            <h2 className="font-display text-2xl text-foreground tracking-wide">Results</h2>
          </div>
          <ResultsSection tournamentId={tournament.id} />
        </div>
      )}
    </div>
  );
}
