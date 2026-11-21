import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

/**
 * Le site public est indexable ; l'admin, les pages internes de marque et les
 * pages de recherche du catalogue (doublons) ne sont pas explorés.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/brand", "/design", "/produits?q=", "/produits?*&q="] },
    sitemap: absoluteUrl("/sitemap.xml", siteConfig.siteUrl),
    host: siteConfig.siteUrl,
  };
}
