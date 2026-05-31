import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import type { Tournament, Registration } from "@/lib/types";
import { serialize } from "@/lib/utils/serialize";

async function getData() {
  const { adminDb } = await import("@/lib/firebase/admin");

  const [tournamentsSnap, registrationsSnap] = await Promise.all([
    adminDb.collection("tournaments").get(),
    adminDb.collection("registrations").orderBy("registeredAt", "desc").get(),
  ]);

  const tournaments = tournamentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Tournament));
  const registrations = registrationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Registration));

  return serialize({ tournaments, registrations });
}

export default async function RegistrationsPage() {
  const data = await getData();

  const pendingCount = data.registrations.filter((r) => r.approvalStatus === "pending").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground tracking-wide">
          All Registrations
        </h1>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-amber-700">{pendingCount} pending approval</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <RegistrationsTable tournaments={data.tournaments} registrations={data.registrations} />
      </div>
    </div>
  );
}
