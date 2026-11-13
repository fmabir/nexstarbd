"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useRef, useState } from "react";
import Link from "next/link";
import type { MvpPlayer, Tournament, Winner } from "@/lib/types";
import { ChevronLeftIcon, ChevronRightIcon, TrophyIcon } from "@/components/mobile/ui/icons";
import { formatDateOnly } from "@/lib/utils/formatDate";

export function SpotlightCarousel({ winners, mvpPlayers, upcomingTournaments }: { winners: Winner[]; mvpPlayers: MvpPlayer[]; upcomingTournaments: Tournament[] }) {
  const ui = useUiText();

  const champion = winners.find(w => w.position === 1);
  const mvp = mvpPlayers[0];
  const next = upcomingTournaments[0];
  const slides = [
    ...(next ? [{ label: "Next in the arena", title: next.name, detail: `${formatDateOnly(next.startsAt)} · ${next.isFree ? ui("Free entry") : `${ui("Entry")} ${next.registrationFee || ui("Fee applies")}`}`, href: `/tournaments/${next.id}`, action: "Explore tournament" }] : []),
    ...(champion ? [{ label: "Champions spotlight", title: champion.squadName, detail: champion.tournamentName, href: "/hall-of-fame", action: "Meet the champions" }] : []),
    ...(mvp ? [{ label: "Best player", title: mvp.playerName, detail: `${mvp.kills} ${ui("Kills")} · ${mvp.tournamentName}`, href: "/#player-highlights", action: "View player highlights" }] : []),
    { label: "Made for your squad", title: "Play together. Rise together.", detail: "Community tournaments for Bangladesh’s Free Fire players.", href: "/tournaments", action: "Find your next match" },
  ].slice(0, 3);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const slide = slides[index % slides.length];
  return (
    <section onTouchStart={event => { touchX.current = event.touches[0].clientX; }} onTouchEnd={event => {
      if (touchX.current === null) return;
      const distance = event.changedTouches[0].clientX - touchX.current;
      if (Math.abs(distance) > 50) setIndex(current => (current + (distance < 0 ? 1 : slides.length - 1)) % slides.length);
      touchX.current = null;
    }} aria-roledescription="carousel" aria-label={ui("Community spotlight")} className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[#eef5ff] text-foreground">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border-[24px] border-blue-200/30 pointer-events-none" aria-hidden="true" />
      <div className="p-4 min-h-[150px] flex flex-col relative" aria-live="polite" aria-atomic="true">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          <TrophyIcon size={16} />{ui(slide.label)}</p>
        <h2 className="mt-2 text-xl font-bold leading-tight break-words">{ui(slide.title)}</h2>
        <p className="mt-2 mb-2 text-xs leading-relaxed text-muted-foreground">{ui(slide.detail)}</p>
        <Link href={slide.href} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold py-2">{ui(slide.action)}<ChevronRightIcon size={16} />
        </Link>
      </div>
      {slides.length > 1 && <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex gap-1" aria-label={ui("Choose spotlight")}>{slides.map((s, i) => <button key={s.label} type="button" onClick={() => setIndex(i)} aria-label={ui(`Show slide ${i + 1}: ${s.label}`)} aria-pressed={index % slides.length === i} className="w-7 h-8 flex items-center justify-center">
          <span className={`h-1.5 rounded-full ${index % slides.length === i ? "w-6 bg-primary" : "w-1.5 bg-primary/20"}`} />
        </button>)}</div>
        <div className="flex gap-1">
          <button type="button" aria-label={ui("Previous spotlight")} onClick={() => setIndex((index + slides.length - 1) % slides.length)} className="p-2 rounded-lg hover:bg-primary/10">
            <ChevronLeftIcon size={17} />
          </button>
          <button type="button" aria-label={ui("Next spotlight")} onClick={() => setIndex((index + 1) % slides.length)} className="p-2 rounded-lg hover:bg-primary/10">
            <ChevronRightIcon size={17} />
          </button>
        </div>
      </div>}
    </section>
  );
}
