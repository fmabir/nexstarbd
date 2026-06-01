import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { serialize } from "@/lib/utils/serialize";
import type { Tournament, TournamentStatus } from "@/lib/types";

async function getAllTournaments(): Promise<Tournament[]> {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("tournaments")
      .orderBy("startsAt", "desc")
      .get();
    return serialize(snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Tournament)));
  } catch {
    return [];
  }
}

const statusOrder: Record<TournamentStatus, number> = {
  ongoing:   0,
  upcoming:  1,
  completed: 2,
  cancelled: 3,
};

const groupLabels: Record<TournamentStatus, string> = {
  ongoing:   "🔴 Live Now",
  upcoming:  "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function TournamentsPage() {
  const locale = await getLocale();
  const tournaments = await getAllTournaments();

  const groups = (["ongoing", "upcoming", "completed", "cancelled"] as TournamentStatus[])
    .map((status) => ({
      status,
      label: groupLabels[status],
      items: tournaments.filter((t) => t.status === status),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-muted">
        {/* Header */}
        <div className="bg-gray-900 text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-display text-5xl sm:text-6xl tracking-wide mb-2">
              All Tournaments
            </h1>
            <p className="text-gray-400">
              {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
          {tournaments.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🎮</p>
              <p className="text-lg font-semibold text-foreground">No tournaments yet</p>
              <p className="text-muted-foreground text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.status}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-esports font-bold text-lg text-foreground uppercase tracking-wide">
                    {group.label}
                  </h2>
                  <span className="text-xs font-semibold text-muted-foreground bg-gray-200 px-2 py-0.5 rounded-full">
                    {group.items.length}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {group.items.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
