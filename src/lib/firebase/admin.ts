import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

function getAdminApp(): App {
  const existing = getApps().find((a) => a.name === "admin");
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey || privateKey.includes("...")) {
    throw new Error(
      "Firebase Admin credentials not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local"
    );
  }

  return initializeApp(
    {
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    },
    "admin"
  );
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getAdminApp());
}

// Convenience aliases — only call these in server context with proper credentials
export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    return Reflect.get(getAdminDb(), prop);
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    return Reflect.get(getAdminAuth(), prop);
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_, prop) {
    return Reflect.get(getAdminStorage(), prop);
  },
});
