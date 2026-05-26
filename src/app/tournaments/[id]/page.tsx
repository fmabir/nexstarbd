import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TournamentDashboard } from "@/components/tournaments/TournamentDashboard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SlotProgressBar } from "@/components/tournaments/SlotProgressBar";
import type { Tournament, TournamentStatus } from "@/lib/types";

const statusBadge: Record<
  TournamentStatus,
  { label: string; variant: "info" | "danger" | "neutral" | "warning" }
> = {
  upcoming: { label: "Upcoming", variant: "info" },
  ongoing: { label: "LIVE", variant: "danger" },
  completed: { label: "Completed", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "warning" },
};

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();

  let tournament: Tournament | null = null;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("tournaments").doc(id).get();
    if (doc.exists) {
      tournament = { id: doc.id, ...doc.data() } as unknown as Tournament;
    }
  } catch {}

  if (!tournament) notFound();

  const s = statusBadge[tournament.status];
  const canRegister =
    tournament.isRegistrationOpen && tournament.status === "upcoming";

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-muted">
        {/* Header */}
        <div className="bg-gray-900 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4">
              <Button href="/" variant="ghost" size="sm" className="text-white/70 hover:text-white border-white/20">
                ← Home
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={s.variant}>
                    {s.label === "LIVE" && (
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse mr-1" />
                    )}
                    {s.label}
                  </Badge>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl tracking-wide mb-1">
                  {tournament.name}
                </h1>
                <p className="text-gray-400 text-sm">{tournament.description}</p>
              </div>
              <div className="flex flex-col gap-2 items-start sm:items-end shrink-0">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Prize Pool</p>
                  <p className="font-display text-3xl text-secondary">{tournament.prizePool}</p>
                </div>
                {canRegister && (
                  <Button href={`/register/${id}`} size="sm">
                    Register Squad
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-6 max-w-md">
              <SlotProgressBar
                filled={tournament.registeredCount}
                max={tournament.maxSlots}
                waitlisted={tournament.waitlistCount}
              />
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <TournamentDashboard tournament={tournament} />
        </div>
      </main>
      <Footer />
    </>
  );
}
