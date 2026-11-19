/**
 * Décision d'accès à l'administration, partagée par `proxy.ts`,
 * `requireAdmin()` et la connexion. Module pur (sans Next ni Supabase).
 */

/**
 * Résultat de la fonction SQL `is_admin()`.
 * `unknown` : l'appel a échoué (migration non appliquée, panne réseau…).
 * On refuse alors l'accès, mais sans déconnecter ni accuser le compte.
 */
export type AdminRole = "admin" | "not-admin" | "unknown";

export type AdminAccessState = {
  hasUser: boolean;
  role: AdminRole;
  isLoginPage: boolean;
};

export type AdminAccessDecision =
  | "allow"
  | "redirect-login"
  | "signout-forbidden"
  | "redirect-unavailable"
  | "redirect-admin";

/** Paramètres `error` de `/admin/login`. */
export const FORBIDDEN_ERROR = "forbidden";
export const UNAVAILABLE_ERROR = "unavailable";

export function resolveAdminAccess(state: AdminAccessState): AdminAccessDecision {
  if (!state.hasUser) {
    return state.isLoginPage ? "allow" : "redirect-login";
  }
  switch (state.role) {
    case "not-admin":
      return "signout-forbidden";
    case "unknown":
      return state.isLoginPage ? "allow" : "redirect-unavailable";
    case "admin":
      return state.isLoginPage ? "redirect-admin" : "allow";
  }
}

/** Convertit la réponse de `rpc("is_admin")` en rôle. */
export function adminRoleFromRpc(result: { data: unknown; error: unknown }): AdminRole {
  if (result.error) return "unknown";
  return result.data === true ? "admin" : "not-admin";
}
