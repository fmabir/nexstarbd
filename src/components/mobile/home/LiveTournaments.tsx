"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useActiveTournaments } from "@/lib/hooks/useActiveTournaments";
import { EmptyState, Section, SectionBand, Skeleton, art } from "@/components/mobile/ui/primitives";
import { TournamentCard } from "@/components/mobile/tournaments/TournamentCard";

/** The tournament(s) a player can act on right now — live, or open for registration. */
export function LiveTournaments() {
  const ui = useUiText();

  const { active, loading } = useActiveTournaments();

  if (loading) {
    return (
      <SectionBand tone="red">
        <div className="px-4">
          <Skeleton className="h-[460px]" />
        </div>
      </SectionBand>
    );
  }

  if (active.length === 0) {
    return (
      <SectionBand tone="red">
        <div className="px-4">
          <EmptyState
            art={art.arena}
            title={ui("No active tournament right now")}
            text={ui("Check back soon for the next one!")}
            className="bg-m-surface"
          />
        </div>
      </SectionBand>
    );
  }

  const hasOngoing = active[0].status === "ongoing";

  return (
    <Section title={ui(hasOngoing ? "Live now" : "Registration open")} live={hasOngoing} tone="red" backdrop={art.arena}>
      <div className="px-4 space-y-3">
        {active.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    </Section>
  );
}
