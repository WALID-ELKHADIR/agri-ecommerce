import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog-data";
import { sitemapEntries } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

/** Plan du site : accueil, catalogue, contact et chaque produit publié. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalog();
  return sitemapEntries(products, siteConfig.siteUrl);
}
