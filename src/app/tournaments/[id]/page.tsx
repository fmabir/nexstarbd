import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TournamentDashboard } from "@/components/tournaments/TournamentDashboard";
import { SlotProgressBar } from "@/components/tournaments/SlotProgressBar";
import { CountdownTimer } from "@/components/tournaments/CountdownTimer";
import { serialize } from "@/lib/utils/serialize";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { resolveBannerUrl } from "@/lib/utils/bannerUrl";
import { getSessionUser } from "@/lib/server/session";
import type { Tournament, Registration, TournamentStatus } from "@/lib/types";
import Link from "next/link";
import { RegistrationStatusButton } from "@/components/tournaments/RegistrationStatusButton";

const statusStyle: Record<TournamentStatus, { label: string; color: string }> = {
  upcoming:  { label: "Upcoming",  color: "bg-secondary text-white" },
  ongoing:   { label: "LIVE",      color: "bg-primary text-white" },
  completed: { label: "Completed", color: "bg-gray-500 text-white" },
  cancelled: { label: "Cancelled", color: "bg-amber-500 text-white" },
};

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();

  let tournament: Tournament | null = null;
  let myRegistration: Registration | null = null;
  let isLoggedIn = false;

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("tournaments").doc(id).get();
    if (doc.exists) {
      tournament = serialize({ id: doc.id, ...doc.data() } as unknown as Tournament);
    }

    if (tournament) {
      const sessionUser = await getSessionUser();
      if (sessionUser) {
        isLoggedIn = true;
        const snap = await adminDb
          .collection("registrations")
          .where("tournamentId", "==", id)
          .where("userId", "==", sessionUser.uid)
          .limit(1)
          .get();
        if (!snap.empty) {
          myRegistration = serialize({ id: snap.docs[0].id, ...snap.docs[0].data() } as unknown as Registration);
        }
      }
    }
  } catch {}

  if (!tournament) notFound();

  const s = statusStyle[tournament.status];
  const canRegister = tournament.isRegistrationOpen;

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-gray-50">

        {/* Entry strip */}
        {tournament.isFree ? (
          <div className="flex items-center justify-center gap-2 py-2 px-4 font-bold text-xs sm:text-sm uppercase tracking-widest text-center" style={{ background: "linear-gradient(90deg,#BF8E00,#FFD700,#BF8E00)", color: "#3B2500" }}>
            ✨ FREE ENTRY — No Registration Fee
          </div>
        ) : tournament.registrationFee ? (
          <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-800 text-white font-bold text-xs sm:text-sm uppercase tracking-widest text-center">
            Entry Fee: {tournament.registrationFee}
          </div>
        ) : null}

        {/* Banner header */}
        <div className="relative h-44 sm:h-64 overflow-hidden" style={{ backgroundColor: "#1f2937" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveBannerUrl(tournament.bannerUrl, tournament.id)}
            alt={tournament.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />

          {/* Back link */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors">
              ← Home
            </Link>
          </div>

          {/* Status + name */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-1.5 ${s.color}`}>
              {s.label === "LIVE" ? "🔴 LIVE NOW" : s.label}
            </span>
            <h1 className="font-display text-xl sm:text-3xl lg:text-4xl text-white tracking-wide leading-tight drop-shadow-lg">
              {tournament.name}
            </h1>
          </div>
        </div>

        {/* Info bar */}
        <div className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">

            {/* Prize (left) + Mode & Time (right) — stack on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Prize Pool</p>
                <p className="font-display text-2xl sm:text-3xl text-primary tracking-wide leading-none">{tournament.prizePool}</p>
                {(tournament.firstPrize || tournament.secondPrize) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tournament.firstPrize && (
                      <span className="text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full">🥇 {tournament.firstPrize}</span>
                    )}
                    {tournament.secondPrize && (
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">🥈 {tournament.secondPrize}</span>
                    )}
                  </div>
                )}
              </div>
              {/* Mode + time — row on mobile, column on desktop */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <span className="bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">⚔️ {tournament.mode}</span>
                <div className="blink bg-primary text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-right shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-0.5">Starts</p>
                  <p className="font-display text-lg sm:text-2xl tracking-wide leading-none">
                    {formatTimeOnly(tournament.startsAt)}
                  </p>
                  <p className="text-xs font-semibold opacity-80 mt-0.5">
                    {formatDateOnly(tournament.startsAt)}
                  </p>
                </div>
              </div>
            </div>

            <SlotProgressBar
              filled={tournament.registeredCount}
              max={tournament.maxSlots}
              waitlisted={tournament.waitlistCount}
            />

            <CountdownTimer
              targetDate={new Date((tournament.registrationDeadline as unknown as { seconds: number }).seconds * 1000)}
              label="Registration Closes In"
            />

            {/* Register / status button — register only available for ongoing tournaments */}
            <RegistrationStatusButton
              tournamentId={id}
              canRegister={canRegister}
              isFull={tournament.registeredCount >= tournament.maxSlots}
              isOngoing={tournament.status === "ongoing"}
            />
          </div>
        </div>

        {/* Dashboard content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <TournamentDashboard tournament={tournament} myRegistration={myRegistration} />
        </div>
      </main>
      <Footer />
    </>
  );
}
