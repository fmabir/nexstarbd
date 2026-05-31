/**
 * One-time migration: subtract 6 hours from all tournament timestamps.
 *
 * Run dry-run first to preview:
 *   node fix_tournament_times.js --dry-run
 *
 * Then apply for real:
 *   node fix_tournament_times.js
 */

const admin = require("firebase-admin");
const serviceAccount = require("./src/lib/firebase/serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();
const DRY_RUN = process.argv.includes("--dry-run");
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function toMs(ts) {
  if (!ts) return null;
  const secs = ts._seconds ?? ts.seconds ?? 0;
  return secs * 1000;
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
  console.log(`\nFound ${snap.docs.length} tournament(s). DRY_RUN=${DRY_RUN}\n`);

  let fixed = 0;

  for (const doc of snap.docs) {
    const d = doc.data();
    const startMs  = toMs(d.startsAt);
    const deadMs   = toMs(d.registrationDeadline);

    if (!startMs) continue;

    const newStartMs = startMs  - SIX_HOURS_MS;
    const newDeadMs  = deadMs ? deadMs - SIX_HOURS_MS : null;

    console.log(`📋 ${d.name}`);
    console.log(`   startsAt            : ${fmtBD(startMs)}  →  ${fmtBD(newStartMs)}`);
    if (deadMs) {
      console.log(`   registrationDeadline: ${fmtBD(deadMs)}  →  ${fmtBD(newDeadMs)}`);
    }

    if (!DRY_RUN) {
      const update = {
        startsAt: admin.firestore.Timestamp.fromMillis(newStartMs),
      };
      if (newDeadMs) {
        update.registrationDeadline = admin.firestore.Timestamp.fromMillis(newDeadMs);
      }
      await doc.ref.update(update);
      console.log(`   ✅ updated`);
    }

    fixed++;
  }

  console.log(`\n${DRY_RUN ? "[DRY RUN] Would fix" : "Fixed"} ${fixed} tournament(s).`);
  if (DRY_RUN) {
    console.log('Run without --dry-run to apply.\n');
  }
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
