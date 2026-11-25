import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requiredEnv, storageMode } from "./environment";
import { firebaseAuth } from "./firebase";

const sessionName = "jeiply_admin";
const sessionMilliseconds = 24 * 60 * 60 * 1000;
const localState = globalThis as typeof globalThis & { jplyAuthSecret?: string };

function localSecret() {
  return process.env.JPLY_LOCAL_SESSION_SECRET || (localState.jplyAuthSecret ??= randomBytes(32).toString("hex"));
}

export function localLoginDetails() {
  return {
    email: process.env.JPLY_LOCAL_ADMIN_EMAIL || "manager@jply.local",
    password: process.env.JPLY_LOCAL_ADMIN_PASSWORD || "jply-demo-local",
  };
}

function equal(first: string, second: string): boolean {
  const hash = (text: string) => createHash("sha256").update(text).digest();
  return timingSafeEqual(hash(first), hash(second));
}

function signature(expiry: string): string {
  return createHmac("sha256", localSecret()).update(expiry).digest("base64url");
}

export async function signIn(email: string, password: string): Promise<boolean> {
  const mode = storageMode();
  let session: string;
  if (mode === "local") {
    const account = localLoginDetails();
    if (!equal(email, account.email) || !equal(password, account.password)) return false;
    const expiry = String(Date.now() + sessionMilliseconds);
    session = expiry + "." + signature(expiry);
  } else {
    const apiKey = requiredEnv("FIREBASE_WEB_API_KEY");
    const response = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + encodeURIComponent(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return false;
    const result = await response.json() as { idToken: string };
    const auth = firebaseAuth();
    const token = await auth.verifyIdToken(result.idToken, true);
    if (token.uid !== requiredEnv("JPLY_ADMIN_UID")) return false;
    session = await auth.createSessionCookie(result.idToken, { expiresIn: sessionMilliseconds });
  }

  (await cookies()).set(sessionName, session, {
    maxAge: sessionMilliseconds / 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: mode === "firestore" && process.env.NODE_ENV === "production",
    path: "/",
  });
  return true;
}

export async function isAdmin(): Promise<boolean> {
  const session = (await cookies()).get(sessionName)?.value;
  if (!session) return false;
  if (storageMode() === "local") {
    const parts = session.split(".");
    const [expiry, signed] = parts;
    return parts.length === 2 && /^\d+$/.test(expiry) && Number(expiry) > Date.now() && equal(signature(expiry), signed);
  }
  try {
    const decoded = await firebaseAuth().verifySessionCookie(session, true);
    return decoded.uid === requiredEnv("JPLY_ADMIN_UID");
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!await isAdmin()) redirect("/admin/login");
}

export async function signOut() {
  (await cookies()).delete(sessionName);
}
