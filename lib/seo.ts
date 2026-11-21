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
