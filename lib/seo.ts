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
}): Metadata {
  const url = absoluteUrl(input.path, input.siteUrl);
  const images = input.image ? [{ url: absoluteUrl(input.image, input.siteUrl) }] : undefined;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_MA",
      siteName: SITE_NAME,
      url,
      title: input.title,
      description: input.description,
      ...(images ? { images } : {}),
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description },
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
export function organizationJsonLd(
  settings: { name: string; phoneRaw: string; email: string; address: string },
  siteUrl: string,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.name,
    url: absoluteUrl("/", siteUrl),
    logo: absoluteUrl("/brand/logo-full.png", siteUrl),
    telephone: settings.phoneRaw,
    email: settings.email,
    address: settings.address,
    areaServed: "MA",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.phoneRaw,
      contactType: "sales",
      areaServed: "MA",
      availableLanguage: ["French", "Arabic"],
    },
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
