"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { timeAgo } from "@/lib/utils/formatDate";
import { resultPhotoUrl } from "@/lib/utils/resultPhotos";
import { ResultComposer, type TournamentOption } from "./ResultComposer";
import { Badge, Card, EmptyState, RowAction } from "./ui";
import { FlagIcon } from "./icons";
import type { ResultPost, ResultPostStatus } from "@/lib/types";

/** Drafts first, then what's live, each with edit / publish / delete. */
export function ResultPostList({ posts, tournaments }: { posts: ResultPost[]; tournaments: TournamentOption[] }) {
  const ui = useUiText();

  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");

  return (
    <>
      <Group title={ui("Drafts")} note="Only admins can see these" posts={drafts} tournaments={tournaments} empty="No drafts." />
      <Group title={ui("Published")} note="Members see these on the Results page" posts={published} tournaments={tournaments} empty="Nothing published yet." />
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
  const ui = useUiText();

  return (
    <Card title={ui(`${title} (${posts.length})`)} description={note} flush>
      {ui(posts.length === 0 ? (
        <EmptyState title={ui(empty)} />
      ) : (
        <div className="divide-y divide-(--ad-line)">
          {posts.map((p) => (
            <Row key={p.id} post={p} tournaments={tournaments} />
          ))}
        </div>
      ))}
    </Card>
  );
}

function Row({ post, tournaments }: { post: ResultPost; tournaments: TournamentOption[] }) {
  const ui = useUiText();

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
      showToast(ui(status === "published" ? "Posted to Results!" : "Moved to drafts"), "success");
      router.refresh();
    } catch {
      showToast(ui("Update failed"), "error");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(ui("Delete this post and its photos? This can't be undone."))) return;
    setBusy("delete");
    try {
      const res = await fetch("/api/admin/results", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id }),
      });
      if (!res.ok) throw new Error();
      showToast(ui("Post deleted"), "success");
      router.refresh();
    } catch {
      showToast(ui("Delete failed"), "error");
    } finally {
      setBusy(null);
    }
  };

  if (editing) {
    return (
      <div className="px-5 sm:px-6 py-5">
        <ResultComposer post={post} tournaments={tournaments} onDone={() => setEditing(false)} />
      </div>
    );
  }

  const cover = post.photos[0];
  const heading = post.title || post.body.split("\n")[0] || "Photos";

  return (
    <div className="flex items-start gap-4 px-5 sm:px-6 py-4">
      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-(--ad-raised) text-(--ad-faint) flex items-center justify-center">
        {ui(cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resultPhotoUrl(cover.id)} alt="" className="w-full h-full object-cover" />
        ) : (
          <FlagIcon size={22} />
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap text-xs text-(--ad-dim)">
          {post.tournamentName && (
            <Badge tone="gold">{post.tournamentName}</Badge>
          )}
          <span>
            {ui(post.status === "published" ? `Published ${timeAgo(post.publishedAt)}` : `Saved ${timeAgo(post.updatedAt)}`)}
          </span>
          {post.photos.length > 0 && <span>· {post.photos.length}{ui("photo")}{ui(post.photos.length > 1 ? "s" : "")}</span>}
        </div>
        <p className="font-semibold text-sm text-(--ad-text) truncate">{heading}</p>
        {post.title && post.body && <p className="text-sm text-(--ad-dim) line-clamp-2">{post.body}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-x-3 gap-y-0.5 shrink-0 items-end sm:items-start">
        <RowAction tone="accent" onClick={() => setEditing(true)}>{ui("Edit")}</RowAction>
        <RowAction
          tone={post.status === "published" ? "neutral" : "success"}
          onClick={() => setStatus(post.status === "published" ? "draft" : "published")}
          disabled={busy !== null}
        >
          {ui(busy === "status" ? "…" : post.status === "published" ? "Unpublish" : "Publish")}
        </RowAction>
        <RowAction tone="danger" onClick={remove} disabled={busy !== null}>
          {ui(busy === "delete" ? "…" : "Delete")}
        </RowAction>
      </div>
    </div>
  );
}
