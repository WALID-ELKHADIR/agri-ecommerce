import { HeroSlider } from "@/components/home/hero-slider";
import {
  CategoryCards,
  Faq,
  FeaturedCarousel,
  FinalCta,
  HowItWorks,
  rangesFor,
  Reassurance,
  Showcase,
  Testimonials,
} from "@/components/home/sections";
import { MobileCta } from "@/components/mobile-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalog } from "@/lib/catalog-data";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";
import { FALLBACK_SITE_CONFIG, siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-settings";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    ...pageMetadata({
      title: t.meta.defaultTitle,
      description: t.meta.homeDescription,
      path: "/",
      siteUrl: siteConfig.siteUrl,
      ogLocale: t.meta.ogLocale,
    }),
    // Titre complet sur l'accueil (sans le suffixe « | Saqia »).
    title: { absolute: t.meta.defaultTitle },
  };
}

/** Accueil : sections rendues par le serveur, interactivité limitée aux boutons de devis et WhatsApp. */
export default async function Page() {
  const [{ products, categories }, settings] = await Promise.all([getCatalog(await getLocale()), getSiteSettings()]);
  const ranges = rangesFor(categories, products);
  // Produits mis en avant, ceux qui ont une vraie photo d'abord.
  const featured = products
    .filter((product) => product.featured)
    .sort((a, b) => Number(a.imagePlaceholder) - Number(b.imagePlaceholder));

  return (
    <>
      <JsonLd data={organizationJsonLd(settings, siteConfig.siteUrl, FALLBACK_SITE_CONFIG)} />
      <SiteHeader />
      <main className="pb-24 md:pb-0">
        <HeroSlider brandName={settings.name} productCount={products.length} />
        <Reassurance />
        <CategoryCards ranges={ranges} />
        <FeaturedCarousel products={featured.length > 0 ? featured : products.slice(0, 8)} />
        <HowItWorks />
        <Showcase productCount={products.length} rangeCount={ranges.length} />
        <Testimonials />
        <Faq />
        <FinalCta brandName={settings.name} />
      </main>
      <SiteFooter brand={settings} />
      <MobileCta />
    </>
  );
}
