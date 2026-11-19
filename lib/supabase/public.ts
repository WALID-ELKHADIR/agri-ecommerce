import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

let client: SupabaseClient | null = null;

/**
 * Client public (anon key, sans cookies) pour lire le catalogue.
 * Utilisable dans les fonctions `use cache` car il ne lit pas la requête.
 * Retourne null si les variables d'environnement sont absentes.
 */
export function getPublicClient(): SupabaseClient | null {
  if (!url || !anonKey) {
    return null;
  }

  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}
