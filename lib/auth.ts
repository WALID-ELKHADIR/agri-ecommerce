import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { FORBIDDEN_ERROR } from "@/lib/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Vrai si l'utilisateur de la session figure dans `admin_users` (fonction SQL `is_admin()`). */
export async function isAdminSession(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Garde d'accès pour toutes les pages et actions d'administration.
 * Exige une session ET le rôle administrateur : un compte connecté non-admin
 * est déconnecté puis renvoyé vers la connexion avec un message.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  if (!(await isAdminSession(supabase))) {
    await supabase.auth.signOut();
    redirect(`/admin/login?error=${FORBIDDEN_ERROR}`);
  }

  return data.user;
}
