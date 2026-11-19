import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import {
  adminRoleFromRpc,
  FORBIDDEN_ERROR,
  UNAVAILABLE_ERROR,
  type AdminRole,
} from "@/lib/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Rôle de l'utilisateur de la session, d'après la fonction SQL `is_admin()`. */
export async function getAdminRole(supabase: SupabaseClient): Promise<AdminRole> {
  return adminRoleFromRpc(await supabase.rpc("is_admin"));
}

/**
 * Applique la règle d'accès après une connexion ou dans une garde :
 * - non-admin : déconnecté, renvoyé vers la connexion avec un message ;
 * - rôle invérifiable : renvoyé vers la connexion SANS déconnexion.
 */
export async function enforceAdminRole(supabase: SupabaseClient): Promise<void> {
  const role = await getAdminRole(supabase);

  if (role === "not-admin") {
    await supabase.auth.signOut();
    redirect(`/admin/login?error=${FORBIDDEN_ERROR}`);
  }
  if (role === "unknown") {
    redirect(`/admin/login?error=${UNAVAILABLE_ERROR}`);
  }
}

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Garde d'accès pour toutes les pages et actions d'administration.
 * Exige une session ET le rôle administrateur.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  await enforceAdminRole(supabase);
  return data.user;
}
