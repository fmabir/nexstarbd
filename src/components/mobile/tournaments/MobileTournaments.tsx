"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState } from "react";
import { useActiveTournaments } from "@/lib/hooks/useActiveTournaments";
import { useCompletedTournaments } from "@/lib/hooks/useCompletedTournaments";
import { EmptyState, Skeleton } from "@/components/mobile/ui/primitives";
import { CalendarIcon, CrosshairIcon } from "@/components/mobile/ui/icons";
import { TournamentCard } from "./TournamentCard";
import { TournamentRow } from "./TournamentRow";
import { RegisteredFooter } from "./RegisteredFooter";

type Tab = "live" | "upcoming" | "completed";

/** Every tournament, split by status into three tabs that never overlap. */
export function MobileTournaments() {
  const ui = useUiText();

  const { active, rest: upcoming, loading: activeLoading } = useActiveTournaments();
  const { tournaments: completed, loading: completedLoading } = useCompletedTournaments();
  const live = active.filter((t) => t.status === "ongoing");

  // Until the player picks a tab, open on whatever is happening now
  const [picked, setPicked] = useState<Tab | null>(null);
  const tab: Tab = picked ?? (live.length > 0 ? "live" : "upcoming");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "live", label: "Live", count: live.length },
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "completed", label: "Completed", count: completed.length },
  ];

  const loading = tab === "completed" ? completedLoading : activeLoading;

  return (
    <div className="player-container">
      <header className="pb-2">
        <h1 className="font-m-display font-bold text-[24px] md:text-[28px] leading-tight text-m-text">{ui("Tournaments")}</h1>
        <p className="mt-1 mb-2 text-[14px] leading-snug text-m-dim">{ui("Find your next match and register your squad.")}</p>
      </header>

      <div
        className="sticky top-16 z-20 py-2 bg-background"
        role="tablist"
        aria-label={ui("Tournament status")}
      >
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-m-line/50 max-w-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setPicked(t.key)}
              className={`h-9 rounded-lg text-[14px] font-semibold transition-colors ${
                tab === t.key ? "bg-m-surface text-m-text shadow-[0_1px_3px_rgba(16,24,40,0.12)]" : "text-m-dim"
              }`}
            >
              {t.key === "live" && t.count > 0 && (
                <span className="inline-block w-1.5 h-1.5 mr-1.5 mb-0.5 rounded-full bg-m-green animate-pulse" />
              )}
              {ui(t.label)}
              <span className="ml-1 tabular-nums text-m-faint">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* One neutral list surface for every tournament state. */}
      <div className="pt-4 pb-8 min-h-[25vh] grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-start" role="tabpanel">
        {ui(loading ? (
          <>
            <Skeleton className="h-[108px]" />
            <Skeleton className="h-[108px]" />
          </>
        ) : tab === "live" ? (
          live.length === 0 ? (
            <EmptyState
              icon={<CrosshairIcon size={22} />}
              title={ui("Nothing live right now")}
              text={ui("Live tournaments show up here the moment they start.")}
              className="bg-m-surface"
            />
          ) : (
            live.map((t) => <TournamentCard key={t.id} tournament={t} />)
          )
        ) : tab === "upcoming" ? (
          upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon size={22} />}
              title={ui("No upcoming tournaments")}
              text={ui("No upcoming tournaments right now. Stay tuned!")}
              className="bg-m-surface"
            />
          ) : (
            upcoming.map((t) => (
              <TournamentRow key={t.id} tournament={t} footer={<RegisteredFooter tournamentId={t.id} />} />
            ))
          )
        ) : completed.length === 0 ? (
          <EmptyState icon={<CalendarIcon size={22} />} title={ui("No completed tournaments yet")} className="bg-m-surface" />
        ) : (
          completed.map((t) => <TournamentRow key={t.id} tournament={t} />)
        ))}
      </div>
    </div>
  );
}
