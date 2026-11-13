import { FieldValue, type DocumentData, type Firestore } from "firebase-admin/firestore";

/*
 * Data the public must not see, kept out of the publicly readable documents.
 *
 * `tournaments` and `registrations` are open to the browser (firestore.rules:
 * read if true) because the site lists them live. So the secrets live in two
 * collections nothing in the rules opens:
 *   tournamentRooms/{tournamentId}  — roomId, roomPassword
 *   registrationPrivate/{regId}     — whatsapp, bkash, transactionId
 * The server adds them back only for the people allowed to see them: admins,
 * a squad's own player, and (for the room) approved squads.
 */
const ROOMS = "tournamentRooms";
const REG_PRIVATE = "registrationPrivate";

export interface RoomInfo {
  roomId: string | null;
  roomPassword: string | null;
}

export interface PrivateRegistrationFields {
  whatsapp: string;
  bkash: string | null;
  transactionId: string | null;
}

/**
 * A tournament's room details. Falls back to the tournament document itself
 * for tournaments not yet moved by migratePrivateData.
 */
export async function getRoomInfo(db: Firestore, tournamentId: string, tournament?: DocumentData): Promise<RoomInfo> {
  const snap = await db.collection(ROOMS).doc(tournamentId).get();
  if (snap.exists) {
    return { roomId: snap.get("roomId") ?? null, roomPassword: snap.get("roomPassword") ?? null };
  }
  return { roomId: tournament?.roomId ?? null, roomPassword: tournament?.roomPassword ?? null };
}

/** Saves room details privately and makes sure none are left on the public tournament. */
export async function setRoomInfo(db: Firestore, tournamentId: string, room: Partial<RoomInfo>) {
  const batch = db.batch();
  batch.set(db.collection(ROOMS).doc(tournamentId), { ...room, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  batch.update(db.collection("tournaments").doc(tournamentId), { roomId: null, roomPassword: null });
  await batch.commit();
}

export async function deleteRoomInfo(db: Firestore, tournamentId: string) {
  await db.collection(ROOMS).doc(tournamentId).delete();
}

/** A tournament object with no room details on it, whatever the stored document holds. */
export function withoutRoom<T extends object>(tournament: T): T {
  return { ...tournament, roomId: null, roomPassword: null };
}

/** The private-collection reference for a registration, for writing alongside it. */
export function registrationPrivateRef(db: Firestore, registrationId: string) {
  return db.collection(REG_PRIVATE).doc(registrationId);
}

/**
 * Adds each registration's WhatsApp, bKash number and transaction ID. Only
 * for admin views and a squad's own player. Registrations not yet migrated
 * still carry the fields themselves and pass through unchanged.
 */
export async function withPrivateFields<T extends { id: string }>(db: Firestore, registrations: T[]): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < registrations.length; i += 300) {
    const chunk = registrations.slice(i, i + 300);
    if (chunk.length === 0) continue;
    const snaps = await db.getAll(...chunk.map((r) => db.collection(REG_PRIVATE).doc(r.id)));
    chunk.forEach((r, j) => {
      const p = snaps[j];
      out.push(
        p.exists
          ? { ...r, whatsapp: p.get("whatsapp") ?? null, bkash: p.get("bkash") ?? null, transactionId: p.get("transactionId") ?? null }
          : r
      );
    });
  }
  return out;
}

/**
 * Moves room details and squads' private details out of the public
 * documents. Safe to run any number of times; once everything has moved it
 * costs two empty queries. Runs when an admin opens the dashboard.
 */
export async function migratePrivateData(db: Firestore): Promise<{ rooms: number; registrations: number }> {
  let rooms = 0;
  let registrations = 0;

  const withRooms = (await db.collection("tournaments").where("roomId", "!=", null).get()).docs;
  const withPasswords = (await db.collection("tournaments").where("roomPassword", "!=", null).get()).docs;
  const tournaments = new Map([...withRooms, ...withPasswords].map((d) => [d.id, d]));
  for (const doc of tournaments.values()) {
    await setRoomInfo(db, doc.id, { roomId: doc.get("roomId") ?? null, roomPassword: doc.get("roomPassword") ?? null });
    rooms++;
  }

  // whatsapp is required at registration, so every unmoved registration has it
  const regs = (await db.collection("registrations").where("whatsapp", "!=", null).get()).docs;
  for (let i = 0; i < regs.length; i += 200) {
    const batch = db.batch();
    for (const doc of regs.slice(i, i + 200)) {
      batch.set(
        db.collection(REG_PRIVATE).doc(doc.id),
        {
          whatsapp: doc.get("whatsapp") ?? null,
          bkash: doc.get("bkash") ?? null,
          transactionId: doc.get("transactionId") ?? null,
          tournamentId: doc.get("tournamentId") ?? null,
          userId: doc.get("userId") ?? null,
        },
        { merge: true }
      );
      batch.update(doc.ref, {
        whatsapp: FieldValue.delete(),
        bkash: FieldValue.delete(),
        transactionId: FieldValue.delete(),
      });
      registrations++;
    }
    await batch.commit();
  }

  return { rooms, registrations };
}
