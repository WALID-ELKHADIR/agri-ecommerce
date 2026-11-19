// Vérifie les droits (RLS) sur le VRAI projet Supabase, après application
// des migrations. Usage : node scripts/check-rls.ts
//
// Variables lues dans .env.local :
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
//   RLS_ADMIN_EMAIL / RLS_ADMIN_PASSWORD : un compte présent dans admin_users
//   RLS_USER_EMAIL / RLS_USER_PASSWORD   : un compte connecté NON admin
//
// Le script s'arrête si la migration manque, et ses sondes d'écriture réécrivent
// la valeur actuelle d'un seul produit. Les demandes de test
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

// --- Vérification préalable : sans la migration, on s'arrête avant toute écriture.
const anon = client();
const preflight = await anon.rpc("is_admin");
if (preflight.error) {
  console.error(
    `La fonction is_admin() est introuvable (${preflight.error.message}).\n` +
      "Appliquez d'abord supabase/migrations/20261119100000_admin_rls.sql, puis relancez.",
  );
  process.exit(1);
}

// Sondes d'écriture inoffensives : on réécrit la valeur actuelle d'un seul
// produit. Même si une policy était trop permissive, rien ne serait modifié.
const probe = (await anon.from("products").select("id, position").limit(1).single()).data;
if (!probe) {
  console.error("Aucun produit publié : impossible de tester les écritures.");
  process.exit(1);
}

async function probeProductWrite(supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase
    .from("products")
    .update({ position: probe?.position })
    .eq("id", probe?.id)
    .select("id");
  return data?.length ?? 0;
}

// --- Visiteur anonyme
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

check("anonyme : ne modifie aucun produit", (await probeProductWrite(anon)) === 0);

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

check("non-admin : ne modifie aucun produit", (await probeProductWrite(user)) === 0);

// Catégorie témoin : si l'insertion passait malgré tout, elle est retirée aussitôt.
const SENTINEL = { id: "rls-check-sonde", label: "Sonde", short: "Sonde", position: 9999 };
const userInsert = await user.from("categories").insert(SENTINEL).select("id");
check("non-admin : ne crée aucune catégorie", Boolean(userInsert.error) && !userInsert.data?.length);
if (userInsert.data?.length) {
  await user.from("categories").delete().eq("id", SENTINEL.id);
}

// --- Administrateur
const admin = await signedIn(env.RLS_ADMIN_EMAIL, env.RLS_ADMIN_PASSWORD);
check("admin : is_admin() = true", (await isAdmin(admin)) === true);

const adminQuotes = await admin.from("quote_requests").select("id").eq("source", "rls-check");
check("admin : lit les demandes de test", (adminQuotes.data?.length ?? 0) >= 3);

check("admin : peut modifier un produit", (await probeProductWrite(admin)) === 1);

const cleanup = await admin.from("quote_requests").delete().eq("source", "rls-check").select("id");
check("admin : supprime les demandes de test", !cleanup.error, cleanup.error?.message);

console.log(failures === 0 ? "\nTout est vert." : `\n${failures} échec(s).`);
process.exit(failures === 0 ? 0 : 1);
