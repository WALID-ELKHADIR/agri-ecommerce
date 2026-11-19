/**
 * Décision d'accès à l'administration, partagée par `proxy.ts` et
 * `requireAdmin()`. Module pur (sans Next ni Supabase) pour être testé seul.
 */

export type AdminAccessState = {
  hasUser: boolean;
  isAdmin: boolean;
  isLoginPage: boolean;
};

export type AdminAccessDecision =
  | "allow"
  | "redirect-login"
  | "signout-forbidden"
  | "redirect-admin";

/** Paramètre ajouté à `/admin/login` quand un compte non-admin est refusé. */
export const FORBIDDEN_ERROR = "forbidden";

export function resolveAdminAccess(state: AdminAccessState): AdminAccessDecision {
  if (!state.hasUser) {
    return state.isLoginPage ? "allow" : "redirect-login";
  }
  if (!state.isAdmin) {
    return "signout-forbidden";
  }
  return state.isLoginPage ? "redirect-admin" : "allow";
}
