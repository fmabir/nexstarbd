import { type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdmin } from "@/lib/server/verifyAdmin";
import { MAX_PHOTOS } from "@/lib/utils/resultPhotos";
import {
  BadRequest,
  addPhotos,
  errorResponse,
  keepField,
  newPhotos,
  textField,
  tournamentName,
} from "@/lib/server/resultPosts";
import type { ResultPhoto } from "@/lib/types";

/**
 * Edits a post. Multipart form data; any field left out stays as it is, so
 * publishing or unpublishing sends just `status`. `keep` lists the existing
 * photos to keep: the rest are deleted and new `photos` go after them.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdmin();
    const { id } = await params;
    const form = await request.formData();

    const { adminDb } = await import("@/lib/firebase/admin");
    const postRef = adminDb.collection("resultPosts").doc(id);
    const snap = await postRef.get();
    if (!snap.exists) return Response.json({ error: "Not found" }, { status: 404 });
    const post = snap.data()!;

    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    const batch = adminDb.batch();

    const title = textField(form, "title");
    if (title !== undefined) updates.title = title;
    const body = textField(form, "body");
    if (body !== undefined) updates.body = body ?? "";

    const tournamentId = textField(form, "tournamentId");
    if (tournamentId !== undefined) {
      updates.tournamentId = tournamentId;
      updates.tournamentName = await tournamentName(adminDb, tournamentId);
    }

    const status = form.get("status");
    if (status === "published" || status === "draft") {
      updates.status = status;
      // Publishing stamps the time it went out, so it lands at the top of the feed
      if (status === "published" && post.status !== "published") {
        updates.publishedAt = FieldValue.serverTimestamp();
      }
    }

    const keep = keepField(form);
    const added = await newPhotos(form);
    if (keep !== undefined || added.length > 0) {
      const current = (post.photos ?? []) as ResultPhoto[];
      const kept = keep === undefined ? current : current.filter((p) => keep.includes(p.id));
      for (const p of current) {
        if (!kept.includes(p)) batch.delete(adminDb.collection("resultPhotos").doc(p.id));
      }
      const photos = [...kept, ...addPhotos(adminDb, batch, id, added)];
      if (photos.length > MAX_PHOTOS) throw new BadRequest("photos");
      updates.photos = photos;
    }

    const next = { ...post, ...updates };
    if (!next.title && !next.body && (next.photos ?? []).length === 0) throw new BadRequest("empty");

    batch.update(postRef, updates);
    await batch.commit();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
