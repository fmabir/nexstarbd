"use client";

import { useState } from "react";
import Image from "next/image";
import { useActiveTournaments } from "@/lib/hooks/useActiveTournaments";
import { useCompletedTournaments } from "@/lib/hooks/useCompletedTournaments";
import { EmptyState, Skeleton, art } from "@/components/mobile/ui/primitives";
import { CalendarIcon, CrosshairIcon } from "@/components/mobile/ui/icons";
import { TournamentCard } from "./TournamentCard";
import { TournamentRow } from "./TournamentRow";
import { RegisteredFooter } from "./RegisteredFooter";

type Tab = "live" | "upcoming" | "completed";

const tabTint: Record<Tab, string> = {
  live: "bg-m-tint-red",
  upcoming: "bg-m-tint-green",
  completed: "bg-m-tint-slate",
};

/** Every tournament, split by status into three tabs that never overlap. */
export function MobileTournaments() {
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
    <div className="md:hidden m-app">
      <header className="px-4 pt-4 pb-3">
        <h1 className="font-m-display font-bold text-[30px] leading-[1.05] text-m-text">Tournaments</h1>
        <p className="mt-1.5 mb-4 text-[14px] leading-snug text-m-dim">Join the battle — register your squad today</p>
        <div className="relative rounded-3xl bg-white border border-m-line overflow-hidden">
          <Image
            src={art.arena}
            alt=""
            width={1536}
            height={1024}
            sizes="100vw"
            className="w-full h-auto"
          />
        </div>
      </header>

      <div
        className="sticky top-14 z-20 px-4 py-2 bg-m-bg/90 backdrop-blur-xl"
        role="tablist"
        aria-label="Tournament status"
      >
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-m-raised">
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
                <span className="inline-block w-1.5 h-1.5 mr-1.5 mb-0.5 rounded-full bg-m-red animate-pulse" />
              )}
              {t.label}
              <span className="ml-1 tabular-nums text-m-faint">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* The list takes the colour of its tab: live red, upcoming green, completed slate */}
      <div className={`${tabTint[tab]} px-4 pt-4 pb-8 min-h-[50vh] space-y-3`} role="tabpanel">
        {loading ? (
          <>
            <Skeleton className="h-[108px]" />
            <Skeleton className="h-[108px]" />
          </>
        ) : tab === "live" ? (
          live.length === 0 ? (
            <EmptyState
              icon={<CrosshairIcon size={22} />}
              title="Nothing live right now"
              text="Live tournaments show up here the moment they start."
              className="bg-m-surface"
            />
          ) : (
            live.map((t) => <TournamentCard key={t.id} tournament={t} />)
          )
        ) : tab === "upcoming" ? (
          upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon size={22} />}
              title="No upcoming tournaments"
              text="No upcoming tournaments right now. Stay tuned!"
              className="bg-m-surface"
            />
          ) : (
            upcoming.map((t) => (
              <TournamentRow key={t.id} tournament={t} footer={<RegisteredFooter tournamentId={t.id} />} />
            ))
          )
        ) : completed.length === 0 ? (
          <EmptyState art={art.trophy} title="No completed tournaments yet" className="bg-m-surface" />
        ) : (
          completed.map((t) => <TournamentRow key={t.id} tournament={t} />)
        )}
      </div>
    </div>
  );
}
