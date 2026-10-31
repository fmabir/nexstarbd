import { FieldValue, type Firestore, type WriteBatch } from "firebase-admin/firestore";
import { MAX_PHOTO_BYTES } from "@/lib/utils/resultPhotos";
import type { ResultPhoto } from "@/lib/types";

// Never SVG: it can carry script, and these are served from our own origin
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Thrown for a malformed post; the routes answer it with a 400. */
export class BadRequest extends Error {}

/**
 * A text field from the post form: trimmed, with "" meaning null.
 * undefined when the form doesn't carry the field at all (left unchanged).
 */
export function textField(form: FormData, name: string): string | null | undefined {
  const v = form.get(name);
  if (v === null) return undefined;
  if (typeof v !== "string") throw new BadRequest(name);
  return v.trim() || null;
}

function jsonField(form: FormData, name: string): unknown {
  const v = form.get(name);
  if (v === null) return undefined;
  try {
    return JSON.parse(String(v));
  } catch {
    throw new BadRequest(name);
  }
}

/** Ids of the post's existing photos to keep, in order; undefined leaves photos as they are. */
export function keepField(form: FormData): string[] | undefined {
  const keep = jsonField(form, "keep");
  if (keep === undefined) return undefined;
  if (!Array.isArray(keep) || !keep.every((id) => typeof id === "string")) throw new BadRequest("keep");
  return keep;
}

export interface NewPhoto {
  data: Buffer;
  contentType: string;
  width: number;
  height: number;
}

/** The photos uploaded with the form, checked. Their sizes come alongside in `photoSizes`. */
export async function newPhotos(form: FormData): Promise<NewPhoto[]> {
  const files = form.getAll("photos");
  const sizes = jsonField(form, "photoSizes") ?? [];
  if (!Array.isArray(sizes) || sizes.length !== files.length) throw new BadRequest("photoSizes");

  return Promise.all(
    files.map(async (file, i) => {
      if (!(file instanceof File) || !PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_BYTES) {
        throw new BadRequest("photo");
      }
      const [width, height] = Array.isArray(sizes[i]) ? sizes[i] : [];
      if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
        throw new BadRequest("photoSizes");
      }
      return { data: Buffer.from(await file.arrayBuffer()), contentType: file.type, width, height };
    })
  );
}

/** Queues one `resultPhotos` document per photo and returns the references the post keeps. */
export function addPhotos(db: Firestore, batch: WriteBatch, postId: string, photos: NewPhoto[]): ResultPhoto[] {
  return photos.map(({ data, contentType, width, height }) => {
    const ref = db.collection("resultPhotos").doc();
    batch.set(ref, { postId, data, contentType, width, height, createdAt: FieldValue.serverTimestamp() });
    return { id: ref.id, width, height };
  });
}

/** The tournament's name, stored on the post so the feed needs no second read. */
export async function tournamentName(db: Firestore, tournamentId: string | null): Promise<string | null> {
  if (!tournamentId) return null;
  const snap = await db.collection("tournaments").doc(tournamentId).get();
  if (!snap.exists) throw new BadRequest("tournamentId");
  return (snap.get("name") as string) ?? null;
}

export function errorResponse(err: unknown): Response {
  if (err instanceof BadRequest) return Response.json({ error: "Invalid post" }, { status: 400 });
  const msg = err instanceof Error ? err.message : "error";
  if (msg === "Unauthorized") return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (msg === "Forbidden") return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ error: "Server error" }, { status: 500 });
}
