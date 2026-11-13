"use client";

import { useUiText } from "@/components/i18n/ui-text";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useActiveTournaments } from "@/lib/hooks/useActiveTournaments";
import type { MvpPlayer, Sponsor, Tournament, Winner } from "@/lib/types";
import { TournamentCard } from "@/components/mobile/tournaments/TournamentCard";
import { TournamentRow } from "@/components/mobile/tournaments/TournamentRow";
import { RegisteredFooter } from "@/components/mobile/tournaments/RegisteredFooter";
import { AnnouncementsSection } from "@/components/mobile/home/AnnouncementsSection";
import { CompletedSection } from "@/components/mobile/home/CompletedSection";
import { HallOfFameSection } from "@/components/mobile/home/HallOfFameSection";
import { SponsorsSection } from "@/components/mobile/home/SponsorsSection";
import { EmptyState, Skeleton, mCard } from "@/components/mobile/ui/primitives";
import { ChevronRightIcon, CrosshairIcon, RulesIcon, TrophyIcon, UsersIcon, WhatsAppIcon } from "@/components/mobile/ui/icons";
import { MyNextTournament } from "./MyNextTournament";
import { SpotlightCarousel } from "./SpotlightCarousel";

export function PlayerHome({ winners, mvpPlayers, upcomingTournaments, sponsors }: { winners: Winner[]; mvpPlayers: MvpPlayer[]; upcomingTournaments: Tournament[]; sponsors: Sponsor[] }) {
  const ui = useUiText();

  const { user } = useAuth();
  const { active, rest, loading } = useActiveTournaments();
  const upcoming = rest.filter(t => !active.some(a => a.id === t.id));
  const shortcuts = [
    { href: "/tournaments", label: "Tournaments", Icon: CrosshairIcon, colour: "bg-primary-light text-primary" },
    { href: "/account#registrations", label: "My matches", Icon: UsersIcon, colour: "bg-blue-50 text-blue-700" },
    { href: "/results", label: "Results", Icon: TrophyIcon, colour: "bg-amber-50 text-amber-700" },
    { href: "/rules", label: "Rules", Icon: RulesIcon, colour: "bg-green-50 text-green-700" },
  ];
  return (
    <div className="player-container">
      <div className="relative overflow-hidden rounded-[18px] border border-blue-100 bg-gradient-to-br from-white via-[#f1f7ff] to-[#eaf4f6] p-4 md:p-4 flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{ui(user ? ui("Welcome back") + (user.displayName ? `, ${user.displayName.split(" ")[0]}` : "") : "Your community. Your arena.")}</p>
          <h1 className="max-w-[600px] text-[24px] md:text-[30px] leading-tight font-bold tracking-tight">{ui("Ready for your next match?")}</h1>
          <p className="mt-2 text-sm text-muted-foreground hidden md:block">{ui("Find a tournament, bring your squad, and make your mark.")}</p>
        </div>
        <span className="hidden lg:inline-flex rounded-full border border-blue-100 bg-white/80 px-3 py-2 text-xs font-medium text-primary shrink-0">{ui("Free Fire · Bangladesh")}</span>
      </div>
      <nav aria-label={ui("Quick actions")} className={`${mCard} grid grid-cols-4 p-2 md:p-2.5 mb-3`}>
        {shortcuts.map(({ href, label, Icon, colour }) => <Link key={href} href={href} className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 rounded-xl py-2 hover:bg-muted transition-colors">
          <span className={`w-9 h-9 rounded-2xl flex items-center justify-center ${colour}`}>
            <Icon size={20} />
          </span>
          <span className="text-[11px] min-[380px]:text-xs md:text-sm font-semibold">{ui(label)}</span>
        </Link>)}
      </nav>
      {user && <MyNextTournament tournaments={[...active, ...rest]} tournamentsLoading={loading} />}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-4 lg:gap-4 items-start">
        <div className="min-w-0">
          <section id="upcoming-tournaments" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-lg font-bold">{ui(active.some(t => t.status === "ongoing") ? "Happening now" : "Featured tournaments")}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{ui("Your next game starts here.")}</p>
              </div>
              <Link href="/tournaments" className="inline-flex items-center text-sm font-semibold text-primary py-2">{ui("View all")}<ChevronRightIcon size={16} />
              </Link>
            </div>
            {ui(loading ? <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div> : active.length ? <div className="grid sm:grid-cols-2 gap-4">{active.slice(0, 4).map(t => <TournamentCard key={t.id} tournament={t} />)}</div> : <EmptyState icon={<CrosshairIcon size={24} />} title={ui("The next battle is on its way")} text={ui("Upcoming tournaments will appear below. Check back for new matches.")} className="bg-white" />)}
          </section>
          {upcoming.length > 0 && <section className="mt-5">
            <h2 className="text-lg font-bold mb-3">{ui("Coming up next")}</h2>
            <div className="space-y-3">{upcoming.slice(0, 3).map(t => <TournamentRow key={t.id} tournament={t} footer={<RegisteredFooter tournamentId={t.id} />} />)}</div>
          </section>}
          <div className="-mx-4 mt-4">
            <CompletedSection />
            <div id="player-highlights" className="scroll-mt-24">
              <HallOfFameSection winners={winners} mvpPlayers={mvpPlayers} />
            </div>
          </div>
        </div>
        <aside className="min-w-0 space-y-3">
          <SpotlightCarousel winners={winners} mvpPlayers={mvpPlayers} upcomingTournaments={upcomingTournaments} />
          <div className="-mx-4">
            <AnnouncementsSection />
          </div>
          {user && <Link href="/account#registrations" className={`${mCard} flex items-center gap-3 p-4 hover:border-primary/30`}>
            <UsersIcon className="text-primary shrink-0" />
            <span className="flex-1">
              <span className="block text-sm font-semibold">{ui("Your tournament hub")}</span>
              <span className="block mt-1 text-xs text-muted-foreground">{ui("Registrations, slots & approval status")}</span>
            </span>
            <ChevronRightIcon size={18} />
          </Link>}
          <div className={`${mCard} p-4`}>
            <span className="inline-flex w-10 h-10 rounded-xl bg-green-50 text-green-700 items-center justify-center">
              <WhatsAppIcon size={22} />
            </span>
            <h2 className="mt-3 text-base font-bold">{ui("Better with a squad.")}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{ui("Join the community for match updates and your next teammates.")}</p>
            <a href="https://chat.whatsapp.com/Eh3CuMwkzqFCCcC2GYARp4" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center w-full h-11 rounded-xl border border-border text-sm font-semibold hover:bg-muted">{ui("Join the community")}<ChevronRightIcon size={16} />
            </a>
          </div>
        </aside>
      </div>
      <div className="-mx-4 mt-4">
        <SponsorsSection sponsors={sponsors} />
      </div>
    </div>
  );
}
