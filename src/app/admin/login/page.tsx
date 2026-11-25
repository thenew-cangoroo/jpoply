import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isAdmin } from "@/lib/auth";
import { storageMode } from "@/lib/environment";

export const metadata: Metadata = { title: "운영자 로그인", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  const demo = storageMode() === "local" && !process.env.JPLY_LOCAL_ADMIN_EMAIL && !process.env.JPLY_LOCAL_ADMIN_PASSWORD;
  return (
    <section className="login-page">
      <h1 className="page-title">운영자 로그인</h1>
      <LoginForm demo={demo} />
    </section>
  );
}
