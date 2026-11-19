import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Client Supabase lié à la session (cookies). À utiliser uniquement dans des
 * Server Components / Server Actions — jamais dans un scope `use cache`.
 */
export async function createSupabaseServerClient() {
  // Lire les cookies en premier marque la page comme dynamique : sans cela,
  // l'erreur de configuration ci-dessous ferait échouer le pré-rendu au build.
  const cookieStore = await cookies();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase n'est pas configuré : renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local",
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Appelé depuis un Server Component en lecture seule : le proxy
          // s'occupe déjà du rafraîchissement de la session.
        }
      },
    },
  });
}
