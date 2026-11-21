// Visuels générés par IA (public/images/_archive/2026-11-images-ia/, voir son README)
// → images du site 1200×1200 en WebP, sous un nom distinct de l'ancien visuel
// provisoire (main.webp) pour qu'aucun cache ne resserve l'ancienne image.
// Les originaux sont déjà des packshots carrés sur fond clair : simple
// redimensionnement, sans détourage.
// Usage : node scripts/images/process-ia.ts
import { join } from "node:path";
import sharp from "sharp";

const ARCHIVE = join("public", "images", "_archive", "2026-11-images-ia");
const SLUGS = ["pompe-immergee-inox-4-pouces", "motopompe-centrifuge-inox", "coude-pe-filete-male-90"];
const SIZE = 1200;
const MAX_BYTES = 150 * 1024;

for (const slug of SLUGS) {
  const out = join("public", "images", "products", slug, "ia.webp");
  // Qualité abaissée par paliers jusqu'à tenir dans le budget de 150 Ko.
  for (let quality = 82; quality >= 60; quality -= 4) {
    const info = await sharp(join(ARCHIVE, `${slug}.jpg`))
      .resize(SIZE, SIZE, { fit: "cover", kernel: "lanczos3" })
      .webp({ quality, effort: 6 })
      .toFile(out);
    if (info.size <= MAX_BYTES || quality <= 60) {
      console.log(`✓ ${out}  ${SIZE}×${SIZE}  ${Math.round(info.size / 1024)} Ko (qualité ${quality})`);
      break;
    }
  }
}
