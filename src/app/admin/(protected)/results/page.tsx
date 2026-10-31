import { ResultComposer } from "@/components/admin/ResultComposer";
import { ResultPostList } from "@/components/admin/ResultPostList";
import { serialize } from "@/lib/utils/serialize";
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
  const { posts, tournaments } = await getData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground tracking-wide">Results</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Posts for the Results page, which only signed-in members can open. Link a post to a tournament or
          leave it general. Save it as a draft to finish later, or publish it straight away.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">New post</h2>
        <ResultComposer tournaments={tournaments} />
      </div>

      <ResultPostList posts={posts} tournaments={tournaments} />
    </div>
  );
}
