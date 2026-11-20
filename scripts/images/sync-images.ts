// Envoie les images produits (public/images/products/) dans le bucket Supabase
// Storage `product-images`, puis pointe chaque produit vers son image hébergée.
//
// Usage :
//   node scripts/images/sync-images.ts            simulation (rien n'est envoyé)
//   node scripts/images/sync-images.ts --apply    envoi réel
//
// Variables (.env.local) : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// La clé service-role contourne la RLS : elle ne sert qu'à ce script local, ne
// la mettez jamais dans une variable NEXT_PUBLIC_ ni sur Vercel.
// Prérequis : le bucket `product-images` (créé par la migration de la phase 3).
//
// - Chaque fichier est nommé avec l'empreinte de son contenu
//   (<slug>/main-<empreinte>.webp) : une image modifiée a une nouvelle URL, ce
//   qui rend sûr le cache d'un an, et un fichier déjà présent n'est pas renvoyé.
// - Les images provisoires ne sont jamais envoyées.
// - Un produit n'est repointé que s'il utilise encore l'image locale ou une
//   version précédente envoyée par ce script : une image choisie dans l'admin
//   n'est jamais remplacée.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PRODUCT_IMAGES } from "../../lib/images-manifest.ts";

const BUCKET = "product-images";
const apply = process.argv.includes("--apply");

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables éventuellement fournies par l'environnement.
}

type Upload = { slug: string; localSrc: string; folder: string; file: string; isMain: boolean };

const uploads: Upload[] = Object.entries(PRODUCT_IMAGES).flatMap(([slug, images]) =>
  [images.main, ...images.gallery]
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => image.source !== "placeholder")
    .map(({ image, index }) => {
      // /images/products/<slug>/main.webp → <slug>/main-<empreinte>.webp
      const name = image.src.split("/").pop()?.replace(/\.webp$/, "") ?? "main";
      return { slug, localSrc: image.src, folder: slug, file: `${name}-${image.hash}.webp`, isMain: index === 0 };
    }),
);

console.log(`${apply ? "ENVOI" : "SIMULATION"} : ${uploads.length} images vers le bucket « ${BUCKET} » (images provisoires exclues).`);

if (!apply) {
  for (const upload of uploads) console.log(`  ${upload.localSrc}  →  ${BUCKET}/${upload.folder}/${upload.file}`);
  console.log("\nRelancez avec --apply pour envoyer réellement les fichiers.");
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Renseignez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

let sent = 0;
let skipped = 0;
let linked = 0;
let failures = 0;

for (const upload of uploads) {
  const objectPath = `${upload.folder}/${upload.file}`;
  const listing = await supabase.storage.from(BUCKET).list(upload.folder, { search: upload.file, limit: 100 });
  if (listing.error) {
    console.error(`✗ lecture de ${upload.folder}/ : ${listing.error.message}`);
    failures++;
    continue;
  }

  if (listing.data.some((object) => object.name === upload.file)) {
    skipped++;
  } else {
    const data = await readFile(join("public", upload.localSrc));
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, data, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
    if (error) {
      console.error(`✗ ${objectPath} : ${error.message}`);
      failures++;
      continue;
    }
    sent++;
  }

  if (upload.isMain) {
    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
    // Versions précédentes envoyées par ce script (« * » : joker de PostgREST).
    const previousVersions = `${supabase.storage.from(BUCKET).getPublicUrl(`${upload.folder}/main-`).data.publicUrl}*`;
    const { data: updated, error } = await supabase
      .from("products")
      .update({ image_url: publicUrl })
      .eq("slug", upload.slug)
      .or(`image_url.eq."${upload.localSrc}",image_url.like."${previousVersions}"`)
      .neq("image_url", publicUrl)
      .select("slug");
    if (error) {
      console.error(`✗ produit ${upload.slug} : ${error.message}`);
      failures++;
    }
    linked += updated?.length ?? 0;
  }
}

console.log(`✓ ${sent} envoyées, ${skipped} déjà présentes, ${linked} produits pointés vers Storage.`);
if (failures) {
  console.error(`${failures} erreur(s) : relancez le script après correction (il est idempotent).`);
  process.exitCode = 1;
}
