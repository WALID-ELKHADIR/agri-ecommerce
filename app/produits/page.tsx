import type { Metadata } from "next";
import Link from "next/link";
import { CatalogBrowser } from "@/components/catalog-browser";
import { Clock, ShieldCheck, Truck } from "@/components/icons";
import { MobileCta } from "@/components/mobile-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalog } from "@/lib/catalog-data";

export const metadata: Metadata = {
  title: "Catalogue — Pompes, raccords et kits d'irrigation | Saqia",
  description:
    "Découvrez notre catalogue de pompes centrifuges et immergées, raccords PE/PVC et kits de pompage. Devis technique sous 24h.",
};

const trust = [
  {
    icon: ShieldCheck,
    title: "Garantie constructeur",
    text: "Matériel professionnel sélectionné",
  },
  {
    icon: Truck,
    title: "Livraison nationale",
    text: "Expédition partout au Maroc",
  },
  {
    icon: Clock,
    title: "Devis sous 24h",
    text: "Réponse d'un technicien",
  },
];

export default async function ProduitsPage() {
  const { products, categories } = await getCatalog();

  return (
    <>
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-field-900">
          <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-water-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:pb-12 sm:pt-10">
            <nav aria-label="Fil d'Ariane" className="text-xs text-soil-300">
              <Link href="/" className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] transition hover:text-water-300">
                Accueil
              </Link>
              <span aria-hidden="true" className="mx-2 text-soil-400">/</span>
              <span className="text-soil-200">Produits</span>
            </nav>

            <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Catalogue irrigation &amp; pompage
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-soil-300/80 sm:text-base">
                  Pompes, raccords et kits complets. Filtrez par gamme, comparez
                  les caractéristiques et demandez un devis en un clic.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-water-200">
                  {products.length} références
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-soil-200">
                  Devis sous 24h
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-soil-200">
                  Conseil technique
                </span>
              </div>
            </div>
          </div>
        </section>

        <CatalogBrowser products={products} categories={categories} />

        <section className="border-t border-soil-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-3">
            {trust.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-water-50 text-water-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-soil-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-soil-500">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileCta />
    </>
  );
}
