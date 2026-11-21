"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Gauge,
  Headset,
  Layers,
  MapPin,
  Phone,
  Pipe,
  ShieldCheck,
  Truck,
  WhatsApp,
  Wrench,
} from "@/components/icons";
import { MobileCta } from "@/components/mobile-cta";
import { CARD_SIZES, ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { catalogHref } from "@/lib/catalog-query";
import {
  BRAND,
  galleryImages,
  generalMessage,
  whatsappLink,
  type GalleryImage,
  type Product,
} from "@/lib/catalog";
import type { SiteConfig } from "@/lib/site-config";

function buildFamilies(products: Product[]) {
  return [
    {
      id: "pompes",
      title: "Pompes & motopompes",
      description:
        "Centrifuges, immergées 4\" et 6\", haute pression et motopompes inox.",
      icon: Gauge,
      count: products.filter((product) => product.category === "pompes").length,
    },
    {
      id: "raccords",
      title: "Raccords & fittings",
      description:
        "Compression PE, PVC pression, coudes filetés et pièces de réseau.",
      icon: Pipe,
      count: products.filter((product) => product.category === "raccords").length,
    },
    {
      id: "kits",
      title: "Kits complets",
      description:
        "Pompe, coffret de commande et câble : des ensembles prêts à installer.",
      icon: Layers,
      count: products.filter((product) => product.category === "kits").length,
    },
  ];
}

const services = [
  {
    icon: Gauge,
    title: "Dimensionnement",
    text: "Calcul du débit, de la HMT et du diamètre de réseau pour choisir le matériel juste.",
  },
  {
    icon: Wrench,
    title: "Conseil & installation",
    text: "Schémas de réseau, raccords adaptés et accompagnement technique à la pose.",
  },
  {
    icon: Truck,
    title: "Stock & livraison",
    text: "Références disponibles en stock et expédition partout au Maroc.",
  },
  {
    icon: ShieldCheck,
    title: "SAV & garantie",
    text: "Pièces de rechange, maintenance et garantie constructeur sur la gamme.",
  },
];

const heroFamilies = [
  "Pompes immergées",
  "Pompes de surface",
  "Raccords PE & PVC",
  "Kits & accessoires",
];

export function HomePage({ products, settings }: { products: Product[]; settings: SiteConfig }) {
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const families = buildFamilies(products);

  return (
    <>
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        {/* Hero */}
        <section id="accueil" className="relative scroll-mt-24 overflow-hidden bg-field-900">
          <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-water-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-water-400/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-12 pt-12 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10 lg:pb-16 lg:pt-20">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-water-200 backdrop-blur">
                <Gauge className="h-3.5 w-3.5" />
                Matériel d’irrigation &amp; de pompage
              </span>

              <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
                L’eau au bon endroit,
                <br />
                <span className="bg-gradient-to-r from-water-300 via-water-400 to-water-300 bg-clip-text text-transparent">
                  la pression au bon niveau.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-soil-300/90 sm:text-lg">
                Pompes centrifuges et immergées, raccords PE/PVC et kits prêts à
                installer. Du matériel professionnel, conseillé et livré partout
                au Maroc.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/produits"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-water-400 px-6 py-3.5 text-sm font-semibold text-soil-900 shadow-lg shadow-water-500/20 transition hover:bg-water-300"
                >
                  Découvrir la gamme
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappLink(generalMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <WhatsApp className="h-4 w-4 text-water-300" />
                  Demander un devis
                </a>
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-soil-300/80">
                {["Conseil technique", "Devis sous 24h", "Stock & livraison"].map(
                  (item) => (
                    <li key={item} className="inline-flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-water-400/15 text-water-300">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative rounded-3xl border border-white/10 bg-white p-4 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between gap-3 px-1 pb-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-water-700">
                      Sélection pro
                    </p>
                    <p className="text-sm font-semibold text-soil-900">
                      Pompe centrifuge monobloc
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-field-50 px-2.5 py-1 text-[10px] font-semibold text-field-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-field-500" />
                    En stock
                  </span>
                </div>

                <div className="relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-soil-50 via-white to-water-50/60 sm:h-60">
                  <Image
                    src="/images/products/pompe-centrifuge-monobloc/main.webp"
                    alt="Pompe centrifuge monobloc"
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 520px"
                    className="object-contain p-6 sm:p-8"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-soil-50 px-3.5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-white px-2 py-1 text-[10px] font-medium text-soil-600 shadow-sm">
                      0,75 – 7,5 kW
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-[10px] font-medium text-soil-600 shadow-sm">
                      60 m³/h
                    </span>
                  </div>
                  <Link
                    href="/produits"
                    className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] inline-flex items-center gap-1 text-xs font-semibold text-soil-900 transition hover:text-water-700"
                  >
                    Voir
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="absolute -right-3 top-8 animate-floaty rounded-xl border border-soil-200 bg-white p-3 shadow-xl sm:-right-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-water-50 text-water-700">
                    <Gauge className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-soil-900">
                      60 m³/h
                    </p>
                    <p className="text-[10px] text-soil-500">Débit selon modèle</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-14 left-2 animate-floaty rounded-xl border border-soil-200 bg-white p-2.5 shadow-xl [animation-delay:1.3s] sm:-left-8">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-soil-50">
                    <Image
                      src="/images/products/coude-pe-compression-90/main.webp"
                      alt="Raccord PE à compression"
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-soil-900">
                      Raccords PN16
                    </p>
                    <p className="text-[10px] text-soil-500">Ø20 – 63 mm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/10">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:grid-cols-4">
              {heroFamilies.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-soil-300/70 sm:text-xs"
                >
                  <span className="h-1 w-1 rounded-full bg-water-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Animated gallery */}
        <section className="relative overflow-hidden bg-soil-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-water-700">
                  En images
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-soil-900 sm:text-4xl">
                  Les équipements, en conditions réelles
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-soil-500 sm:text-base">
                  Pompes, raccords et installations : un aperçu du matériel que
                  nous sélectionnons et livrons.
                </p>
              </div>
              <p className="hidden shrink-0 items-center gap-2 text-xs text-soil-500 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-water-500" />
                Survolez pour mettre en pause
              </p>
            </div>
          </div>

          <div className="marquee relative mt-8 overflow-hidden">
            <div className="marquee-track flex w-max">
              {[...galleryImages, ...galleryImages].map((image, index) => (
                <GalleryCard
                  key={`${image.src}-${index}`}
                  image={image}
                  hidden={index >= galleryImages.length}
                />
              ))}
            </div>
            <div className="marquee-track-reverse mt-4 flex w-max">
              {[...galleryImages].reverse().concat([...galleryImages].reverse()).map(
                (image, index) => (
                  <GalleryCard
                    key={`reverse-${image.src}-${index}`}
                    image={image}
                    hidden={index >= galleryImages.length}
                  />
                ),
              )}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-soil-50 to-transparent sm:w-24" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-soil-50 to-transparent sm:w-24" />
          </div>
        </section>

        {/* Families */}
        <section id="categories" className="scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-water-700">
                Nos gammes
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-soil-900 sm:text-4xl">
                Tout pour votre réseau d’eau
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-soil-500 sm:text-base">
                Du forage à la parcelle : pompage, raccordement et distribution.
                Chaque gamme est disponible en plusieurs puissances et diamètres.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {families.map((family) => {
                const Icon = family.icon;
                return (
                  <Link
                    key={family.id}
                    href={catalogHref({ gamme: family.id })}
                    className="group flex flex-col rounded-2xl border border-soil-200 bg-white p-5 transition hover:-translate-y-1 hover:border-water-200 hover:shadow-lg"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-water-50 text-water-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-soil-900">
                      {family.title}
                    </h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-soil-500">
                      {family.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-soil-100 pt-3">
                      <span className="text-[11px] font-medium text-soil-500">
                        {family.count} référence{family.count > 1 ? "s" : ""}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-soil-500 transition group-hover:text-water-700" />
                    </div>
                  </Link>
                );
              })}

              <a
                href={whatsappLink(generalMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl bg-gradient-to-br from-field-900 to-water-600 p-5 text-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-water-300">
                  <Headset className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">
                  Projet sur mesure
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-white/65">
                  Tuyauterie, filtration, schéma complet : parlez-nous de votre
                  exploitation.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-[11px] font-medium text-white/55">
                    Devis personnalisé
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-water-300" />
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section className="border-y border-soil-200/70 bg-soil-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-water-700">
                  Sélection du moment
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-soil-900 sm:text-4xl">
                  Les références les plus demandées
                </h2>
              </div>
              <Link
                href="/produits"
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-soil-900 transition hover:text-water-700"
              >
                Voir tout le catalogue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.slug} product={product} sizes={CARD_SIZES.grid} />
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-water-700">
                  Services
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-soil-900 sm:text-4xl">
                  Un partenaire technique, pas seulement un fournisseur
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-soil-500 sm:text-base">
                  Un mauvais dimensionnement coûte cher : surconsommation,
                  cavitation, débit insuffisant. Notre équipe vous aide à choisir
                  juste, dès le départ.
                </p>

                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-soil-200 bg-soil-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-water-600" />
                    <div>
                      <p className="text-sm font-semibold text-soil-900">
                        Livraison nationale
                      </p>
                      <p className="text-xs text-soil-500">{BRAND.address}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${BRAND.phoneRaw}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-soil-300 bg-white px-4 py-2.5 text-sm font-semibold text-soil-900 transition hover:border-water-300"
                  >
                    <Phone className="h-4 w-4 text-water-600" />
                    Appeler
                  </a>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.title}
                      className="rounded-2xl border border-soil-200 bg-white p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-water-50 text-water-700">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-semibold tracking-[0.16em] text-field-600">
                          0{index + 1}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-soil-900">
                        {service.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-soil-500">
                        {service.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-soil-50 pb-16 sm:pb-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative overflow-hidden rounded-3xl bg-field-900 px-6 py-12 sm:px-10 sm:py-14">
              <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-water-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-water-400/10 blur-3xl" />

              <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-water-300/80">
                    Votre projet
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Un devis précis, basé sur vos besoins réels
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-soil-300/80 sm:text-base">
                    Indiquez-nous votre surface, votre débit souhaité et la
                    hauteur de refoulement. Nous revenons vers vous avec une
                    configuration adaptée et un prix ferme.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
                  <a
                    href={whatsappLink(generalMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
                  >
                    <WhatsApp className="h-4 w-4" />
                    Demander un devis
                  </a>
                  <a
                    href={`tel:${BRAND.phoneRaw}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Phone className="h-4 w-4" />
                    {BRAND.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter brand={settings} />
      <MobileCta />
    </>
  );
}

function GalleryCard({
  image,
  hidden = false,
}: {
  image: GalleryImage;
  hidden?: boolean;
}) {
  return (
    <figure
      className="relative mr-4 h-36 w-56 shrink-0 overflow-hidden rounded-xl border border-soil-200 bg-white shadow-sm sm:h-40 sm:w-64"
      aria-hidden={hidden || undefined}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="256px"
        className={image.contain ? "object-contain p-4" : "object-cover"}
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-field-900/85 via-field-900/30 to-transparent px-3 pb-2 pt-8 text-[11px] font-medium text-white">
        {image.label}
      </figcaption>
    </figure>
  );
}
