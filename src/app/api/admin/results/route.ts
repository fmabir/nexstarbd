import { type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdmin } from "@/lib/server/verifyAdmin";
import { MAX_PHOTOS } from "@/lib/utils/resultPhotos";
import {
  BadRequest,
  addPhotos,
  errorResponse,
  newPhotos,
  textField,
  tournamentName,
} from "@/lib/server/resultPosts";

/** Creates a Results post from multipart form data: text fields plus photos. */
export async function POST(request: NextRequest) {
  try {
    const email = await verifyAdmin();
    const form = await request.formData();
    const title = textField(form, "title") ?? null;
    const body = textField(form, "body") ?? "";
    const tournamentId = textField(form, "tournamentId") ?? null;
    const status = form.get("status") === "published" ? "published" : "draft";
    const photos = await newPhotos(form);

    if (!title && !body && photos.length === 0) throw new BadRequest("empty");
    if (photos.length > MAX_PHOTOS) throw new BadRequest("photos");

    const { adminDb } = await import("@/lib/firebase/admin");
    const postRef = adminDb.collection("resultPosts").doc();
    const batch = adminDb.batch();
    batch.set(postRef, {
      title,
      body,
      tournamentId,
      tournamentName: await tournamentName(adminDb, tournamentId),
      photos: addPhotos(adminDb, batch, postRef.id, photos),
      status,
      postedByEmail: email,
      publishedAt: status === "published" ? FieldValue.serverTimestamp() : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return Response.json({ ok: true, id: postRef.id });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Deletes a post and its photos. */
export async function DELETE(request: NextRequest) {
  try {
    await verifyAdmin();
    const { id } = await request.json();
    if (typeof id !== "string" || !id) throw new BadRequest("id");

    const { adminDb } = await import("@/lib/firebase/admin");
    const postRef = adminDb.collection("resultPosts").doc(id);
    const snap = await postRef.get();
    if (!snap.exists) return Response.json({ ok: true });

    const batch = adminDb.batch();
    for (const { id: photoId } of (snap.get("photos") ?? []) as { id: string }[]) {
      batch.delete(adminDb.collection("resultPhotos").doc(photoId));
    }
    batch.delete(postRef);
    await batch.commit();

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
