// Génère les images produits du site et lib/images-manifest.ts à partir des
// photos d'origine et de scripts/images/sources.ts.
//
// Usage : node scripts/images/process-images.ts [--only <slug>] [--fresh]
//
// Le détourage utilise @imgly/background-removal-node (modèle ONNX local, aucun
// envoi en ligne). Trop lourd pour être une dépendance du projet (~360 Mo) :
// installez-le dans un dossier à part et indiquez-le avec BG_REMOVAL_DIR :
//   mkdir ../bg-tool && cd ../bg-tool && npm init -y && npm i @imgly/background-removal-node@1
//   BG_REMOVAL_DIR=../bg-tool node scripts/images/process-images.ts
// Les détourages sont mis en cache (node_modules/.cache/saqia-images).
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";
import sharp, { type Sharp } from "sharp";
import { logoMarkup } from "../../lib/brand/logo-svg.ts";
import { PRODUCT_IMAGES, type ImageSpec } from "./sources.ts";

const ARCHIVE = join("public", "images", "_archive", "2026-11-photos-fournisseur");
const OUT = join("public", "images", "products");
const CACHE = join("node_modules", ".cache", "saqia-images");
const MANIFEST = join("lib", "images-manifest.ts");

const SIZE = 1200;
const FILL = 0.7;
const MAX_BYTES = 150 * 1024;
const SOIL_50 = { r: 250, g: 248, b: 243, alpha: 1 };

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
if (args.includes("--fresh")) await rm(CACHE, { recursive: true, force: true });

// Le détourage tourne dans un processus séparé : l'outil embarque sa propre
// version de sharp/libvips, et deux versions dans un même processus plantent.
const WORKER = `
import { removeBackground } from "@imgly/background-removal-node";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
const entry = createRequire(process.cwd() + "/package.json").resolve("@imgly/background-removal-node");
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const blob = await removeBackground(new Blob([Buffer.concat(chunks)], { type: "image/jpeg" }), {
  publicPath: pathToFileURL(dirname(entry)).href + "/",
  model: "medium",
  output: { format: "image/png" },
});
process.stdout.write(Buffer.from(await blob.arrayBuffer()));
`;

function removeBackground(input: Buffer): Promise<Buffer> {
  const dir = process.env.BG_REMOVAL_DIR;
  if (!dir) throw new Error("Définissez BG_REMOVAL_DIR (voir l'en-tête du script).");
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, ["--input-type=module", "-e", WORKER], {
      cwd: resolve(dir),
      stdio: ["pipe", "pipe", "pipe"],
    });
    const out: Buffer[] = [];
    let errors = "";
    child.stdout.on("data", (chunk: Buffer) => out.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => (errors += chunk.toString()));
    child.on("error", reject);
    // Si le worker s'arrête tôt, l'erreur utile est dans stderr (voir "close").
    child.stdin.on("error", () => undefined);
    child.on("close", (code) => {
      if (code === 0) resolvePromise(Buffer.concat(out));
      else reject(new Error(`Détourage impossible (code ${code}) : ${errors.slice(0, 900)}`));
    });
    child.stdin.end(input);
  });
}

/** Photo d'origine, éventuellement recadrée. */
/** Photo d'origine : zones effacées (coordonnées d'origine) puis recadrage éventuel. */
async function source(spec: ImageSpec): Promise<Buffer> {
  const file = join(ARCHIVE, `photo-${String(spec.photo).padStart(2, "0")}.jpg`);
  const original = await sharp(await readFile(file)).rotate().toBuffer();
  let image = sharp(original);
  if (spec.erase?.length) {
    const patches = await Promise.all(
      spec.erase.map(async (zone) => {
        const { left, top, width, height } = zone.rect;
        const input =
          "color" in zone
            ? Buffer.from(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${zone.color}"/></svg>`,
              )
            : await sharp(original)
                .extract({ left: left + zone.clone.dx, top: top + zone.clone.dy, width, height })
                .toBuffer();
        return { input, left, top };
      }),
    );
    image = sharp(await image.composite(patches).toBuffer());
  }
  return (spec.crop ? image.extract(spec.crop) : image).jpeg({ quality: 95 }).toBuffer();
}

async function cachedCutout(input: Buffer): Promise<Buffer> {
  await mkdir(CACHE, { recursive: true });
  const key = join(CACHE, `${createHash("sha1").update(input).digest("hex")}.png`);
  if (existsSync(key)) return readFile(key);
  const cut = await removeBackground(input);
  await writeFile(key, cut);
  return cut;
}

/** Produit détouré, centré à ~70 % sur fond soil-50, ombre douce (lumière haut-gauche). */
async function packshot(input: Buffer): Promise<Sharp> {
  const trimmed = await sharp(await cachedCutout(input)).trim({ threshold: 10 }).png().toBuffer({ resolveWithObject: true });
  const scale = (SIZE * FILL) / Math.max(trimmed.info.width, trimmed.info.height);
  const w = Math.round(trimmed.info.width * scale);
  const h = Math.round(trimmed.info.height * scale);
  const product = await sharp(trimmed.data).resize(w, h, { kernel: "lanczos3" }).png().toBuffer();
  const alpha = await sharp(product).extractChannel("alpha").toBuffer();
  const shadow = await sharp({ create: { width: w, height: h, channels: 3, background: { r: 31, g: 28, b: 22 } } })
    .joinChannel(alpha)
    .linear([1, 1, 1, 0.16], [0, 0, 0, 0])
    .blur(18)
    .png()
    .toBuffer();
  const left = Math.round((SIZE - w) / 2);
  const top = Math.round((SIZE - h) / 2);
  return sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: SOIL_50 } }).composite([
    { input: shadow, left: left + 14, top: top + 22 },
    { input: product, left, top },
  ]);
}

/** Recadrage carré centré (mise en situation). */
async function squareCrop(input: Buffer): Promise<Sharp> {
  return sharp(input).resize(SIZE, SIZE, { fit: "cover", position: "attention" });
}

/** Image provisoire : symbole Saqia discret sur fond clair. */
async function placeholder(): Promise<Sharp> {
  const { inner } = logoMarkup({ variant: "symbol", tone: "mono", maskId: "ph" });
  const symbol = 300;
  const offset = (SIZE - symbol) / 2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">` +
    `<rect width="${SIZE}" height="${SIZE}" fill="#f3efe5"/>` +
    `<g opacity="0.14" transform="translate(${offset} ${offset}) scale(${symbol / 64})">${inner}</g></svg>`;
  return sharp(Buffer.from(svg));
}

/** WebP sous 150 Ko : la qualité baisse par paliers si nécessaire. */
async function webp(image: Sharp): Promise<Buffer> {
  const png = await image.png().toBuffer();
  for (const quality of [82, 76, 70, 64, 58]) {
    const out = await sharp(png).webp({ quality, effort: 6 }).toBuffer();
    if (out.length <= MAX_BYTES || quality === 58) return out;
  }
  throw new Error("inaccessible");
}

type ManifestImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  source: "photo" | "placeholder";
  original: string | null;
  blurDataURL: string;
  dominantColor: string;
  bytes: number;
};

async function describe(file: string, data: Buffer, alt: string, spec: ImageSpec | null): Promise<ManifestImage> {
  const blur = await sharp(data).resize(12, 12).webp({ quality: 40 }).toBuffer();
  const { dominant } = await sharp(data).stats();
  const hex = (v: number) => v.toString(16).padStart(2, "0");
  return {
    src: `/${file.replaceAll("\\", "/").replace(/^public\//, "")}`,
    width: SIZE,
    height: SIZE,
    alt,
    source: spec ? "photo" : "placeholder",
    original: spec ? `photo-${String(spec.photo).padStart(2, "0")}.jpg` : null,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    dominantColor: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
    bytes: data.length,
  };
}

async function render(spec: ImageSpec | null, file: string, alt: string): Promise<ManifestImage> {
  const image = !spec ? await placeholder() : spec.mode === "cutout" ? await packshot(await source(spec)) : await squareCrop(await source(spec));
  const data = await webp(image);
  await writeFile(file, data);
  const described = await describe(file, data, alt, spec);
  console.log(`✓ ${described.src}  ${Math.round(data.length / 1024)} Ko`);
  return described;
}

// --- Traitement
const entries: Record<string, { main: ManifestImage; gallery: ManifestImage[]; toConfirm: string | null }> = {};
const previous = existsSync(MANIFEST) ? await readFile(MANIFEST, "utf8") : "";

for (const product of PRODUCT_IMAGES) {
  if (only && product.slug !== only) continue;
  const dir = join(OUT, product.slug);
  await mkdir(dir, { recursive: true });
  const main = await render(product.main ?? null, join(dir, "main.webp"), product.main?.alt ?? "Photo du produit à venir");
  const gallery: ManifestImage[] = [];
  for (const [index, spec] of (product.gallery ?? []).entries()) {
    gallery.push(await render(spec, join(dir, `gallery-${index + 1}.webp`), spec.alt));
  }
  entries[product.slug] = { main, gallery, toConfirm: product.toConfirm ?? null };
}

if (only) {
  console.log("Mode --only : manifest non régénéré.");
} else {
  const body = JSON.stringify(entries, null, 2);
  const content = `// Fichier généré par scripts/images/process-images.ts — ne pas modifier à la main.
// Images produits du site : chemin, dimensions, texte alternatif, origine,
// placeholder flou et couleur dominante (chargement sans saut de mise en page).

export type ImageSource = "photo" | "placeholder";

export type ManifestImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** "placeholder" : image provisoire, photo du produit à fournir. */
  source: ImageSource;
  /** Photo d'origine dans public/images/_archive/2026-11-photos-fournisseur/. */
  original: string | null;
  blurDataURL: string;
  dominantColor: string;
  bytes: number;
};

export type ProductImages = {
  main: ManifestImage;
  gallery: ManifestImage[];
  /** Correspondance photo → produit à faire confirmer. */
  toConfirm: string | null;
};

export const PRODUCT_IMAGES: Record<string, ProductImages> = ${body};
`;
  if (content !== previous) await writeFile(MANIFEST, content);
  console.log(`✓ ${MANIFEST} (${Object.keys(entries).length} produits)`);
}
