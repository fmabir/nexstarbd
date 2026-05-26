"use client";

import { useTournaments } from "@/lib/hooks/useTournaments";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export function UpcomingTournaments() {
  const t = useTranslations("tournament");
  const { tournaments, loading } = useTournaments("upcoming");

  return (
    <section id="upcoming-tournaments" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide mb-2">
            {t("upcoming")}
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🎮</p>
            <p className="text-muted-foreground text-lg">{t("noTournaments")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button href="/tournaments" variant="outline">
            View All Tournaments
          </Button>
        </div>
      </div>
    </section>
  );
}
