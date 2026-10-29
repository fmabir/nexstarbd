"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { MvpPlayer, Tournament, Winner } from "@/lib/types";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { resolveBanner } from "@/lib/utils/bannerUrl";
import { Chip, PlaceBadge, art, mCard, onImage } from "@/components/mobile/ui/primitives";
import { CheckIcon, CrosshairIcon, CrownIcon } from "@/components/mobile/ui/icons";

type Slide =
  | { type: "welcome" }
  | { type: "banner" }
  | { type: "champion"; champion: Winner; runnerUp: Winner | null; tournamentName: string }
  | { type: "leaderboard"; player: MvpPlayer }
  | { type: "upcoming"; tournament: Tournament };

const AUTOPLAY_MS = 5000;
const slideShell = `relative h-full ${mCard} overflow-hidden`;

/** Opening slide: the squad illustration with the site's pitch. */
function WelcomeSlide() {
  const t = useTranslations("hero");
  return (
    <div className={slideShell}>
      {/* Art and text split the slide 46/54 so they never overlap */}
      <div className="absolute inset-y-0 right-0 w-[46%]">
        <Image src={art.squad} alt="" fill sizes="40vw" className="object-contain" />
      </div>
      <div className="relative h-full w-[54%] flex flex-col justify-center pl-4 pr-1">
        <p className="font-m-display font-bold text-[20px] leading-[1.1] text-m-text">{t("title")}</p>
        <ul className="mt-3 space-y-1">
          {t("subtitle")
            .split("|")
            .map((point) => (
              <li key={point} className="flex items-center gap-1.5 text-[12px] font-medium text-m-dim">
                <CheckIcon size={14} className="shrink-0 text-m-green-text" />
                {point.trim()}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

function BannerSlide() {
  return (
    <div className={slideShell}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/banners/bgbn.png" alt="NexStarBD — hunting the best Free Fire players in Bangladesh" className="w-full h-full object-cover" />
    </div>
  );
}

function PodiumLine({ place, winner }: { place: 1 | 2; winner: Winner }) {
  return (
    <div className="flex items-center gap-3">
      <PlaceBadge place={place} size={28} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`font-m-display font-bold leading-tight text-m-text truncate ${place === 1 ? "text-[19px]" : "text-[17px]"}`}>
            {winner.squadName}
          </p>
          {winner.prize && (
            <span className={`shrink-0 font-m-display font-semibold text-[15px] ${place === 1 ? "text-m-gold-text" : "text-m-silver-text"}`}>
              {winner.prize}
            </span>
          )}
        </div>
        <p className="text-[12px] text-m-dim truncate">{winner.players.slice(0, 4).join(" · ")}</p>
      </div>
    </div>
  );
}

function ChampionSlide({ champion, runnerUp, tournamentName }: { champion: Winner; runnerUp: Winner | null; tournamentName: string }) {
  return (
    <div className={slideShell}>
      <div className="absolute top-2 right-2 w-[88px] h-[88px]">
        <Image src={art.trophy} alt="" fill sizes="88px" className="object-contain" />
      </div>
      <div className="relative h-full flex flex-col p-4">
        <div className="pr-24">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-m-gold-text">
            <CrownIcon size={16} className="shrink-0" />
            Champions
          </p>
          <p className="mt-0.5 text-[13px] text-m-faint truncate">{tournamentName}</p>
        </div>
        <div className="mt-auto space-y-3">
          <PodiumLine place={1} winner={champion} />
          {runnerUp ? (
            <PodiumLine place={2} winner={runnerUp} />
          ) : (
            <p className="text-[12px] text-m-faint pl-10">No runner-up recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LeaderboardSlide({ player }: { player: MvpPlayer }) {
  return (
    <div className={slideShell}>
      {/* mvpbg is a bright scene with the player on the right — fade it to white under the text */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/banners/mvpbg.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-right" />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/0" />
      <div className="relative h-full flex flex-col p-4 w-[72%]">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-m-red-text">
          <CrosshairIcon size={16} className="shrink-0" />
          Top kills
        </p>
        <p className="mt-0.5 text-[13px] text-m-faint truncate">{player.tournamentName}</p>
        <div className="mt-auto min-w-0">
          <p className="font-m-display font-bold text-[22px] leading-tight text-m-text truncate">{player.playerName}</p>
          <p className="text-[12px] font-mono text-m-dim truncate">UID {player.uid}</p>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span className="font-m-display font-bold text-[44px] leading-[0.9] tabular-nums text-m-red-text">{player.kills}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-m-dim">
              Kills{player.damage ? ` · ${player.damage.toLocaleString()} dmg` : ""}
            </span>
          </p>
          {player.achievement && (
            <Chip tone="gold" className="mt-2 max-w-full">
              <span className="truncate">{player.achievement}</span>
            </Chip>
          )}
        </div>
      </div>
    </div>
  );
}

function UpcomingSlide({ tournament: t }: { tournament: Tournament }) {
  const banner = resolveBanner(t.bannerUrl, t.id);
  return (
    <Link href={`/tournaments/${t.id}`} className={`${slideShell} block`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.src}
        style={{ objectPosition: banner.position }}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <span className={`inline-block ${onImage}`}>
          <Chip>Upcoming</Chip>
        </span>
        <p className="mt-2 font-m-display font-bold text-[21px] leading-[1.15] text-white line-clamp-2">{t.name}</p>
        <p className="mt-0.5 text-[13px] text-white/80 truncate">
          {/* Bright gold: this line sits on the dark photo, not the white page */}
          <span className="font-semibold text-m-gold">{t.prizePool}</span> · {formatTimeOnly(t.startsAt)} · {formatDateOnly(t.startsAt)}
        </p>
      </div>
    </Link>
  );
}

/** Swipeable highlights — the same slides as the desktop hero, as a snap-scrolling rail. */
export function HighlightsRail({
  winners,
  mvpPlayers,
  upcomingTournaments,
}: {
  winners: Winner[];
  mvpPlayers: MvpPlayer[];
  upcomingTournaments: Tournament[];
}) {
  // Champion + runner-up of the same tournament share a slide
  const byTournament = new Map<string, { champion?: Winner; runnerUp?: Winner; tournamentName: string }>();
  for (const w of winners) {
    if (!byTournament.has(w.tournamentId)) byTournament.set(w.tournamentId, { tournamentName: w.tournamentName });
    const entry = byTournament.get(w.tournamentId)!;
    if (w.position === 1) entry.champion = w;
    if (w.position === 2) entry.runnerUp = w;
  }

  const slides: Slide[] = [
    { type: "welcome" },
    { type: "banner" },
    ...Array.from(byTournament.values())
      .filter((e) => e.champion)
      .slice(0, 3)
      .map((e) => ({ type: "champion" as const, champion: e.champion!, runnerUp: e.runnerUp ?? null, tournamentName: e.tournamentName })),
    ...mvpPlayers.slice(0, 4).map((p) => ({ type: "leaderboard" as const, player: p })),
    ...upcomingTournaments.slice(0, 3).map((t) => ({ type: "upcoming" as const, tournament: t })),
  ];

  const railRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const lastTouchRef = useRef(0);

  const goTo = useCallback((index: number) => {
    const rail = railRef.current;
    const slide = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !slide) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The rail is `relative`, so offsetLeft is measured from it; 16 = its left padding
    rail.scrollTo({ left: slide.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
  }, []);

  // Track which slide is in view from the scroll position, so swipes and dots agree
  const onScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    let index = 0;
    if (rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2) {
      index = rail.children.length - 1;
    } else {
      let best = Infinity;
      Array.from(rail.children).forEach((el, i) => {
        const d = Math.abs((el as HTMLElement).offsetLeft - 16 - rail.scrollLeft);
        if (d < best) {
          best = d;
          index = i;
        }
      });
    }
    currentRef.current = index;
    setCurrent(index);
  };

  // Auto-advance, holding off while someone is swiping and for one full beat after
  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (document.hidden || Date.now() - lastTouchRef.current < AUTOPLAY_MS) return;
      goTo((currentRef.current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length, goTo]);

  const markTouch = () => {
    lastTouchRef.current = Date.now();
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Highlights">
      <div
        ref={railRef}
        onScroll={onScroll}
        onTouchStart={markTouch}
        onTouchEnd={markTouch}
        className="relative flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 scroll-px-4"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="snap-start shrink-0 w-[86%] h-[204px]"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            {slide.type === "welcome" && <WelcomeSlide />}
            {slide.type === "banner" && <BannerSlide />}
            {slide.type === "champion" && (
              <ChampionSlide champion={slide.champion} runnerUp={slide.runnerUp} tournamentName={slide.tournamentName} />
            )}
            {slide.type === "leaderboard" && <LeaderboardSlide player={slide.player} />}
            {slide.type === "upcoming" && <UpcomingSlide tournament={slide.tournament} />}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center items-center gap-0.5 mt-1.5 h-6">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                markTouch();
                goTo(i);
              }}
              className="flex items-center justify-center h-6 w-5"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-4 bg-m-red" : "w-1.5 bg-m-line-strong"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
