"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, signIn, signOut } from "@/lib/auth";
import { saveSchema } from "@/lib/model";
import { ContentError, saveEntry } from "@/lib/store";

export type LoginState = { error?: string };
export type SaveResult = { ok: true; id: string; revision: number } | { ok: false; error: string };

export async function loginAction(_: LoginState, form: FormData): Promise<LoginState> {
  const email = form.get("email");
  const password = form.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password || email.length > 320 || password.length > 4096) {
    return { error: "이메일과 비밀번호를 확인해줘." };
  }

  try {
    if (!await signIn(email.trim(), password)) return { error: "등록된 운영자 계정으로 로그인해줘." };
  } catch {
    return { error: "로그인에 연결하지 못했어. 설정을 확인해줘." };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

export async function saveContentAction(payload: unknown): Promise<SaveResult> {
  if (!await isAdmin()) return { ok: false, error: "운영자 로그인 후 저장해줘." };

  const parsed = saveSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해줘." };
  if (parsed.data.id === "new") return { ok: false, error: "주소에 new 이외의 이름을 사용해줘." };

  try {
    const record = await saveEntry(parsed.data);
    revalidatePath("/", "layout");
    return { ok: true, id: record.id, revision: record.revision };
  } catch (error) {
    if (error instanceof ContentError) return { ok: false, error: error.message };
    console.error("제이플리 콘텐츠 저장 오류", error instanceof Error ? error.name : "UnknownError");
    return { ok: false, error: "저장하지 못했어. 데이터 연결을 확인하고 다시 시도해줘." };
  }
}
