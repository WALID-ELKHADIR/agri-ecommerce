// Photo du « Tuyau goutte-à-goutte (gaine) » fournie par le propriétaire
// (public/images/_archive/2026-11-photos-fournisseur/gaine-goutte-a-goutte.png,
// fond blanc opaque) → packshot 1200×1200 comme les autres produits : produit
// centré à ~70 % sur fond soil-50, ombre douce.
// Le fond blanc est retiré par un masque « distance au blanc » : le tuyau noir
// et les liens orange restent opaques, les bords anti-crénelés restent doux.
// Usage : node scripts/images/process-gaine.ts
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const SOURCE = join("public", "images", "_archive", "2026-11-photos-fournisseur", "gaine-goutte-a-goutte.png");
const OUT = join("public", "images", "products", "gaine-goutte-a-goutte", "main.webp");
const SIZE = 1200;
const FILL = 0.7;
const SOIL_50 = { r: 250, g: 248, b: 243, alpha: 1 };

const { data, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const rgba = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  rgba[j] = r;
  rgba[j + 1] = g;
  rgba[j + 2] = b;
  // Presque blanc (≥ 240, fond et bord de la photo d'origine) → transparent ;
  // dès 40 niveaux sous le blanc → opaque (le tuyau et les liens).
  rgba[j + 3] = Math.max(0, Math.min(255, Math.round((240 - Math.min(r, g, b)) * 6.4)));
}
const cut = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ threshold: 10 })
  .png()
  .toBuffer({ resolveWithObject: true });

const scale = (SIZE * FILL) / Math.max(cut.info.width, cut.info.height);
const w = Math.round(cut.info.width * scale);
const h = Math.round(cut.info.height * scale);
const product = await sharp(cut.data).resize(w, h, { kernel: "lanczos3" }).png().toBuffer();
const alpha = await sharp(product).extractChannel("alpha").toBuffer();
const shadow = await sharp({ create: { width: w, height: h, channels: 3, background: { r: 31, g: 28, b: 22 } } })
  .joinChannel(alpha)
  .linear([1, 1, 1, 0.16], [0, 0, 0, 0])
  .blur(18)
  .png()
  .toBuffer();
const left = Math.round((SIZE - w) / 2);
const top = Math.round((SIZE - h) / 2);
const image = await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: SOIL_50 } })
  .composite([
    { input: shadow, left: left + 14, top: top + 22 },
    { input: product, left, top },
  ])
  .flatten({ background: SOIL_50 })
  .webp({ quality: 82, effort: 6 })
  .toBuffer();
await writeFile(OUT, image);
console.log(`✓ ${OUT}  ${SIZE}×${SIZE}  ${Math.round(image.length / 1024)} Ko`);
