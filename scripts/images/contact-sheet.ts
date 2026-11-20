// Planche contact de toutes les images produits du manifest.
// Usage : node scripts/images/contact-sheet.ts [sortie.png]
import { join } from "node:path";
import sharp from "sharp";
import { PRODUCT_IMAGES } from "../../lib/images-manifest.ts";

const out = process.argv[2] ?? join("docs", "images-contact-sheet.png");
const TILE = 260;
const LABEL = 44;
const COLS = 6;

const tiles = Object.entries(PRODUCT_IMAGES).flatMap(([slug, images]) =>
  [images.main, ...images.gallery].map((image, index) => ({
    slug,
    image,
    label: index === 0 ? "principale" : `galerie ${index}`,
  })),
);

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

const composites = await Promise.all(
  tiles.map(async ({ slug, image, label }, index) => {
    const picture = await sharp(join("public", image.src)).resize(TILE, TILE).png().toBuffer();
    const flag = image.source === "placeholder" ? " · provisoire" : "";
    const caption = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${LABEL}">` +
        `<rect width="${TILE}" height="${LABEL}" fill="#ffffff"/>` +
        `<text x="6" y="18" font-family="Arial" font-size="13" font-weight="bold" fill="#1f1c16">${escape(slug)}</text>` +
        `<text x="6" y="36" font-family="Arial" font-size="12" fill="#6b6352">${label}${flag} · ${Math.round(image.bytes / 1024)} Ko</text>` +
        `</svg>`,
    );
    const tile = await sharp({ create: { width: TILE, height: TILE + LABEL, channels: 3, background: "#ffffff" } })
      .composite([
        { input: picture, left: 0, top: 0 },
        { input: caption, left: 0, top: TILE },
      ])
      .png()
      .toBuffer();
    return { input: tile, left: (index % COLS) * (TILE + 8) + 8, top: Math.floor(index / COLS) * (TILE + LABEL + 8) + 8 };
  }),
);

const rows = Math.ceil(tiles.length / COLS);
await sharp({
  create: { width: COLS * (TILE + 8) + 8, height: rows * (TILE + LABEL + 8) + 8, channels: 3, background: "#e5ddcb" },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(out);
console.log(`✓ ${out} (${tiles.length} images)`);
