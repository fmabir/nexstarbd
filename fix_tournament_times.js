/**
 * One-time migration: corrects existing tournament timestamps that are 16 hours ahead.
 * Run this ONCE from your terminal, then delete this file.
 *
 *   node fix_tournament_times.js
 */

const admin = require("firebase-admin");
const serviceAccount = require("./src/lib/firebase/serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const OFFSET_MS = 16 * 60 * 60 * 1000; // 16 hours in milliseconds

function toMs(ts) {
  if (!ts) return null;
  return (ts._seconds ?? ts.seconds ?? 0) * 1000;
}

function fmtBD(ms) {
  return new Date(ms).toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function run() {
  const snap = await db.collection("tournaments").get();
  console.log(`\nFixing ${snap.docs.length} tournament(s)...\n`);

  for (const doc of snap.docs) {
    const d = doc.data();
    const startMs = toMs(d.startsAt);
    const deadMs  = toMs(d.registrationDeadline);
    if (!startMs) continue;

    const newStartMs = startMs - OFFSET_MS;
    const newDeadMs  = deadMs ? deadMs - OFFSET_MS : null;

    const update = {
      startsAt: admin.firestore.Timestamp.fromMillis(newStartMs),
    };
    if (newDeadMs) {
      update.registrationDeadline = admin.firestore.Timestamp.fromMillis(newDeadMs);
    }

    await doc.ref.update(update);

    console.log(`✅ ${d.name}`);
    console.log(`   starts:   ${fmtBD(startMs)}  →  ${fmtBD(newStartMs)}`);
    if (deadMs) {
      console.log(`   deadline: ${fmtBD(deadMs)}  →  ${fmtBD(newDeadMs)}`);
    }
    console.log();
  }

  console.log("Done. Delete fix_tournament_times.js now.");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
