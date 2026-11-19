import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { FORBIDDEN_ERROR, resolveAdminAccess } from "@/lib/admin-access";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!url || !anonKey) {
    return isLoginPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin/login?error=config", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.rpc("is_admin");
    isAdmin = data === true;
  }

  /** Redirection qui conserve les cookies de session mis à jour par Supabase. */
  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  switch (resolveAdminAccess({ hasUser: Boolean(user), isAdmin, isLoginPage })) {
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
    case "redirect-admin":
      return redirectTo(new URL("/admin", request.url));
    case "allow":
      return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
