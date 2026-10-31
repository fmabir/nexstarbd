"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { timeAgo } from "@/lib/utils/formatDate";
import { resultPhotoUrl } from "@/lib/utils/resultPhotos";
import { ResultComposer, type TournamentOption } from "./ResultComposer";
import type { ResultPost, ResultPostStatus } from "@/lib/types";

/** Drafts first, then what's live, each with edit / publish / delete. */
export function ResultPostList({ posts, tournaments }: { posts: ResultPost[]; tournaments: TournamentOption[] }) {
  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");

  return (
    <>
      <Group title="Drafts" note="Only admins can see these" posts={drafts} tournaments={tournaments} empty="No drafts." />
      <Group title="Published" note="Members see these on the Results page" posts={published} tournaments={tournaments} empty="Nothing published yet." />
    </>
  );
}

function Group({
  title,
  note,
  posts,
  tournaments,
  empty,
}: {
  title: string;
  note: string;
  posts: ResultPost[];
  tournaments: TournamentOption[];
  empty: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-semibold">
          {title} ({posts.length})
        </h2>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">{empty}</div>
      ) : (
        <div className="divide-y divide-border">
          {posts.map((p) => (
            <Row key={p.id} post={p} tournaments={tournaments} />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ post, tournaments }: { post: ResultPost; tournaments: TournamentOption[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<"status" | "delete" | null>(null);

  const setStatus = async (status: ResultPostStatus) => {
    setBusy("status");
    try {
      const form = new FormData();
      form.set("status", status);
      const res = await fetch(`/api/admin/results/${post.id}`, { method: "PATCH", body: form });
      if (!res.ok) throw new Error();
      showToast(status === "published" ? "Posted to Results!" : "Moved to drafts", "success");
      router.refresh();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this post and its photos? This can't be undone.")) return;
    setBusy("delete");
    try {
      const res = await fetch("/api/admin/results", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id }),
      });
      if (!res.ok) throw new Error();
      showToast("Post deleted", "success");
      router.refresh();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setBusy(null);
    }
  };

  if (editing) {
    return (
      <div className="px-6 py-5">
        <ResultComposer post={post} tournaments={tournaments} onDone={() => setEditing(false)} />
      </div>
    );
  }

  const cover = post.photos[0];
  const heading = post.title || post.body.split("\n")[0] || "Photos";

  return (
    <div className="flex items-start gap-4 px-6 py-4">
      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center text-2xl">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resultPhotoUrl(cover.id)} alt="" className="w-full h-full object-cover" />
        ) : (
          <span aria-hidden="true">📝</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap text-xs text-muted-foreground">
          {post.tournamentName && (
            <span className="font-bold px-2 py-0.5 rounded-full bg-muted">{post.tournamentName}</span>
          )}
          <span>
            {post.status === "published" ? `Published ${timeAgo(post.publishedAt)}` : `Saved ${timeAgo(post.updatedAt)}`}
          </span>
          {post.photos.length > 0 && <span>· {post.photos.length} photo{post.photos.length > 1 ? "s" : ""}</span>}
        </div>
        <p className="font-semibold text-sm truncate">{heading}</p>
        {post.title && post.body && <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-x-3 gap-y-1.5 shrink-0 items-end sm:items-start">
        <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:underline font-medium">
          Edit
        </button>
        <button
          onClick={() => setStatus(post.status === "published" ? "draft" : "published")}
          disabled={busy !== null}
          className="text-xs text-secondary hover:underline font-medium disabled:opacity-50"
        >
          {busy === "status" ? "…" : post.status === "published" ? "Unpublish" : "Publish"}
        </button>
        <button
          onClick={remove}
          disabled={busy !== null}
          className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
        >
          {busy === "delete" ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
