"use client";

import Link from "next/link";
import { useActiveTournaments } from "@/lib/hooks/useActiveTournaments";
import { RegistrationStatusButton } from "@/components/tournaments/RegistrationStatusButton";
import { CountdownTimer } from "@/components/tournaments/CountdownTimer";
import { SlotProgressBar } from "@/components/tournaments/SlotProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { resolveBannerUrl } from "@/lib/utils/bannerUrl";
import type { Tournament } from "@/lib/types";

function ActiveTournamentCard({ tournament }: { tournament: Tournament }) {
  const isOngoing = tournament.status === "ongoing";
  const isFull = tournament.registeredCount >= tournament.maxSlots;
  const canRegister = tournament.isRegistrationOpen;

  return (
    <div className="rounded-3xl border-2 border-border overflow-hidden shadow-sm bg-white">
      {/* Entry strip — above banner */}
      {tournament.isFree ? (
        <div className="flex items-center justify-center gap-2 py-2 px-4 font-bold text-xs uppercase tracking-widest" style={{ background: "linear-gradient(90deg,#BF8E00,#FFD700,#BF8E00)", color: "#3B2500" }}>
          ✨ FREE ENTRY — No Registration Fee
        </div>
      ) : tournament.registrationFee ? (
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-800 text-white font-bold text-xs uppercase tracking-widest">
          Entry Fee: {tournament.registrationFee}
        </div>
      ) : null}

      {/* Banner */}
      <div className="relative h-20 sm:h-40 lg:h-52 overflow-hidden" style={{ backgroundColor: "#1f2937" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveBannerUrl(tournament.bannerUrl, tournament.id)}
          alt={tournament.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)" }} />

        <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
          {isOngoing ? (
            <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE NOW
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-secondary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              Registration Open
            </span>
          )}
        </div>

        <div className="absolute bottom-2 left-3 right-3 sm:bottom-4 sm:left-5 sm:right-5">
          <h2 className="font-display text-sm sm:text-2xl lg:text-4xl text-white tracking-wide leading-tight drop-shadow-lg line-clamp-1">
            {tournament.name}
          </h2>
        </div>
      </div>

      {/* Mobile body */}
      <div className="sm:hidden p-2 space-y-1.5">
        {/* Prize + mode + start time — single compact row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Prize Pool</p>
            <p className="font-display text-base text-primary tracking-wide leading-none">{tournament.prizePool}</p>
          </div>
          <span className="shrink-0 bg-secondary/10 text-secondary border border-secondary/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            ⚔️ {tournament.mode}
          </span>
          <div className="shrink-0 blink bg-primary text-white rounded-lg px-2 py-1 text-right shadow-sm">
            <p className="text-[9px] font-semibold uppercase tracking-widest opacity-80 leading-none">Starts</p>
            <p className="font-display text-xs tracking-wide leading-tight">{formatTimeOnly(tournament.startsAt)}</p>
            <p className="text-[9px] font-semibold opacity-80">{formatDateOnly(tournament.startsAt)}</p>
          </div>
        </div>
        <SlotProgressBar filled={tournament.registeredCount} max={tournament.maxSlots} waitlisted={tournament.waitlistCount} />
        <CountdownTimer compact targetDate={tournament.registrationDeadline.toDate()} label="Closes in" />
        <div className="flex gap-1.5">
          <RegistrationStatusButton tournamentId={tournament.id} canRegister={canRegister} isFull={isFull} isOngoing={isOngoing} size="sm" />
          <Link href={`/tournaments/${tournament.id}`} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-foreground font-semibold px-2 py-1.5 rounded-lg text-[10px] transition-colors">
            View Details
          </Link>
        </div>
      </div>

      {/* Desktop body — unchanged original layout */}
      <div className="hidden sm:block p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Prize Pool</p>
            <p className="font-display text-3xl text-primary tracking-wide leading-none">{tournament.prizePool}</p>
            {(tournament.firstPrize || tournament.secondPrize) && (
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {tournament.firstPrize && (
                  <span className="text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full">🥇 {tournament.firstPrize}</span>
                )}
                {tournament.secondPrize && (
                  <span className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">🥈 {tournament.secondPrize}</span>
                )}
              </div>
            )}
          </div>
          <div className="shrink-0 blink bg-primary text-white rounded-xl px-3 py-2.5 text-right shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-0.5">Starts</p>
            <p className="font-display text-2xl tracking-wide leading-none">{formatTimeOnly(tournament.startsAt)}</p>
            <p className="text-xs font-semibold opacity-80 mt-0.5">{formatDateOnly(tournament.startsAt)}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold px-3 py-1.5 rounded-full">
          ⚔️ {tournament.mode}
        </span>
        <SlotProgressBar filled={tournament.registeredCount} max={tournament.maxSlots} waitlisted={tournament.waitlistCount} />
        <CountdownTimer targetDate={tournament.registrationDeadline.toDate()} label="Registration Closes In" />
        <div className="flex gap-2">
          <RegistrationStatusButton tournamentId={tournament.id} canRegister={canRegister} isFull={isFull} isOngoing={isOngoing} />
          <Link href={`/tournaments/${tournament.id}`} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-foreground font-semibold px-4 py-3 rounded-xl text-sm transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FeaturedTournament() {
  const { active, loading } = useActiveTournaments();

  if (loading) {
    return (
      <section className="py-20 bg-white/80 border-t border-border flex justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  if (active.length === 0) {
    return (
      <section className="py-20 bg-white/80 border-t border-border text-center">
        <p className="text-5xl mb-4">🎮</p>
        <p className="text-lg font-semibold text-foreground">No active tournament right now</p>
        <p className="text-muted-foreground text-sm mt-1">Check back soon for the next one!</p>
      </section>
    );
  }

  const hasOngoing = active[0].status === "ongoing";

  return (
    <section className="py-6 sm:py-12 bg-white/80 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${hasOngoing ? "bg-primary" : "bg-secondary"}`} />
          <span className="font-esports font-bold text-xs uppercase tracking-widest text-muted-foreground">
            {hasOngoing ? "Live Tournaments" : "Registration Open"}
          </span>
        </div>

        {/* Stack on mobile, side by side on sm+ */}
        <div className={`grid gap-4 ${active.length === 1 ? "max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-2"}`}>
          {active.map((t) => (
            <ActiveTournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
