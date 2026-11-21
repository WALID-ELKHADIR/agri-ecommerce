import { Hero } from "@/components/home/hero";
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
import { getSiteSettings } from "@/lib/site-settings";

/** Accueil : sections rendues par le serveur, interactivité limitée aux boutons de devis et WhatsApp. */
export default async function Page() {
  const [{ products, categories }, settings] = await Promise.all([getCatalog(), getSiteSettings()]);
  const ranges = rangesFor(categories, products);
  // Produits mis en avant, ceux qui ont une vraie photo d'abord.
  const featured = products
    .filter((product) => product.featured)
    .sort((a, b) => Number(a.imagePlaceholder) - Number(b.imagePlaceholder));

  return (
    <>
      <SiteHeader />
      <main className="pb-24 md:pb-0">
        <Hero
          brandName={settings.name}
          slogan={settings.slogan}
          whatsappNumber={settings.whatsappNumber}
          productCount={products.length}
        />
        <Reassurance />
        <CategoryCards ranges={ranges} />
        <FeaturedCarousel products={featured.length > 0 ? featured : products.slice(0, 8)} />
        <HowItWorks />
        <Showcase productCount={products.length} rangeCount={ranges.length} />
        <Testimonials />
        <Faq />
        <FinalCta brandName={settings.name} whatsappNumber={settings.whatsappNumber} />
      </main>
      <SiteFooter brand={settings} />
      <MobileCta />
    </>
  );
}
