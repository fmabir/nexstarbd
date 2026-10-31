/**
 * Photos on Results posts.
 *
 * They are stored as bytes in Firestore (one document each, in
 * `resultPhotos`) rather than in Cloud Storage, so posting works on any
 * Firebase plan. That caps a photo at Firestore's 1 MiB document size, and a
 * whole post must fit in one Vercel request (4.5 MB) — so the browser shrinks
 * every photo before it is sent.
 */
export const MAX_PHOTOS = 6;
/** 6 × 700 KB stays under Vercel's 4.5 MB request limit */
export const MAX_PHOTO_BYTES = 700_000;
const MAX_SIDE = 1600;

export function resultPhotoUrl(id: string): string {
  return `/api/results/photos/${id}`;
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Resizes a picked photo to at most 1600px on its long side and re-encodes it
 * as JPEG, stepping quality (then size) down until it fits MAX_PHOTO_BYTES.
 * Browser only. Throws "unreadable" for files the browser can't decode.
 */
export async function compressPhoto(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    // Applies the camera's EXIF rotation, so phone photos come out upright
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("unreadable");
  }

  try {
    let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 5; attempt++) {
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      // JPEG has no transparency: put see-through PNGs on white, not black
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);

      for (const quality of [0.85, 0.75, 0.65]) {
        const blob = await toJpeg(canvas, quality);
        if (blob && blob.size <= MAX_PHOTO_BYTES) return { blob, width, height };
      }
      scale *= 0.75;
    }
    throw new Error("too-large");
  } finally {
    bitmap.close();
  }
}
