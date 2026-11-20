// Contrôle des images produits, lancé avant chaque build (npm run prebuild).
// N'arrête jamais le build : il avertit.
// - produit du catalogue de secours sans entrée dans le manifest ;
// - fichier d'image manquant ;
// - images provisoires et correspondances à confirmer (rappel).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PRODUCT_IMAGES } from "../../lib/images-manifest.ts";

export type ImageReport = { missingEntries: string[]; missingFiles: string[]; placeholders: string[]; toConfirm: string[] };

/** Slugs déclarés dans lib/catalog.ts (lecture du source : pas d'import Next ici). */
export function catalogSlugs(source: string): string[] {
  return [...source.matchAll(/^\s+slug: "([a-z0-9-]+)",$/gm)].map((match) => match[1]);
}

export function checkImages(slugs: string[]): ImageReport {
  const report: ImageReport = { missingEntries: [], missingFiles: [], placeholders: [], toConfirm: [] };
  for (const slug of slugs) {
    const images = PRODUCT_IMAGES[slug];
    if (!images) {
      report.missingEntries.push(slug);
      continue;
    }
    for (const image of [images.main, ...images.gallery]) {
      if (!existsSync(join("public", image.src))) report.missingFiles.push(image.src);
    }
    if (images.main.source === "placeholder") report.placeholders.push(slug);
    if (images.toConfirm) report.toConfirm.push(`${slug} : ${images.toConfirm}`);
  }
  return report;
}

if (import.meta.url === `file:///${process.argv[1]?.replaceAll("\\", "/").replace(/^\//, "")}`) {
  const report = checkImages(catalogSlugs(readFileSync(join("lib", "catalog.ts"), "utf8")));
  const warn = (title: string, items: string[]) => {
    if (items.length) console.warn(`⚠ [images] ${title} :\n  - ${items.join("\n  - ")}`);
  };
  warn("produits sans image dans lib/images-manifest.ts", report.missingEntries);
  warn("fichiers d'image introuvables", report.missingFiles);
  warn("images provisoires (photo à fournir)", report.placeholders);
  warn("à confirmer", report.toConfirm);
  if (!report.missingEntries.length && !report.missingFiles.length) {
    console.log("✓ [images] chaque produit du catalogue a ses images.");
  }
}
