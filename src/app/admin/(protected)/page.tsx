
import { createUiText } from "@/components/i18n/ui-text";
import { getLocale } from "next-intl/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { connection } from "next/server";
import { migratePrivateData } from "@/lib/server/privateData";
import Link from "next/link";
import { Badge, Card, Stat, TournamentStatusBadge, ApprovalBadge, EmptyState, PageHeader, buttonClass } from "@/components/admin/ui";
import { AlertIcon, ChevronRightIcon, PlusIcon } from "@/components/admin/icons";
import type { ApprovalStatus, TournamentStatus } from "@/lib/types";

async function getDashboardStats() {
  // Only when an admin actually opens the page — never while the site is being built
  await connection();
  const db = getAdminDb();

  // One-off move of room and contact details out of public documents; a no-op once done
  try {
    await migratePrivateData(db);
  } catch (err) {
    console.error("migratePrivateData failed:", err);
  }

  const [tournamentsSnap, registrationsSnap, announcementsSnap, winnersSnap, mvpSnap, sponsorsSnap] =
    await Promise.all([
      db.collection("tournaments").get(),
      db.collection("registrations").get(),
      db.collection("announcements").get(),
      db.collection("winners").get(),
      db.collection("mvpPlayers").get(),
      db.collection("sponsors").get(),
    ]);

  const tournaments = tournamentsSnap.docs.map((d) => d.data());
  const registrations = registrationsSnap.docs.map((d) => d.data());

  const totalTournaments = tournaments.length;
  const liveTournaments = tournaments.filter((t) => t.status === "ongoing").length;
  const upcomingTournaments = tournaments.filter((t) => t.status === "upcoming").length;
  const completedTournaments = tournaments.filter((t) => t.status === "completed").length;

  const totalRegistrations = registrations.length;
  const pendingApprovals = registrations.filter((r) => r.approvalStatus === "pending").length;
  const approvedRegistrations = registrations.filter((r) => r.approvalStatus === "approved").length;
  const waitlisted = registrations.filter((r) => r.isWaitlisted).length;

  // Recent registrations (last 5)
  const recentRegistrations = registrationsSnap.docs
    .sort((a, b) => {
      const aTime = a.data().registeredAt?.toMillis?.() ?? 0;
      const bTime = b.data().registeredAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 5)
    .map((d) => ({ id: d.id, ...d.data() }));

  // Active tournaments (ongoing or upcoming with open registration)
  const activeTournaments = tournamentsSnap.docs
    .filter((d) => ["ongoing", "upcoming"].includes(d.data().status))
    .sort((a, b) => {
      const aTime = a.data().startsAt?.toMillis?.() ?? 0;
      const bTime = b.data().startsAt?.toMillis?.() ?? 0;
      return aTime - bTime;
    })
    .slice(0, 5)
    .map((d) => ({ id: d.id, ...d.data() }));

  return {
    totalTournaments, liveTournaments, upcomingTournaments, completedTournaments,
    totalRegistrations, pendingApprovals, approvedRegistrations, waitlisted,
    totalAnnouncements: announcementsSnap.size,
    totalWinners: winnersSnap.size,
    totalMvp: mvpSnap.size,
    totalSponsors: sponsorsSnap.size,
    recentRegistrations,
    activeTournaments,
  };
}

export default async function AdminDashboard() {
  const ui = createUiText(await getLocale());

  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title={ui("Dashboard")}
        description="What needs your attention, and how the platform is doing."
        actions={
          <Link href="/admin/tournaments" className={buttonClass("primary", "md")}>
            <PlusIcon size={18} />{ui("New tournament")}</Link>
        }
      />

      {/* What needs doing first */}
      {stats.pendingApprovals > 0 && (
        <Link
          href="/admin/registrations"
          className="flex items-center gap-4 rounded-2xl bg-(--ad-warn-soft) border border-(--ad-warn)/25 px-5 py-4 hover:border-(--ad-warn)/50 transition-colors"
        >
          <span className="w-10 h-10 rounded-full bg-(--ad-surface) text-(--ad-warn) flex items-center justify-center shrink-0">
            <AlertIcon size={20} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-(--ad-text)">
              {stats.pendingApprovals}{ui("squad")}{ui(stats.pendingApprovals > 1 ? "s" : "")}{ui("waiting for approval")}</span>
            <span className="block text-[13px] text-(--ad-dim)">{ui("Check payments and approve or reject them.")}</span>
          </span>
          <span className="hidden sm:inline text-sm font-semibold text-(--ad-warn)">{ui("Review")}</span>
          <ChevronRightIcon size={18} className="text-(--ad-warn) shrink-0" />
        </Link>
      )}

      <section>
        <h2 className="text-[13px] font-semibold text-(--ad-dim) mb-2.5">{ui("Tournaments")}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label={ui("Total")} value={stats.totalTournaments} href="/admin/tournaments" />
          <Stat label={ui("Live now")} value={stats.liveTournaments} tone={stats.liveTournaments > 0 ? "accent" : "neutral"} href="/admin/tournaments" />
          <Stat label={ui("Upcoming")} value={stats.upcomingTournaments} href="/admin/tournaments" />
          <Stat label={ui("Completed")} value={stats.completedTournaments} href="/admin/tournaments" />
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-semibold text-(--ad-dim) mb-2.5">{ui("Registrations")}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label={ui("Total squads")} value={stats.totalRegistrations} href="/admin/registrations" />
          <Stat
            label={ui("Pending")}
            value={stats.pendingApprovals}
            sub="needs action"
            tone={stats.pendingApprovals > 0 ? "warn" : "neutral"}
            href="/admin/registrations"
          />
          <Stat label={ui("Approved")} value={stats.approvedRegistrations} tone="success" href="/admin/registrations" />
          <Stat label={ui("Waitlisted")} value={stats.waitlisted} href="/admin/registrations" />
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-semibold text-(--ad-dim) mb-2.5">{ui("Content")}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label={ui("Announcements")} value={stats.totalAnnouncements} href="/admin/announcements" />
          <Stat label={ui("Hall of Fame")} value={stats.totalWinners} tone="gold" href="/admin/winners" />
          <Stat label={ui("MVP players")} value={stats.totalMvp} tone="gold" href="/admin/mvp" />
          <Stat label={ui("Sponsors")} value={stats.totalSponsors} href="/admin/sponsors" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title={ui("Active tournaments")}
          flush
          actions={
            <Link href="/admin/tournaments" className="text-[13px] font-semibold text-(--ad-accent)">{ui("View all")}</Link>
          }
        >
          {ui(stats.activeTournaments.length === 0 ? (
            <EmptyState title={ui("No active tournaments")} />
          ) : (
            <ul className="divide-y divide-(--ad-line)">
              {stats.activeTournaments.map((t: Record<string, unknown>) => (
                <li key={t.id as string}>
                  <Link
                    href={`/admin/tournaments/${t.id}`}
                    className="flex items-center gap-3 px-5 sm:px-6 py-3.5 hover:bg-(--ad-raised) transition-colors"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-(--ad-text) truncate">{t.name as string}</span>
                      <span className="block text-xs text-(--ad-dim)">
                        {t.registeredCount as number} / {t.maxSlots as number}{ui("squads")}</span>
                    </span>
                    <TournamentStatusBadge status={t.status as TournamentStatus} />
                    <ChevronRightIcon size={16} className="text-(--ad-faint) shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </Card>

        <Card
          title={ui("Recent registrations")}
          flush
          actions={
            <Link href="/admin/registrations" className="text-[13px] font-semibold text-(--ad-accent)">{ui("View all")}</Link>
          }
        >
          {ui(stats.recentRegistrations.length === 0 ? (
            <EmptyState title={ui("No registrations yet")} />
          ) : (
            <ul className="divide-y divide-(--ad-line)">
              {stats.recentRegistrations.map((r: Record<string, unknown>) => (
                <li key={r.id as string} className="flex items-center gap-3 px-5 sm:px-6 py-3.5">
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-(--ad-text) truncate">{r.squadName as string}</span>
                    <span className="block text-xs text-(--ad-dim) truncate">{ui("by")}{r.leaderName as string}</span>
                  </span>
                  {ui(r.approvalStatus ? (
                    <ApprovalBadge status={r.approvalStatus as ApprovalStatus} />
                  ) : (
                    <Badge>—</Badge>
                  ))}
                </li>
              ))}
            </ul>
          ))}
        </Card>
      </div>
    </div>
  );
}
