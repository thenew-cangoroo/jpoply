import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { requiredEnv } from "./environment";

function firebaseApp() {
  return getApps().find(app => app.name === "jeiply") ?? initializeApp({
    credential: cert({
      projectId: requiredEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requiredEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: requiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  }, "jeiply");
}

export const firebaseDb = () => getFirestore(firebaseApp());
export const firebaseAuth = () => getAuth(firebaseApp());
