/**
 * One-time migration to correct tournament timestamps.
 *
 * Step 1 — preview what's stored (no changes):
 *   node fix_tournament_times.js --dry-run
 *
 * Step 2 — once you confirm the offset, apply the fix:
 *   node fix_tournament_times.js --offset 16
 *
 * Change 16 to whatever number of hours the displayed time is ahead.
 */

const admin = require("firebase-admin");
const serviceAccount = require("./src/lib/firebase/serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const offsetArg = args.find(a => a.startsWith("--offset=") || a === "--offset");
const OFFSET_HOURS = offsetArg
  ? Number(args[args.indexOf("--offset") + 1] ?? offsetArg.split("=")[1])
  : null;

function toMs(ts) {
  if (!ts) return null;
  return ((ts._seconds ?? ts.seconds ?? 0) * 1000);
}

function fmt(ms, tz) {
  return new Date(ms).toLocaleString("en-BD", {
    timeZone: tz,
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

async function run() {
  const snap = await db.collection("tournaments").get();
  console.log(`\nFound ${snap.docs.length} tournament(s).\n`);

  for (const doc of snap.docs) {
    const d = doc.data();
    const startMs = toMs(d.startsAt);
    const deadMs  = toMs(d.registrationDeadline);
    if (!startMs) continue;

    console.log(`📋 ${d.name}`);
    console.log(`   startsAt stored as:`);
    console.log(`     UTC    : ${fmt(startMs, "UTC")}`);
    console.log(`     BD time: ${fmt(startMs, "Asia/Dhaka")}`);
    if (deadMs) {
      console.log(`   registrationDeadline stored as:`);
      console.log(`     UTC    : ${fmt(deadMs, "UTC")}`);
      console.log(`     BD time: ${fmt(deadMs, "Asia/Dhaka")}`);
    }

    if (OFFSET_HOURS !== null && !DRY_RUN) {
      const offsetMs = OFFSET_HOURS * 60 * 60 * 1000;
      const update = {
        startsAt: admin.firestore.Timestamp.fromMillis(startMs - offsetMs),
      };
      if (deadMs) {
        update.registrationDeadline = admin.firestore.Timestamp.fromMillis(deadMs - offsetMs);
      }
      await doc.ref.update(update);
      const newStartMs = startMs - offsetMs;
      console.log(`   ✅ fixed → BD time now: ${fmt(newStartMs, "Asia/Dhaka")}`);
    } else if (OFFSET_HOURS !== null) {
      const offsetMs = OFFSET_HOURS * 60 * 60 * 1000;
      console.log(`   [DRY RUN] would become → BD time: ${fmt(startMs - offsetMs, "Asia/Dhaka")}`);
    }

    console.log();
  }

  if (!OFFSET_HOURS && !DRY_RUN) {
    console.log("ℹ️  This was a preview only. To apply a fix run:");
    console.log("   node fix_tournament_times.js --offset 16\n");
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
