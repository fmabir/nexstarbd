"use client";

import { useActiveTournaments } from "@/lib/hooks/useActiveTournaments";
import { SeeAllLink, Section, art } from "@/components/mobile/ui/primitives";
import { TournamentRow } from "@/components/mobile/tournaments/TournamentRow";
import { RegisteredFooter } from "@/components/mobile/tournaments/RegisteredFooter";

export function UpcomingSection() {
  const { rest: upcoming, loading } = useActiveTournaments();

  if (loading || upcoming.length === 0) return null;

  return (
    <Section
      title="Upcoming tournaments"
      tone="green"
      backdrop={art.arena}
      flipBackdrop
      action={<SeeAllLink href="/tournaments" />}
    >
      <div className="px-4 space-y-2.5">
        {upcoming.map((t) => (
          <TournamentRow key={t.id} tournament={t} footer={<RegisteredFooter tournamentId={t.id} />} />
        ))}
      </div>
    </Section>
  );
}
