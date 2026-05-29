import { getAdminDb } from "@/lib/firebase/admin";
import Link from "next/link";

async function getDashboardStats() {
  const db = getAdminDb();

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

function StatCard({ label, value, sub, href, urgent }: {
  label: string; value: number | string; sub?: string; href?: string; urgent?: boolean;
}) {
  const card = (
    <div className={`bg-white rounded-2xl border p-5 flex flex-col gap-1 hover:shadow-md transition-shadow ${urgent && Number(value) > 0 ? "border-primary" : "border-border"}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-bold ${urgent && Number(value) > 0 ? "text-primary" : "text-foreground"}`}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your platform</p>
      </div>

      {/* Urgent alert */}
      {stats.pendingApprovals > 0 && (
        <Link href="/admin/tournaments">
          <div className="bg-primary/10 border border-primary rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-primary text-sm">
                {stats.pendingApprovals} squad{stats.pendingApprovals > 1 ? "s" : ""} waiting for approval
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Review and approve registrations</p>
            </div>
            <span className="text-primary font-bold text-sm">Review →</span>
          </div>
        </Link>
      )}

      {/* Tournament stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tournaments</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.totalTournaments} href="/admin/tournaments" />
          <StatCard label="Live Now" value={stats.liveTournaments} sub="ongoing" href="/admin/tournaments" />
          <StatCard label="Upcoming" value={stats.upcomingTournaments} href="/admin/tournaments" />
          <StatCard label="Completed" value={stats.completedTournaments} href="/admin/tournaments" />
        </div>
      </div>

      {/* Registration stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Registrations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Squads" value={stats.totalRegistrations} />
          <StatCard label="Pending" value={stats.pendingApprovals} sub="needs action" href="/admin/tournaments" urgent />
          <StatCard label="Approved" value={stats.approvedRegistrations} />
          <StatCard label="Waitlisted" value={stats.waitlisted} />
        </div>
      </div>

      {/* Content stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Content</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Announcements" value={stats.totalAnnouncements} href="/admin/announcements" />
          <StatCard label="Hall of Fame" value={stats.totalWinners} href="/admin/winners" />
          <StatCard label="MVP Players" value={stats.totalMvp} href="/admin/mvp" />
          <StatCard label="Sponsors" value={stats.totalSponsors} href="/admin/sponsors" />
        </div>
      </div>

      {/* Bottom two panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Active tournaments */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Active Tournaments</h2>
            <Link href="/admin/tournaments" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {stats.activeTournaments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active tournaments.</p>
          ) : (
            <div className="space-y-3">
              {stats.activeTournaments.map((t: Record<string, unknown>) => (
                <Link key={t.id as string} href={`/admin/tournaments/${t.id}`}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:opacity-70 transition-opacity">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name as string}</p>
                    <p className="text-xs text-muted-foreground">{t.registeredCount as number} / {t.maxSlots as number} squads</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    t.status === "ongoing" ? "bg-primary/10 text-primary" : "bg-blue-50 text-blue-600"
                  }`}>
                    {t.status as string}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent registrations */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Registrations</h2>
            <Link href="/admin/tournaments" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {stats.recentRegistrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No registrations yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentRegistrations.map((r: Record<string, unknown>) => (
                <div key={r.id as string} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.squadName as string}</p>
                    <p className="text-xs text-muted-foreground">by {r.leaderName as string}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    r.approvalStatus === "approved" ? "bg-green-50 text-green-600" :
                    r.approvalStatus === "rejected" ? "bg-red-50 text-red-600" :
                    "bg-yellow-50 text-yellow-600"
                  }`}>
                    {r.approvalStatus as string}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
