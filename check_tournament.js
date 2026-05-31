const admin = require('firebase-admin');
const serviceAccount = require('./src/lib/firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nexstarbd.firebaseio.com"
});

const db = admin.firestore();

async function checkTournaments() {
  try {
    const snap = await db.collection('tournaments').where('status', 'in', ['upcoming', 'ongoing']).get();
    console.log(`Found ${snap.docs.length} active tournaments:`);
    snap.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name} (status: ${data.status}, registration: ${data.isRegistrationOpen})`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTournaments().then(() => process.exit(0));
