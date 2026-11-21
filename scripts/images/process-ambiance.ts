// Génère les images d'ambiance (hero, sections, catégories) et lib/ambiance-images.ts
// à partir des photos libres de droits archivées dans
// public/images/_archive/2026-11-stock-unsplash/ (crédits dans son README).
// Usage : node scripts/images/process-ambiance.ts
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ARCHIVE = join("public", "images", "_archive", "2026-11-stock-unsplash");

type Credit = { author: string; url: string; license: "Unsplash License" };

type Spec = {
  key: string;
  file: string;
  out: string;
  width: number;
  height: number;
  maxKb: number;
  alt: string;
  credit: Credit;
  /** Recadrage manuel avant redimensionnement (sinon : zone la plus intéressante). */
  crop?: { left: number; top: number; width: number; height: number };
};

const CREDITS: Record<string, Credit> = {
  "goutte-a-goutte-laitue.jpg": {
    author: "Nebular",
    url: "https://unsplash.com/photos/a-plant-sprouting-from-a-soil-eeN3zSBlaaA",
    license: "Unsplash License",
  },
  "rangs-goutte-a-goutte.jpg": {
    author: "Anil Sharma",
    url: "https://unsplash.com/photos/a-bunch-of-plants-that-are-in-the-dirt-U5w3Z7fAy5Y",
    license: "Unsplash License",
  },
  "asperseurs-champ.jpg": {
    author: "Being Organic in EU",
    url: "https://unsplash.com/photos/two-sprinklers-spraying-water-on-a-corn-field-ZYiOik4jels",
    license: "Unsplash License",
  },
  "verger-agrumes.jpg": {
    author: "nhxl bdl",
    url: "https://unsplash.com/photos/ripe-oranges-hanging-from-lush-green-trees-in-an-orchard-ka_OiW3I_uE",
    license: "Unsplash License",
  },
  "pompage-bassin.jpg": {
    author: "Bernd 📷 Dittrich",
    url: "https://unsplash.com/photos/water-being-pumped-into-a-pond-from-a-machine-3to-jRLc5NE",
    license: "Unsplash License",
  },
  "lignes-goutte-a-goutte.jpg": {
    author: "Marc Pell",
    url: "https://unsplash.com/photos/plants-grow-in-a-garden-bed-with-irrigation-3f7AWW0YWAA",
    license: "Unsplash License",
  },
  "serre-tunnel.jpg": {
    author: "wei",
    url: "https://unsplash.com/photos/a-large-greenhouse-filled-with-lots-of-green-plants-eoj6t-cMtNs",
    license: "Unsplash License",
  },
};

const spec = (key: string, file: string, out: string, width: number, height: number, maxKb: number, alt: string): Spec => ({
  key,
  file,
  out,
  width,
  height,
  maxKb,
  alt,
  credit: CREDITS[file],
});

const SPECS: Spec[] = [
  spec("heroDesktop", "goutte-a-goutte-laitue.jpg", "hero/home.webp", 1920, 1080, 300,
    "Jeune laitue au pied d'un tuyau de goutte-à-goutte, dans une terre ocre"),
  {
    ...spec("heroMobile", "goutte-a-goutte-laitue.jpg", "hero/home-mobile.webp", 1080, 1350, 300,
      "Jeune laitue au pied d'un tuyau de goutte-à-goutte, dans une terre ocre"),
    // 4:5 centré sur la laitue et le tuyau (le cadrage automatique coupait la plante).
    crop: { left: 240, top: 0, width: 1440, height: 1800 },
  },
  spec("goutteAGoutte", "rangs-goutte-a-goutte.jpg", "sections/goutte-a-goutte.webp", 1600, 900, 200,
    "Rangées de jeunes plants irriguées par des lignes de goutte-à-goutte"),
  spec("vergers", "verger-agrumes.jpg", "sections/vergers.webp", 1600, 900, 200,
    "Orangers chargés de fruits dans un verger"),
  spec("serres", "serre-tunnel.jpg", "sections/serres.webp", 1600, 900, 200,
    "Grande serre tunnel avec des cultures en rangs"),
  spec("categorieArrosage", "asperseurs-champ.jpg", "categories/arrosage.webp", 1200, 900, 150,
    "Asperseurs arrosant un champ"),
  // Carrousel de l'accueil : diapositives 2 (pompage) et 3 (serres), 16:9 et 4:5.
  spec("heroPompageDesktop", "pompage-bassin.jpg", "hero/pompage.webp", 1920, 1080, 280,
    "Eau pompée qui jaillit d'une conduite vers un bassin d'irrigation"),
  {
    ...spec("heroPompageMobile", "pompage-bassin.jpg", "hero/pompage-mobile.webp", 1080, 1350, 260,
      "Eau pompée qui jaillit d'une conduite vers un bassin d'irrigation"),
    // 4:5 centré sur le jet d'eau et la conduite.
    crop: { left: 560, top: 0, width: 1280, height: 1600 },
  },
  spec("heroSerresDesktop", "serre-tunnel.jpg", "hero/serres.webp", 1920, 1080, 280,
    "Grande serre tunnel avec des cultures en rangs"),
  spec("heroSerresMobile", "serre-tunnel.jpg", "hero/serres-mobile.webp", 1080, 1350, 260,
    "Grande serre tunnel avec des cultures en rangs"),
  // Photo du produit « Gaine goutte-à-goutte » (photo d'illustration, pas un produit fournisseur).
  spec("produitGaineGoutte", "lignes-goutte-a-goutte.jpg", "products/gaine-goutte-a-goutte/main.webp", 1200, 1200, 160,
    "Lignes de goutte-à-goutte posées au pied de jeunes plants"),
];

async function encode(image: Buffer, maxBytes: number): Promise<Buffer> {
  for (const quality of [80, 74, 68, 62, 56, 50]) {
    const out = await sharp(image).webp({ quality, effort: 6 }).toBuffer();
    if (out.length <= maxBytes) return out;
  }
  throw new Error("impossible de descendre sous la taille cible");
}

const entries: Record<string, unknown> = {};
for (const s of SPECS) {
  const original = sharp(await readFile(join(ARCHIVE, s.file)));
  const resized = await (s.crop ? original.extract(s.crop) : original)
    .resize(s.width, s.height, { fit: "cover", position: "attention" })
    .png()
    .toBuffer();
  const data = await encode(resized, s.maxKb * 1024);
  const file = join("public", "images", s.out);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, data);
  const blur = await sharp(data).resize(16, Math.round((16 * s.height) / s.width)).webp({ quality: 40 }).toBuffer();
  const { dominant } = await sharp(data).stats();
  const hex = (v: number) => v.toString(16).padStart(2, "0");
  entries[s.key] = {
    src: `/images/${s.out}`,
    width: s.width,
    height: s.height,
    alt: s.alt,
    source: "stock",
    credit: s.credit,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    dominantColor: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
    bytes: data.length,
    hash: createHash("sha256").update(data).digest("hex").slice(0, 10),
  };
  console.log(`✓ /images/${s.out}  ${s.width}×${s.height}  ${Math.round(data.length / 1024)} Ko`);
}

await writeFile(
  join("lib", "ambiance-images.ts"),
  `// Fichier généré par scripts/images/process-ambiance.ts — ne pas modifier à la main.
// Photos d'ambiance libres de droits (hero, sections, catégories), à remplacer
// par des photos de terrain. Crédits : public/images/_archive/2026-11-stock-unsplash/.

export type AmbianceImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  source: "stock";
  credit: { author: string; url: string; license: "Unsplash License" };
  blurDataURL: string;
  dominantColor: string;
  bytes: number;
  hash: string;
};

export type AmbianceKey = ${SPECS.map((s) => JSON.stringify(s.key)).join(" | ")};

export const AMBIANCE_IMAGES: Record<AmbianceKey, AmbianceImage> = ${JSON.stringify(entries, null, 2)};
`,
);
console.log("✓ lib/ambiance-images.ts");
