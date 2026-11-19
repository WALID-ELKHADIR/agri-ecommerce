// Vérifie les droits (RLS) sur le VRAI projet Supabase, après application
// des migrations. Usage : node scripts/check-rls.ts
//
// Variables lues dans .env.local :
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
//   RLS_ADMIN_EMAIL / RLS_ADMIN_PASSWORD : un compte présent dans admin_users
//   RLS_USER_EMAIL / RLS_USER_PASSWORD   : un compte connecté NON admin
//
// Le script n'altère aucune donnée durable : les demandes de test
// (source = "rls-check") sont supprimées à la fin avec le compte admin.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "RLS_ADMIN_EMAIL",
  "RLS_ADMIN_PASSWORD",
  "RLS_USER_EMAIL",
  "RLS_USER_PASSWORD",
] as const;

try {
  process.loadEnvFile(".env.local");
} catch {
  // Pas de .env.local : les variables peuvent venir de l'environnement.
}

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Renseignez ces variables dans .env.local : ${missing.join(", ")}`);
  process.exit(1);
}

const env = Object.fromEntries(REQUIRED.map((key) => [key, process.env[key] ?? ""])) as Record<
  (typeof REQUIRED)[number],
  string
>;

let failures = 0;
function check(label: string, ok: boolean, detail = ""): void {
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

function client(): SupabaseClient {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signedIn(email: string, password: string): Promise<SupabaseClient> {
  const supabase = client();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Connexion impossible pour ${email} : ${error.message}`);
  return supabase;
}

async function isAdmin(supabase: SupabaseClient): Promise<boolean | null> {
  const { data, error } = await supabase.rpc("is_admin");
  return error ? null : data === true;
}

// Numéro unique pour ne pas être gêné par d'anciennes exécutions.
const testPhone = `+2126${String(Date.now()).slice(-8)}`;
const quote = { name: "Test RLS", phone: testPhone, source: "rls-check" };

// --- Visiteur anonyme
const anon = client();
const categories = await anon.from("categories").select("id");
check("anonyme : lit les catégories", !categories.error && (categories.data?.length ?? 0) > 0);

const products = await anon.from("products").select("slug, published");
check(
  "anonyme : ne lit que des produits publiés",
  !products.error && (products.data ?? []).every((p) => p.published === true),
);

check("anonyme : is_admin() = false", (await isAdmin(anon)) === false);

const anonInsert = await anon.from("quote_requests").insert(quote);
check("anonyme : peut envoyer une demande", !anonInsert.error, anonInsert.error?.message);

const anonQuotes = await anon.from("quote_requests").select("id");
check("anonyme : ne lit aucune demande", (anonQuotes.data?.length ?? 0) === 0);

const anonUpdate = await anon.from("products").update({ position: 0 }).neq("slug", "").select("id");
check("anonyme : ne modifie aucun produit", (anonUpdate.data?.length ?? 0) === 0);

await anon.from("quote_requests").insert(quote);
await anon.from("quote_requests").insert(quote);
const limited = await anon.from("quote_requests").insert(quote);
check(
  "anonyme : 4e demande du même numéro refusée",
  limited.error?.message.includes("rate_limited") ?? false,
  limited.error?.message ?? "acceptée",
);

// --- Connecté non-admin
const user = await signedIn(env.RLS_USER_EMAIL, env.RLS_USER_PASSWORD);
check("non-admin : is_admin() = false", (await isAdmin(user)) === false);

const userQuotes = await user.from("quote_requests").select("id");
check("non-admin : ne lit aucune demande", (userQuotes.data?.length ?? 0) === 0);

const userUpdate = await user.from("products").update({ position: 0 }).neq("slug", "").select("id");
check("non-admin : ne modifie aucun produit", (userUpdate.data?.length ?? 0) === 0);

const userDelete = await user.from("categories").delete().neq("id", "").select("id");
check("non-admin : ne supprime aucune catégorie", (userDelete.data?.length ?? 0) === 0);

// --- Administrateur
const admin = await signedIn(env.RLS_ADMIN_EMAIL, env.RLS_ADMIN_PASSWORD);
check("admin : is_admin() = true", (await isAdmin(admin)) === true);

const adminQuotes = await admin.from("quote_requests").select("id").eq("source", "rls-check");
check("admin : lit les demandes de test", (adminQuotes.data?.length ?? 0) >= 3);

const first = (await admin.from("products").select("id, position").limit(1).single()).data;
if (first) {
  const update = await admin
    .from("products")
    .update({ position: first.position })
    .eq("id", first.id)
    .select("id");
  check("admin : peut modifier un produit", (update.data?.length ?? 0) === 1, update.error?.message);
}

const cleanup = await admin.from("quote_requests").delete().eq("source", "rls-check").select("id");
check("admin : supprime les demandes de test", !cleanup.error, cleanup.error?.message);

console.log(failures === 0 ? "\nTout est vert." : `\n${failures} échec(s).`);
process.exit(failures === 0 ? 0 : 1);
