import Image from "next/image";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Headset, Truck, WhatsApp, Clock } from "@/components/icons";
import { Counter } from "@/components/home/counter";
import { CARD_SIZES, ProductCard } from "@/components/product-card";
import { WhatsAppServerLink } from "@/components/whatsapp-server-link";
import { AMBIANCE_IMAGES } from "@/lib/ambiance-images";
import type { Category, Product } from "@/lib/catalog";
import { catalogHref } from "@/lib/catalog-query";
import { getDictionary } from "@/lib/i18n/server";

const wrap = "mx-auto max-w-7xl px-4";

/** Rang dans une cascade d'apparition (70 ms par rang, voir app/globals.css). */
function rank(index: number): CSSProperties {
  return { "--i": index % 8 } as CSSProperties;
}
const sectionTitle = "font-display text-3xl font-semibold tracking-tight text-soil-900 text-balance sm:text-4xl";

/** Trois engagements écrits par le propriétaire : rien d'autre. */
export async function Reassurance() {
  const t = (await getDictionary()).homePage;
  const icons = [Truck, Headset, Clock];
  const items = t.commitmentItems.map((item, index) => ({ ...item, icon: icons[index] }));
  return (
    <section aria-label={t.commitments} className="border-b border-soil-200 bg-white">
      <ul className={`${wrap} grid gap-5 py-7 sm:grid-cols-3 sm:gap-8`}>
        {items.map(({ icon: Icon, title, text }, index) => (
          <li key={title} data-reveal="" style={rank(index)} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-water-600" />
            <div>
              <p className="text-sm font-semibold text-soil-900">{title}</p>
              <p className="text-sm text-soil-600">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Range = { category: Category; count: number; image: { src: string; alt: string; contain: boolean } };

/** Gammes du catalogue : image choisie dans l'admin, sinon photo du produit phare de la gamme. */
export function rangesFor(categories: Category[], products: Product[]): Range[] {
  return categories
    .filter((category) => category.id !== "all")
    .map((category) => {
      const inRange = products.filter((product) => product.category === category.id);
      const lead = inRange.find((product) => product.featured && !product.imagePlaceholder) ?? inRange.find((p) => !p.imagePlaceholder) ?? inRange[0];
      const image = category.imageUrl
        ? { src: category.imageUrl, alt: category.label, contain: false }
        : category.id === "arrosage"
          ? { src: AMBIANCE_IMAGES.categorieArrosage.src, alt: AMBIANCE_IMAGES.categorieArrosage.alt, contain: false }
          : lead
            ? { src: lead.image, alt: lead.imageAlt, contain: true }
            : null;
      return image ? { category, count: inRange.length, image } : null;
    })
    .filter((range): range is Range => range !== null && range.count > 0);
}

export async function CategoryCards({ ranges }: { ranges: Range[] }) {
  const t = (await getDictionary()).homePage;
  return (
    <section id="categories" className="scroll-mt-20 bg-soil-50 py-16 sm:py-20">
      <div className={wrap}>
        <div className="flex items-end justify-between gap-4">
          <h2 data-reveal="" className={sectionTitle}>{t.rangesTitle}</h2>
          <Link href="/produits" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-soil-900 hover:text-water-700">
            {t.allCatalog}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {ranges.map(({ category, count, image }, index) => (
            <li key={category.id} data-reveal="" style={rank(index)}>
              <Link
                href={catalogHref({ gamme: category.id })}
                className="group relative flex h-full min-h-44 flex-col justify-end overflow-hidden rounded-2xl bg-white sm:min-h-56"
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className={
                    image.contain
                      ? "object-contain p-4 pb-16 transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                      : "parallax object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  }
                />
                <span
                  aria-hidden="true"
                  className={image.contain ? "absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/90" : "absolute inset-0 bg-gradient-to-t from-field-900/80 via-field-900/10"}
                />
                <span className={`relative p-4 ${image.contain ? "text-soil-900" : "text-white"}`}>
                  <span className="block font-display text-lg font-semibold leading-tight sm:text-xl"><bdi>{category.label}</bdi></span>
                  <span className="text-sm opacity-80">{t.references(count)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Produits mis en avant : défilement horizontal natif (scroll-snap), sans JavaScript. */
export async function FeaturedCarousel({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const t = (await getDictionary()).homePage;
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="featured-title">
      <div className={wrap}>
        <h2 id="featured-title" data-reveal="" className={sectionTitle}>
          {t.featuredTitle}
        </h2>
        <p className="mt-2 max-w-xl text-soil-600">{t.featuredText}</p>
      </div>
      <ul className="mx-auto mt-8 flex max-w-7xl snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-4 sm:gap-4">
        {products.map((product) => (
          <li key={product.slug} className="w-[72vw] shrink-0 snap-start sm:w-[280px]">
            <ProductCard product={product} sizes={CARD_SIZES.carousel} className="h-full" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Vraie séquence (choisir → envoyer → recevoir) : la numérotation est justifiée. */
export async function HowItWorks() {
  const t = (await getDictionary()).homePage;
  const steps = t.steps;
  return (
    <section id="services" className="scroll-mt-20 bg-field-900 py-16 text-white sm:py-20">
      <div className={wrap}>
        <h2 data-reveal="" className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.howTitle}</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} data-reveal="" style={rank(index)} className="relative border-t border-white/20 pt-6">
              <span className="font-display text-5xl font-semibold text-water-300/90">{index + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Mise en situation : chiffres tirés du catalogue lui-même, aucun chiffre inventé. */
export async function Showcase({ productCount, rangeCount }: { productCount: number; rangeCount: number }) {
  const t = (await getDictionary()).homePage;
  const photo = AMBIANCE_IMAGES.goutteAGoutte;
  const facts = [
    { value: String(productCount), countTo: productCount, label: t.factReferences },
    { value: String(rangeCount), countTo: rangeCount, label: t.factRanges },
    { value: t.factQuoteValue, countTo: undefined, label: t.factQuote },
  ];
  return (
    <section className="bg-soil-50 py-16 sm:py-20">
      <div className={`${wrap} grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14`}>
        <div data-reveal="" className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-[5/4]">
          <Image
            src={photo.src}
            alt={t.showcaseAlt}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 55vw, 100vw"
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            className="parallax object-cover"
          />
        </div>
        <div data-reveal="" style={rank(1)}>
          <h2 className={sectionTitle}>{t.showcaseTitle}</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-soil-700">{t.showcaseText}</p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-soil-300 pt-6">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums text-field-800 sm:text-4xl">
                  {fact.countTo === undefined ? fact.value : <Counter to={fact.countTo} />}
                </dd>
                <dd className="mt-1 text-xs text-soil-600 sm:text-sm">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/** Réponses limitées à ce qui est confirmé (lib/i18n : devis gratuit, WhatsApp, livraison au Maroc, conseil). */
export async function Faq() {
  const t = (await getDictionary()).homePage;
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className={sectionTitle}>{t.faqTitle}</h2>
        <div data-reveal="" className="mt-8 divide-y divide-soil-200 border-y border-soil-200">
          {t.faq.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-semibold text-soil-900 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="text-2xl font-normal leading-none text-water-600 transition group-open:rotate-45 motion-reduce:transition-none">
                  +
                </span>
              </summary>
              <p className="pb-5 leading-relaxed text-soil-700">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function FinalCta({ brandName }: { brandName: string }) {
  const dictionary = await getDictionary();
  const t = dictionary.homePage;
  const message = dictionary.whatsappGeneral(brandName);
  return (
    <section className="bg-water-50 py-16 sm:py-20">
      <div className={`${wrap} flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between`}>
        <div data-reveal="" className="max-w-xl">
          <h2 className={sectionTitle}>{t.finalTitle}</h2>
          <p className="mt-3 text-soil-700">{t.finalText}</p>
        </div>
        <WhatsAppServerLink
          source="accueil-cta"
          message={message}
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-whatsapp px-6 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
        >
          <WhatsApp className="h-4 w-4" />
          {t.finalCta}
        </WhatsAppServerLink>
      </div>
    </section>
  );
}

/**
 * Témoignages : aucun contenu réel fourni pour l'instant. La section n'est pas
 * affichée tant que la liste est vide (aucun avis inventé).
 */
const TESTIMONIALS: { quote: string; author: string; place: string }[] = [];

export async function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  const t = (await getDictionary()).homePage;
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={wrap}>
        <h2 className={sectionTitle}>{t.testimonialsTitle}</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <li key={item.author} className="rounded-2xl border border-soil-200 p-5">
              <blockquote className="text-soil-800">« {item.quote} »</blockquote>
              <p className="mt-3 text-sm font-semibold text-soil-900">
                {item.author}, {item.place}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
