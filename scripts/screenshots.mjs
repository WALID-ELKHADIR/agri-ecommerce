// Captures d'écran mobile (390×844) et desktop (1440×900) pour les PR.
// Usage : node scripts/screenshots.mjs <phase> <url> [url…]
// Sortie : docs/screenshots/<phase>/<page>-mobile.png et <page>-desktop.png
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
  { name: "desktop", width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1 },
];

const [phase, ...urls] = process.argv.slice(2);

if (!phase || urls.length === 0) {
  console.error("Usage : node scripts/screenshots.mjs <phase> <url> [url…]");
  process.exit(1);
}

/** `/produits/pompe-x` → `produits-pompe-x`, `/` → `accueil`. */
function pageName(url) {
  const path = new URL(url).pathname.replace(/^\/|\/$/g, "");
  return path ? path.replaceAll("/", "-") : "accueil";
}

const outDir = join("docs", "screenshots", phase);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
      deviceScaleFactor: viewport.deviceScaleFactor,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    for (const url of urls) {
      await page.goto(url, { waitUntil: "networkidle" });
      const file = join(outDir, `${pageName(url)}-${viewport.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`✓ ${file}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
