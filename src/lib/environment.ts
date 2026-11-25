import "server-only";

export function storageMode(): "local" | "firestore" {
  const mode = process.env.JPLY_STORAGE || (process.env.NODE_ENV === "development" ? "local" : "");
  if (mode === "firestore") return mode;
  if (mode === "local" && !process.env.VERCEL) return mode;
  throw new Error("JPLY_STORAGE를 설정해. Vercel에서는 firestore를 사용해.");
}

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(name + " 환경 변수를 설정해.");
  return value;
}
