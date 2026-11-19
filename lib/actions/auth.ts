"use server";

import { redirect } from "next/navigation";
import { FORBIDDEN_ERROR } from "@/lib/admin-access";
import { isAdminSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextParam = String(formData.get("next") ?? "").trim();
  const next = nextParam.startsWith("/admin") ? nextParam : "/admin";

  if (!email || !password) {
    redirect(`/admin/login?error=missing&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=invalid&next=${encodeURIComponent(next)}`);
  }

  if (!(await isAdminSession(supabase))) {
    await supabase.auth.signOut();
    redirect(`/admin/login?error=${FORBIDDEN_ERROR}`);
  }

  redirect(next);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
