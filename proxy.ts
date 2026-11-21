import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  adminRoleFromRpc,
  FORBIDDEN_ERROR,
  resolveAdminAccess,
  UNAVAILABLE_ERROR,
  type AdminRole,
} from "@/lib/admin-access";
import { LOCALE_COOKIE } from "@/lib/i18n/cookie";
import { localeRoute } from "@/lib/i18n/routing";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * 1. Langue : les adresses visibles n'ont pas de préfixe. La page est servie en
 *    interne depuis /fr/... ou /ar/... selon le cookie « saqia-lang » ; un lien
 *    préfixé (/ar/produits) redirige vers /produits et retient la langue.
 * 2. Admin : accès réservé aux administrateurs (session Supabase + is_admin()).
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const route = localeRoute(pathname, request.cookies.get(LOCALE_COOKIE)?.value ?? null);

  if (route.type === "redirect") {
    const redirect = NextResponse.redirect(new URL(route.path + search, request.url));
    redirect.cookies.set(LOCALE_COOKIE, route.locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
    return redirect;
  }

  const target = new URL(route.path + search, request.url);
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return guardAdmin(request, target);
  return NextResponse.rewrite(target);
}

async function guardAdmin(request: NextRequest, target: URL) {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!url || !anonKey) {
    return isLoginPage
      ? NextResponse.rewrite(target)
      : NextResponse.redirect(new URL("/admin/login?error=config", request.url));
  }

  let response = NextResponse.rewrite(target, { request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.rewrite(target, { request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role: AdminRole = user ? adminRoleFromRpc(await supabase.rpc("is_admin")) : "unknown";

  /** Redirection qui conserve les cookies de session mis à jour par Supabase. */
  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  switch (resolveAdminAccess({ hasUser: Boolean(user), role, isLoginPage })) {
    case "redirect-login": {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return redirectTo(loginUrl);
    }
    case "signout-forbidden": {
      await supabase.auth.signOut();
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", FORBIDDEN_ERROR);
      return redirectTo(loginUrl);
    }
    case "redirect-unavailable": {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", UNAVAILABLE_ERROR);
      return redirectTo(loginUrl);
    }
    case "redirect-admin":
      return redirectTo(new URL("/admin", request.url));
    case "allow":
      return response;
  }
}

export const config = {
  // Tout sauf les fichiers internes de Next et les fichiers statiques (avec extension :
  // images, sw.js, sitemap.xml, robots.txt, manifest.webmanifest, icônes...).
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
