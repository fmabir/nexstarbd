import { AnnouncementComposer } from "@/components/admin/AnnouncementComposer";
import { AnnouncementList } from "@/components/admin/AnnouncementList";
import { serialize } from "@/lib/utils/serialize";
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
  const { announcements, tournaments } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wide">Announcements</h1>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Post Announcement</h2>
        <AnnouncementComposer tournaments={tournaments} />
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Announcements ({announcements.length})</h2>
        </div>
        <AnnouncementList announcements={announcements} tournaments={tournaments} />
      </div>
    </div>
  );
}
