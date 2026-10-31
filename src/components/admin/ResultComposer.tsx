"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { ResultPostCard } from "@/components/results/ResultPostCard";
import { toDate } from "@/lib/utils/formatDate";
import { MAX_PHOTOS, compressPhoto, resultPhotoUrl } from "@/lib/utils/resultPhotos";
import type { ResultPost, ResultPostStatus } from "@/lib/types";

type Photo =
  | { kind: "saved"; id: string; src: string; width: number; height: number }
  | { kind: "new"; src: string; blob: Blob; width: number; height: number };

export interface TournamentOption {
  id: string;
  name: string;
}

const inputClass =
  "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-primary";

/**
 * Writes a Results post, or edits one when `post` is given. The preview
 * beside the form is the same card members see, so what's published is
 * what the admin saw. Photos are shrunk in the browser as they're picked.
 */
export function ResultComposer({
  tournaments,
  post,
  onDone,
}: {
  tournaments: TournamentOption[];
  post?: ResultPost;
  onDone?: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [tournamentId, setTournamentId] = useState(post?.tournamentId ?? "");
  const [photos, setPhotos] = useState<Photo[]>(
    () => post?.photos.map((p) => ({ kind: "saved", id: p.id, src: resultPhotoUrl(p.id), width: p.width, height: p.height })) ?? []
  );
  const [preparing, setPreparing] = useState(0);
  const [saving, setSaving] = useState<ResultPostStatus | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Free the in-memory previews when the composer goes away
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(
    () => () => photosRef.current.forEach((p) => p.kind === "new" && URL.revokeObjectURL(p.src)),
    []
  );

  const addPhotos = async (files: File[]) => {
    const room = MAX_PHOTOS - photos.length - preparing;
    if (files.length > room) showToast(`Up to ${MAX_PHOTOS} photos per post`, "error");
    const picked = files.slice(0, Math.max(room, 0));
    setPreparing((n) => n + picked.length);
    for (const file of picked) {
      try {
        const { blob, width, height } = await compressPhoto(file);
        const src = URL.createObjectURL(blob);
        setPhotos((prev) => [...prev, { kind: "new", src, blob, width, height }]);
      } catch {
        showToast(`Couldn't use "${file.name}". Try a JPG or PNG photo.`, "error");
      } finally {
        setPreparing((n) => n - 1);
      }
    }
  };

  const removePhoto = (src: string) => {
    setPhotos((prev) => prev.filter((p) => p.src !== src));
    if (src.startsWith("blob:")) URL.revokeObjectURL(src);
  };

  const reset = () => {
    photos.forEach((p) => p.kind === "new" && URL.revokeObjectURL(p.src));
    setTitle("");
    setBody("");
    setTournamentId("");
    setPhotos([]);
  };

  const save = async (status: ResultPostStatus) => {
    if (!title.trim() && !body.trim() && photos.length === 0) {
      showToast("Add some text or a photo first", "error");
      return;
    }
    setSaving(status);
    try {
      const form = new FormData();
      form.set("title", title);
      form.set("body", body);
      form.set("tournamentId", tournamentId);
      form.set("status", status);
      form.set("keep", JSON.stringify(photos.flatMap((p) => (p.kind === "saved" ? [p.id] : []))));
      const fresh = photos.filter((p) => p.kind === "new");
      fresh.forEach((p) => form.append("photos", p.blob, "photo.jpg"));
      form.set("photoSizes", JSON.stringify(fresh.map((p) => [p.width, p.height])));

      const res = await fetch(post ? `/api/admin/results/${post.id}` : "/api/admin/results", {
        method: post ? "PATCH" : "POST",
        body: form,
      });
      if (!res.ok) throw new Error();

      showToast(status === "published" ? "Posted to Results!" : "Saved as a draft", "success");
      if (post) onDone?.();
      else reset();
      router.refresh();
    } catch {
      showToast("Couldn't save the post. Please try again.", "error");
    } finally {
      setSaving(null);
    }
  };

  // A post about a tournament older than the list still shows it as chosen
  const options =
    post?.tournamentId && !tournaments.some((t) => t.id === post.tournamentId)
      ? [...tournaments, { id: post.tournamentId, name: post.tournamentName ?? "Earlier tournament" }]
      : tournaments;
  const tournament = options.find((t) => t.id === tournamentId);
  const isEmpty = !title.trim() && !body.trim() && photos.length === 0;
  const busy = saving !== null || preparing > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4 min-w-0">
        <div>
          <label className="block text-sm font-semibold mb-1">Tournament</label>
          <select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} className={inputClass}>
            <option value="">None — a general post</option>
            {options.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Title (optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className={inputClass}
            placeholder="e.g. Weekly Clash #13 — final standings"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Text</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={5000}
            className={`${inputClass} resize-y`}
            placeholder="Winners, kills, prize money, anything you want members to see…"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1">
            <label className="block text-sm font-semibold">Photos</label>
            <span className="text-xs text-muted-foreground">
              {photos.length}/{MAX_PHOTOS}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={p.src} className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(p.src)}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/70 text-white text-sm leading-none flex items-center justify-center hover:bg-black"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
            {Array.from({ length: preparing }, (_, i) => (
              <div
                key={`preparing-${i}`}
                className="w-24 h-24 rounded-xl border border-dashed border-border bg-muted animate-pulse flex items-center justify-center text-xs text-muted-foreground"
              >
                Preparing…
              </div>
            ))}
            {photos.length + preparing < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors"
              >
                <span className="text-2xl leading-none">+</span>
                Add photos
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addPhotos(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <p className="text-xs text-muted-foreground mt-1.5">Scoreboards, winner photos, screenshots. Large photos are shrunk automatically.</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {post?.status === "published" ? (
            <Button type="button" onClick={() => save("published")} loading={saving === "published"} disabled={busy}>
              Save changes
            </Button>
          ) : (
            <>
              <Button type="button" onClick={() => save("published")} loading={saving === "published"} disabled={busy}>
                Publish to Results
              </Button>
              <Button type="button" variant="outline" onClick={() => save("draft")} loading={saving === "draft"} disabled={busy}>
                {post ? "Save draft" : "Save as draft"}
              </Button>
            </>
          )}
          {post && (
            <Button type="button" variant="ghost" onClick={onDone} disabled={saving !== null}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold mb-2">Preview — how members will see it</p>
        <div className="rounded-2xl bg-[var(--m-bg)] border border-border p-3 lg:sticky lg:top-4">
          {isEmpty ? (
            <p className="text-sm text-muted-foreground text-center py-12 px-4">
              Add a title, some text or a photo to see the preview.
            </p>
          ) : (
            <ResultPostCard
              linkTournament={false}
              post={{
                title: title.trim() || null,
                body: body.trim(),
                tournamentId: tournamentId || null,
                tournamentName: tournament?.name ?? null,
                postedAt: post?.status === "published" && post.publishedAt ? toDate(post.publishedAt) : null,
                photos,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
