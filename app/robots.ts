import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

/** Le site public est indexable ; l'admin et les pages internes de marque ne le sont pas. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/brand", "/design"] },
    sitemap: absoluteUrl("/sitemap.xml", siteConfig.siteUrl),
    host: siteConfig.siteUrl,
  };
}
