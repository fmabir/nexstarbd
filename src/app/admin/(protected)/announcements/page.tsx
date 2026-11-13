
import { createUiText } from "@/components/i18n/ui-text";
import { getLocale } from "next-intl/server";
import { AnnouncementComposer } from "@/components/admin/AnnouncementComposer";
import { AnnouncementList } from "@/components/admin/AnnouncementList";
import { serialize } from "@/lib/utils/serialize";
import { Card, PageHeader } from "@/components/admin/ui";
import type { Announcement, Tournament } from "@/lib/types";

async function getData() {
  const { adminDb } = await import("@/lib/firebase/admin");
  const [annSnap, tSnap] = await Promise.all([
    adminDb.collection("announcements").orderBy("createdAt", "desc").limit(30).get(),
    adminDb.collection("tournaments").orderBy("startsAt", "desc").limit(20).get(),
  ]);
  return serialize({
    announcements: annSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Announcement)),
    tournaments: tSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Tournament)),
  });
}

export default async function AdminAnnouncementsPage() {
  const ui = createUiText(await getLocale());

  const { announcements, tournaments } = await getData();

  return (
    <div className="space-y-6">
      <PageHeader title={ui("Announcements")} description="News for everyone, or for one tournament's players. Pinned posts stay on top." />

      <Card title={ui("Post announcement")}>
        <AnnouncementComposer tournaments={tournaments} />
      </Card>

      <Card title={ui(`Recent announcements (${announcements.length})`)} flush>
        <AnnouncementList announcements={announcements} tournaments={tournaments} />
      </Card>
    </div>
  );
}
