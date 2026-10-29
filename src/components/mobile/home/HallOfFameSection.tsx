"use client";

import { useState } from "react";
import Image from "next/image";
import type { MvpPlayer, Winner } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/formatDate";
import { Caption, PlaceBadge, SeeAllLink, Section, mCard } from "@/components/mobile/ui/primitives";

const placeName = { 1: "Champion", 2: "Runner-up", 3: "3rd place" } as const;
const placeText = { 1: "text-m-gold-text", 2: "text-m-silver-text", 3: "text-m-bronze-text" } as const;

function ChampionCard({ winner: w }: { winner: Winner }) {
  return (
    <article className={`snap-start shrink-0 w-[264px] ${mCard} overflow-hidden`}>
      {w.photoUrl && (
        <div className="relative h-32 bg-m-raised">
          <Image src={w.photoUrl} alt={w.squadName} fill sizes="264px" className="object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <PlaceBadge place={w.position} size={22} />
          <span className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${placeText[w.position]}`}>
            {placeName[w.position]}
          </span>
        </div>
        <h3 className="mt-2 font-m-display font-bold text-[22px] leading-tight text-m-text truncate">{w.squadName}</h3>
        <p className="text-[12px] text-m-faint truncate">
          {w.tournamentName} · {formatShortDate(w.tournamentDate)}
        </p>
        <p className="mt-2 text-[13px] text-m-dim line-clamp-2 min-h-[2.8em]">{w.players.join(" · ")}</p>
        <div className="mt-3 pt-3 border-t border-m-line flex items-center justify-between">
          <Caption>Prize</Caption>
          <span className="font-m-display font-semibold text-[18px] text-m-gold-text">{w.prize}</span>
        </div>
      </div>
    </article>
  );
}

function MvpCard({ mvp }: { mvp: MvpPlayer }) {
  return (
    <article className={`snap-start shrink-0 w-[228px] ${mCard} p-4`}>
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 shrink-0">
          {mvp.photoUrl ? (
            <Image src={mvp.photoUrl} alt={mvp.playerName} fill sizes="48px" className="object-cover rounded-full" />
          ) : (
            <span className="w-12 h-12 rounded-full bg-m-raised border border-m-line flex items-center justify-center font-m-display font-bold text-[20px] text-m-text">
              {mvp.playerName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="absolute -bottom-1 -right-1.5 px-1.5 rounded-md bg-m-red text-white text-[10px] font-bold leading-[16px]">
            MVP
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-m-text truncate">{mvp.playerName}</h3>
          <p className="text-[12px] text-m-faint truncate">{mvp.achievement}</p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 rounded-xl border border-m-line divide-x divide-m-line">
        <div className="px-3 py-2">
          <dt><Caption>Kills</Caption></dt>
          <dd className="font-m-display font-bold text-[24px] leading-tight tabular-nums text-m-red-text">{mvp.kills}</dd>
        </div>
        <div className="px-3 py-2">
          <dt><Caption>Damage</Caption></dt>
          <dd className="font-m-display font-bold text-[24px] leading-tight tabular-nums text-m-text">
            {mvp.damage ? mvp.damage.toLocaleString() : "—"}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[12px] text-m-faint truncate">
        {mvp.tournamentName} · {formatShortDate(mvp.tournamentDate)}
      </p>
    </article>
  );
}

type Tab = "champions" | "mvp";

export function HallOfFameSection({ winners, mvpPlayers }: { winners: Winner[]; mvpPlayers: MvpPlayer[] }) {
  const [tab, setTab] = useState<Tab>(winners.length > 0 ? "champions" : "mvp");

  if (winners.length === 0 && mvpPlayers.length === 0) return null;

  // Keep the newest-first tournament order, but champion before runner-up within each
  const firstSeen = new Map<string, number>();
  winners.forEach((w, i) => firstSeen.has(w.tournamentId) || firstSeen.set(w.tournamentId, i));
  const podiumOrder = [...winners].sort(
    (a, b) => firstSeen.get(a.tournamentId)! - firstSeen.get(b.tournamentId)! || a.position - b.position
  );

  const tabs = (
    [
      { key: "champions", label: "Champions", count: winners.length },
      { key: "mvp", label: "MVP players", count: mvpPlayers.length },
    ] as const
  ).filter((t) => t.count > 0);

  return (
    <Section title="Hall of Fame" tone="gold" action={<SeeAllLink href="/hall-of-fame" />}>
      {tabs.length > 1 && (
        <div
          className="mx-4 mb-3 grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/5"
          role="tablist"
          aria-label="Hall of Fame"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`h-9 rounded-lg text-[14px] font-semibold transition-colors ${
                tab === t.key ? "bg-m-surface text-m-text shadow-[0_1px_3px_rgba(16,24,40,0.12)]" : "text-m-dim"
              }`}
            >
              {t.label}
              <span className="ml-1.5 tabular-nums text-m-faint">{t.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 scroll-px-4" role="tabpanel">
        {tab === "champions" && podiumOrder.map((w) => <ChampionCard key={w.id} winner={w} />)}
        {tab === "mvp" && mvpPlayers.map((m) => <MvpCard key={m.id} mvp={m} />)}
      </div>
    </Section>
  );
}
