import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Headset,
  ShieldCheck,
  Truck,
  WhatsApp,
} from "@/components/icons";
import { MobileCta } from "@/components/mobile-cta";
import { ProductCard } from "@/components/product-card";
import { ProductQuote } from "@/components/product-quote";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { generalMessage, whatsappLink } from "@/lib/catalog";
import {
  getCatalog,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/catalog-data";

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
    return { title: "Produit introuvable | AgriFlow" };
  }

  return {
    title: `${product.name} — ${product.categoryLabel} | AgriFlow`,
    description: product.description,
  };
}

const assurances = [
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

      <SiteFooter />
      <MobileCta />
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
      <section className="relative overflow-hidden bg-[#0A2540]">
        <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <nav aria-label="Fil d'Ariane" className="text-xs text-slate-400">
            <Link href="/" className="transition hover:text-cyan-300">
              Accueil
            </Link>
            <span className="mx-2 text-slate-600">/</span>
            <Link href="/produits" className="transition hover:text-cyan-300">
              Produits
            </Link>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-slate-200">{product.name}</span>
          </nav>
        </div>
      </section>

      <section className="bg-[#f5f8fb] pb-12 pt-6 sm:pt-8">
        <div className="mx-auto max-w-7xl px-4">
          <Link
            href="/produits"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-cyan-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </Link>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-64 bg-gradient-to-br from-slate-50 via-white to-cyan-50/60 sm:h-80 lg:h-[26rem]">
                <Image
                  src={product.image}
                  alt={product.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-contain p-8 sm:p-10"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {product.stock}
                </span>
                <span className="text-[11px] text-slate-400">
                  Photos non contractuelles
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                  {product.categoryLabel}
                </span>
                {product.badge ? (
                  <span className="rounded-full bg-[#0A2540] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#0A2540] sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                {product.description}
              </p>

              <dl className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <dt className="text-slate-500">{spec.label}</dt>
                    <dd className="text-right font-semibold text-[#0A2540]">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4">
                <ProductQuote product={product} />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {assurances.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                      <div>
                        <p className="text-[11px] font-semibold text-[#0A2540]">
                          {item.title}
                        </p>
                        <p className="text-[10px] leading-snug text-slate-500">
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Aide au choix
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0A2540] sm:text-3xl">
              Le bon matériel, dimensionné pour votre parcelle
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Puissance, débit et hauteur manométrique doivent être cohérents
              avec votre réseau. Trois informations suffisent pour vous proposer
              la configuration juste.
            </p>

            <ul className="mt-5 grid gap-3">
              {choiceCriteria.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-slate-600"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#f5f8fb] p-5 sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A2540] text-cyan-300">
              <Headset className="h-5 w-5" />
            </span>
            <p className="mt-3 text-base font-semibold text-[#0A2540]">
              Besoin d’un conseil technique ?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Un technicien vous aide à valider le modèle, les raccords et la
              protection électrique avant commande.
            </p>
            <a
              href={whatsappLink(generalMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1FA855] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#178f47]"
            >
              <WhatsApp className="h-4 w-4" />
              Poser une question
            </a>
            <Link
              href="/produits"
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#0A2540] transition hover:border-cyan-300"
            >
              Voir les produits de cette gamme
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-slate-200/70 bg-[#f5f8fb] py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] sm:text-3xl">
                Dans la même gamme
              </h2>
              <Link
                href="/produits"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#0A2540] transition hover:text-cyan-700"
              >
                Tout voir
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="bg-[#0A2540] py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-3 w-64 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="h-80 animate-pulse rounded-3xl bg-white/70" />
          <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
        <span className="sr-only">Chargement de la fiche produit…</span>
      </div>
    </div>
  );
}
