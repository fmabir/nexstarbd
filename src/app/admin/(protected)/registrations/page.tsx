
import { createUiText } from "@/components/i18n/ui-text";
import { getLocale } from "next-intl/server";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import type { Tournament, Registration } from "@/lib/types";
import { serialize } from "@/lib/utils/serialize";
import { withPrivateFields } from "@/lib/server/privateData";
import { Badge, Card, PageHeader } from "@/components/admin/ui";

async function getData() {
  const { adminDb } = await import("@/lib/firebase/admin");

  const [tournamentsSnap, registrationsSnap] = await Promise.all([
    adminDb.collection("tournaments").get(),
    adminDb.collection("registrations").orderBy("registeredAt", "desc").get(),
  ]);

  const tournaments = tournamentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Tournament));
  // Contact and payment details live outside the public registration
  const registrations = await withPrivateFields(
    adminDb,
    registrationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Registration))
  );

  return serialize({ tournaments, registrations });
}

export default async function RegistrationsPage() {
  const ui = createUiText(await getLocale());

  const data = await getData();

  const pendingCount = data.registrations.filter((r) => r.approvalStatus === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={ui("Registrations")}
        description="Every squad across all tournaments. Check payments, then approve or reject."
        actions={pendingCount > 0 ? <Badge tone="warn" dot>{pendingCount}{ui("pending approval")}</Badge> : undefined}
      />

      <Card flush>
        <RegistrationsTable tournaments={data.tournaments} registrations={data.registrations} />
      </Card>
    </div>
  );
}
