
import { createUiText } from "@/components/i18n/ui-text";
import { getLocale } from "next-intl/server";
import { ResultComposer } from "@/components/admin/ResultComposer";
import { ResultPostList } from "@/components/admin/ResultPostList";
import { serialize } from "@/lib/utils/serialize";
import { Card, PageHeader } from "@/components/admin/ui";
import type { ResultPost } from "@/lib/types";

async function getData() {
  const { adminDb } = await import("@/lib/firebase/admin");
  const [postSnap, tSnap] = await Promise.all([
    adminDb.collection("resultPosts").orderBy("createdAt", "desc").limit(50).get(),
    adminDb.collection("tournaments").orderBy("startsAt", "desc").limit(30).get(),
  ]);
  return {
    posts: serialize(postSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as ResultPost)),
    tournaments: tSnap.docs.map((d) => ({ id: d.id, name: d.get("name") as string })),
  };
}

export default async function AdminResultsPage() {
  const ui = createUiText(await getLocale());

  const { posts, tournaments } = await getData();

  return (
    <div className="space-y-6">
      <PageHeader
        title={ui("Results")}
        description="Posts for the Results page, which only signed-in members can open. Link a post to a tournament or leave it general. Save it as a draft to finish later, or publish it straight away."
      />

      <Card title={ui("New post")}>
        <ResultComposer tournaments={tournaments} />
      </Card>

      <ResultPostList posts={posts} tournaments={tournaments} />
    </div>
  );
}
