"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { MvpPlayer, Tournament } from "@/lib/types";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { resolveBannerUrl } from "@/lib/utils/bannerUrl";

/* ── Slide types ─────────────────────────────────────────────── */
type Slide =
  | { type: "ad" }
  | { type: "leaderboard"; player: MvpPlayer }
  | { type: "upcoming"; tournament: Tournament };

/* ── Ad slide ────────────────────────────────────────────────── */
function AdSlide() {
  return (
    <div
      className="relative h-52 sm:h-72 flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #006A4E 0%, #0f172a 55%, #F42A41 100%)" }}
    >
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      <div className="relative text-center px-6">
        <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2">🇧🇩 NextStarBD</p>
        <h2 className="font-brand font-bold text-2xl sm:text-5xl text-white leading-tight mb-1">
          Finding the Next <span className="text-yellow-400">Star</span>
        </h2>
        <p className="text-white/70 text-sm sm:text-lg mb-5">of Bangladesh in Free Fire</p>
        <Link
          href="/#upcoming-tournaments"
          className="inline-flex items-center gap-2 bg-white text-primary font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg"
        >
          Join a Tournament →
        </Link>
      </div>
    </div>
  );
}

/* ── Leaderboard slide ───────────────────────────────────────── */
function LeaderboardSlide({ player }: { player: MvpPlayer }) {
  return (
    <div
      className="relative h-52 sm:h-72 flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
    >
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, white, white 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, white, white 1px, transparent 1px, transparent 48px)" }}
      />

      <div className="relative w-full px-5 sm:px-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest">Top Kills</span>
          <span className="text-white/30 text-[10px] mx-1">·</span>
          <span className="text-white/50 text-[10px] sm:text-xs truncate">{player.tournamentName}</span>
        </div>

        {/* Player row */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/20 border-2 border-primary/60 flex items-center justify-center text-2xl sm:text-4xl">
            💀
          </div>

          {/* Info */}
          <div className="min-w-0">
            <p className="text-white font-bold text-lg sm:text-3xl leading-tight truncate">{player.playerName}</p>
            <p className="text-white/40 text-[10px] sm:text-xs font-mono mt-0.5">UID: {player.uid}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-primary font-black text-4xl sm:text-5xl leading-none">{player.kills}</span>
              <span className="text-white/50 text-xs sm:text-sm font-semibold uppercase tracking-wide">kills</span>
              {player.damage && (
                <span className="text-white/30 text-xs hidden sm:inline">{player.damage.toLocaleString()} dmg</span>
              )}
            </div>
          </div>

          {/* Achievement badge */}
          {player.achievement && (
            <div className="hidden sm:block ml-auto shrink-0 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2 text-center">
              <p className="text-yellow-400 text-xs font-bold">{player.achievement}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Upcoming tournament slide ───────────────────────────────── */
function UpcomingSlide({ tournament }: { tournament: Tournament }) {
  return (
    <div className="relative h-52 sm:h-72 overflow-hidden" style={{ backgroundColor: "#1f2937" }}>
      {/* Banner image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveBannerUrl(tournament.bannerUrl, tournament.id)}
        alt={tournament.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)" }}
      />

      {/* Content pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <span className="inline-block bg-secondary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2">
          🎮 Upcoming
        </span>
        <h3 className="font-display text-white text-xl sm:text-3xl leading-tight mb-2 line-clamp-1">
          {tournament.name}
        </h3>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-primary font-bold text-sm sm:text-base">{tournament.prizePool}</span>
            <span className="text-white/40 text-xs hidden sm:inline">·</span>
            <span className="text-white/60 text-xs sm:text-sm">{formatTimeOnly(tournament.startsAt)} · {formatDateOnly(tournament.startsAt)}</span>
          </div>
          <Link
            href={`/register/${tournament.id}`}
            className="shrink-0 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors"
          >
            Register →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Main carousel ───────────────────────────────────────────── */
export function HeroCarousel({
  mvpPlayers,
  upcomingTournaments,
}: {
  mvpPlayers: MvpPlayer[];
  upcomingTournaments: Tournament[];
}) {
  const slides: Slide[] = [
    { type: "ad" },
    ...mvpPlayers.slice(0, 4).map((p) => ({ type: "leaderboard" as const, player: p })),
    ...upcomingTournaments.slice(0, 3).map((t) => ({ type: "upcoming" as const, tournament: t })),
  ];

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="relative overflow-hidden rounded-2xl mx-3 my-3 sm:mx-6 sm:my-4 shadow-md">
      {/* Slide track */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full shrink-0">
            {slide.type === "ad" && <AdSlide />}
            {slide.type === "leaderboard" && <LeaderboardSlide player={slide.player} />}
            {slide.type === "upcoming" && <UpcomingSlide tournament={slide.tournament} />}
          </div>
        ))}
      </div>

      {/* Prev / Next arrows — desktop only */}
      <button
        onClick={prev}
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full items-center justify-center transition-colors z-10"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={() => next()}
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full items-center justify-center transition-colors z-10"
        aria-label="Next"
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-5" : "bg-white/40 w-1.5"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
