import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Headset,
  Truck,
  WhatsApp,
} from "@/components/icons";
import { Gallery } from "@/components/product/gallery";
import { StickyBar } from "@/components/product/sticky-bar";
import { CARD_SIZES, ProductCard } from "@/components/product-card";
import { ProductQuote } from "@/components/product-quote";
import { SiteFooterWithSettings } from "@/components/site-footer-server";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppServerLink } from "@/components/whatsapp-server-link";
import { generalMessage } from "@/lib/catalog";
import {
  getCatalog,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/catalog-data";
import { catalogHref } from "@/lib/catalog-query";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Pré-rend les fiches connues au build (catalogue en cache) : cela permet au
 * header client de résoudre `usePathname` sans Suspense. Les produits ajoutés
 * plus tard depuis l'admin sont rendus à la demande.
 */
export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produit introuvable", robots: { index: false, follow: true } };
  }

  return pageMetadata({
    title: `${product.name} — ${product.categoryLabel}`,
    description: product.description,
    path: `/produits/${product.slug}`,
    siteUrl: siteConfig.siteUrl,
  });
}

const assurances = [
  {
    icon: Truck,
    title: "Livraison nationale",
    text: "Expédition partout au Maroc",
  },
  {
    icon: Headset,
    title: "Conseil technique",
    text: "Aide au choix du matériel",
  },
  {
    icon: Clock,
    title: "Devis sous 24h",
    text: "Prix et disponibilité sur WhatsApp",
  },
];

const choiceCriteria = [
  "Surface à irriguer et besoin en eau (m³/jour)",
  "Hauteur de refoulement et longueur de réseau",
  "Source d'eau : forage, puits, bassin ou réseau",
];

export default function ProduitPage({ params }: ProductPageProps) {
  return (
    <>
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        <Suspense fallback={<ProductSkeleton />}>
          {params.then(({ slug }) => (
            <ProductDetail slug={slug} />
          ))}
        </Suspense>
      </main>

      <SiteFooterWithSettings />
    </>
  );
}

async function ProductDetail({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product);

  return (
    <>
      <section className="relative overflow-hidden bg-field-900">
        <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-water-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <nav aria-label="Fil d'Ariane" className="text-xs text-soil-500">
            <Link href="/" className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] transition hover:text-water-300">
              Accueil
            </Link>
            <span aria-hidden="true" className="mx-2 text-soil-600">/</span>
            <Link href="/produits" className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] transition hover:text-water-300">
              Produits
            </Link>
            <span aria-hidden="true" className="mx-2 text-soil-600">/</span>
            <span className="text-soil-200">{product.name}</span>
          </nav>
        </div>
      </section>

      <section className="bg-soil-50 pb-12 pt-6 sm:pt-8">
        <div className="mx-auto max-w-7xl px-4">
          <Link
            href="/produits"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-soil-500 transition hover:text-water-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </Link>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <Gallery
                slug={product.slug}
                productName={product.name}
                images={[
                  { src: product.image, alt: product.imageAlt, blurDataURL: product.imageBlurDataURL },
                  ...product.gallery.map((image) => ({ src: image.src, alt: image.alt, blurDataURL: image.blurDataURL, contain: false })),
                ]}
              />
              <p className="mt-2 text-right text-[11px] text-soil-500">Photos non contractuelles</p>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-water-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-water-700">
                  {product.categoryLabel}
                </span>
                {product.badge ? (
                  <span className="rounded-full bg-field-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-soil-900 sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-soil-600 sm:text-base">
                {product.description}
              </p>

              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-field-700">
                <span className="h-2 w-2 rounded-full bg-field-500" />
                {product.stock}
              </p>

              {product.specs.length > 0 ? (
                <table className="mt-4 w-full overflow-hidden rounded-2xl border border-soil-200 bg-white text-sm">
                  <caption className="sr-only">Caractéristiques de {product.name}</caption>
                  <tbody className="divide-y divide-soil-100">
                    {product.specs.map((spec) => (
                      <tr key={spec.label}>
                        <th scope="row" className="px-4 py-3 text-left font-normal text-soil-500">
                          {spec.label}
                        </th>
                        <td className="px-4 py-3 text-right font-semibold text-soil-900">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mt-4 rounded-2xl border border-soil-200 bg-white px-4 py-3 text-sm text-soil-600">
                  Caractéristiques détaillées sur demande : posez votre question sur WhatsApp.
                </p>
              )}

              <div className="mt-4">
                <ProductQuote product={{ slug: product.slug, name: product.name }} />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {assurances.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-2 rounded-xl border border-soil-200 bg-white px-3 py-2.5"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-water-600" />
                      <div>
                        <p className="text-[11px] font-semibold text-soil-900">
                          {item.title}
                        </p>
                        <p className="text-[10px] leading-snug text-soil-500">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-water-700">
              Aide au choix
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-soil-900 sm:text-3xl">
              Le bon matériel, dimensionné pour votre parcelle
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-soil-600">
              Puissance, débit et hauteur manométrique doivent être cohérents
              avec votre réseau. Trois informations suffisent pour vous proposer
              la configuration juste.
            </p>

            <ul className="mt-5 grid gap-3">
              {choiceCriteria.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-soil-600"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-water-50 text-water-700">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-soil-200 bg-soil-50 p-5 sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-field-900 text-water-300">
              <Headset className="h-5 w-5" />
            </span>
            <p className="mt-3 text-base font-semibold text-soil-900">
              Besoin d’un conseil technique ?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-soil-600">
              Nous vous aidons à valider le modèle et les raccords adaptés à
              votre installation avant commande.
            </p>
            <WhatsAppServerLink
              source="fiche-produit"
              message={generalMessage()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
            >
              <WhatsApp className="h-4 w-4" />
              Poser une question
            </WhatsAppServerLink>
            <Link
              href={catalogHref({ gamme: product.category })}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-soil-300 bg-white px-4 py-3 text-sm font-semibold text-soil-900 transition hover:border-water-300"
            >
              Voir les produits de cette gamme
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-soil-200/70 bg-soil-50 py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-soil-900 sm:text-3xl">
                Dans la même gamme
              </h2>
              <Link
                href={catalogHref({ gamme: product.category })}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-soil-900 transition hover:text-water-700"
              >
                Tout voir
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {related.map((item, index) => (
                <ProductCard key={item.slug} product={item} sizes={CARD_SIZES.grid} reveal={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <JsonLd data={productJsonLd(product, siteConfig.siteUrl)} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "Accueil", path: "/" },
            { name: "Produits", path: "/produits" },
            { name: product.name, path: `/produits/${product.slug}` },
          ],
          siteConfig.siteUrl,
        )}
      />
      <StickyBar product={product} />
    </>
  );
}

function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="bg-field-900 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-3 w-64 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="h-80 animate-pulse rounded-3xl bg-white/70" />
          <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded bg-soil-200" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-soil-200" />
            <div className="h-4 w-full animate-pulse rounded bg-soil-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
        <span className="sr-only">Chargement de la fiche produit…</span>
      </div>
    </div>
  );
}
