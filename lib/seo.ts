/**
 * Référencement : URL absolues, métadonnées de page, plan du site et données
 * structurées (module pur, testé dans tests/seo.test.ts).
 * Règle : aucun fait inventé (pas de prix, d'avis, de note ni de stock chiffré).
 */
import type { Metadata } from "next";

const SITE_NAME = "Saqia";

/** URL absolue à partir d'un chemin et de l'adresse du site (barre finale et protocole tolérés). */
export function absoluteUrl(path: string, siteUrl: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = (/^https?:\/\//.test(siteUrl) ? siteUrl : `https://${siteUrl}`).replace(/\/+$/, "");
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/** Métadonnées d'une page : canonique, Open Graph (fr_MA), carte Twitter, indexation. */
export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  siteUrl: string;
  noindex?: boolean;
  image?: string;
  /** Locale Open Graph de la page (fr_MA par défaut). */
  ogLocale?: string;
}): Metadata {
  const url = absoluteUrl(input.path, input.siteUrl);
  // Un openGraph de page remplace celui du parent : l'image de la racine est
  // reprise par défaut (une image de dossier, comme celle des fiches, prime).
  const images = [{ url: absoluteUrl(input.image ?? "/opengraph-image", input.siteUrl) }];
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: input.ogLocale ?? "fr_MA",
      siteName: SITE_NAME,
      url,
      title: input.title,
      description: input.description,
      images,
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: images.map((image) => image.url) },
    ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

type SitemapEntry = { url: string; changeFrequency: "weekly" | "monthly"; priority: number };

/**
 * Entrées du plan du site : pages publiques et produits publiés.
 * Pas de date de modification (aucune date fiable) ; les pages internes
 * (/brand, /design, /admin) n'y figurent jamais.
 */
export function sitemapEntries(products: { slug: string }[], siteUrl: string): SitemapEntry[] {
  const pages: SitemapEntry[] = [
    { url: absoluteUrl("/", siteUrl), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/produits", siteUrl), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/contact", siteUrl), changeFrequency: "monthly", priority: 0.5 },
  ];
  return [
    ...pages,
    ...products.map((product) => ({
      url: absoluteUrl(`/produits/${product.slug}`, siteUrl),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

type JsonLd = Record<string, unknown>;

/** Entreprise : identité et moyens de contact (aucune note, aucun avis). */
type Contact = { phoneRaw: string; email: string; address: string };

/**
 * Entreprise : identité et moyens de contact (aucune note, aucun avis).
 * Une coordonnée encore égale à sa valeur provisoire (`placeholders`, les
 * valeurs par défaut du code) n'est pas publiée : ce serait un fait inventé.
 * Le logo est servi depuis /icons (non bloqué par robots.txt).
 */
export function organizationJsonLd(
  settings: { name: string } & Contact,
  siteUrl: string,
  placeholders?: Contact,
): JsonLd {
  const real = (key: keyof Contact) => (settings[key] && settings[key] !== placeholders?.[key] ? settings[key] : null);
  const telephone = real("phoneRaw");
  const email = real("email");
  const address = real("address");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.name,
    url: absoluteUrl("/", siteUrl),
    logo: absoluteUrl("/icons/icon-512.png", siteUrl),
    areaServed: "MA",
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(address ? { address } : {}),
    ...(telephone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            telephone,
            contactType: "sales",
            areaServed: "MA",
            availableLanguage: ["French", "Arabic"],
          },
        }
      : {}),
  };
}

/**
 * Produit : faits du catalogue uniquement. Pas d'offre (pas de prix publié),
 * ni d'avis ; une image provisoire n'est pas présentée comme photo du produit.
 */
export function productJsonLd(
  product: { slug: string; name: string; description: string; categoryLabel: string; image: string; imagePlaceholder: boolean },
  siteUrl: string,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.categoryLabel,
    url: absoluteUrl(`/produits/${product.slug}`, siteUrl),
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(product.imagePlaceholder ? {} : { image: absoluteUrl(product.image, siteUrl) }),
  };
}

/** Fil d'Ariane : positions 1..n et URL absolues. */
export function breadcrumbJsonLd(items: { name: string; path: string }[], siteUrl: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, siteUrl),
    })),
  };
}

/** JSON sûr dans une balise <script> : `<` est échappé, donc jamais de « </script> ». */
export function jsonLdScript(data: JsonLd): string {
  // Chaque < devient la séquence d'échappement Unicode u003c (barre oblique inverse écrite par son code).
  return JSON.stringify(data).replace(/</g, `${String.fromCharCode(92)}u003c`);
}

/**
 * Chemin d'un fichier de public/ à partir d'une URL locale (« /images/… »),
 * ou null s'il sortirait du dossier (« /../ »).
 */
export function publicFilePath(src: string, publicRoot: string): string | null {
  const NUL = String.fromCharCode(0);
  const BACKSLASH = String.fromCharCode(92);
  if (!src.startsWith("/") || src.includes(NUL) || src.includes(BACKSLASH)) return null;
  const segments: string[] = [];
  for (const segment of src.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") return null;
    segments.push(segment);
  }
  let root = publicRoot;
  while (root.endsWith("/") || root.endsWith(BACKSLASH)) root = root.slice(0, -1);
  return `${root}/${segments.join("/")}`;
}
