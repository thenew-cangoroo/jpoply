"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

export function LoginForm({ demo }: { demo: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form className="login-form panel" action={action}>
      <label className="field">이메일<input type="email" name="email" autoComplete="username" required /></label>
      <label className="field">비밀번호<input type="password" name="password" autoComplete="current-password" required /></label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <button type="submit" className="button" disabled={pending}>{pending ? "로그인 중" : "로그인"}</button>
      {demo && <p className="muted small">로컬 예시 계정 <strong>manager@jply.local</strong> · <strong>jply-demo-local</strong></p>}
    </form>
  );
}
