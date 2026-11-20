// Envoie les images produits (public/images/products/) dans le bucket Supabase
// Storage `product-images`, avec la même arborescence, puis pointe chaque
// produit vers son image hébergée.
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
// Idempotent : un fichier déjà présent avec la même taille n'est pas renvoyé ;
// un produit n'est mis à jour que s'il pointe encore vers l'image locale.
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type Upload = { slug: string; localSrc: string; objectPath: string; isMain: boolean };

const uploads: Upload[] = Object.entries(PRODUCT_IMAGES).flatMap(([slug, images]) =>
  [images.main, ...images.gallery].map((image, index) => ({
    slug,
    localSrc: image.src,
    // /images/products/<slug>/main.webp → <slug>/main.webp
    objectPath: image.src.replace(/^\/images\/products\//, ""),
    isMain: index === 0,
  })),
);

console.log(`${apply ? "ENVOI" : "SIMULATION"} : ${uploads.length} images vers le bucket « ${BUCKET} ».`);

if (!apply) {
  for (const upload of uploads) console.log(`  ${upload.localSrc}  →  ${BUCKET}/${upload.objectPath}`);
  console.log("\nRelancez avec --apply pour envoyer réellement les fichiers.");
  process.exit(0);
}

if (!url || !serviceKey) {
  console.error("Renseignez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

let sent = 0;
let skipped = 0;
let linked = 0;
for (const upload of uploads) {
  const data = await readFile(join("public", upload.localSrc));
  const [folder, file] = [upload.objectPath.split("/")[0], upload.objectPath.split("/").slice(1).join("/")];
  const { data: existing } = await supabase.storage.from(BUCKET).list(folder, { search: file });
  const same = existing?.some((object) => object.name === file && object.metadata?.size === data.length);

  if (same) {
    skipped++;
  } else {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(upload.objectPath, data, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
    if (error) {
      console.error(`✗ ${upload.objectPath} : ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    sent++;
  }

  if (upload.isMain) {
    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(upload.objectPath).data.publicUrl;
    const { data: updated, error } = await supabase
      .from("products")
      .update({ image_url: publicUrl })
      .eq("slug", upload.slug)
      .eq("image_url", upload.localSrc)
      .select("slug");
    if (error) console.error(`✗ produit ${upload.slug} : ${error.message}`);
    linked += updated?.length ?? 0;
  }
}

console.log(`✓ ${sent} envoyées, ${skipped} déjà à jour, ${linked} produits pointés vers Storage.`);
