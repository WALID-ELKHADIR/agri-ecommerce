import Image from "next/image";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Headset, Truck, WhatsApp, Clock } from "@/components/icons";
import { CARD_SIZES, ProductCard } from "@/components/product-card";
import { WhatsAppServerLink } from "@/components/whatsapp-server-link";
import { AMBIANCE_IMAGES } from "@/lib/ambiance-images";
import type { Category, Product } from "@/lib/catalog";
import { catalogHref } from "@/lib/catalog-query";
import { generalMessage } from "@/lib/whatsapp";

const wrap = "mx-auto max-w-7xl px-4";

/** Rang dans une cascade d'apparition (70 ms par rang, voir app/globals.css). */
function rank(index: number): CSSProperties {
  return { "--i": index % 8 } as CSSProperties;
}
const sectionTitle = "font-display text-3xl font-semibold tracking-tight text-soil-900 text-balance sm:text-4xl";

/** Trois engagements écrits par le propriétaire : rien d'autre. */
export function Reassurance() {
  const items = [
    { icon: Truck, title: "Livraison partout au Maroc", text: "Expédition vers votre ville ou votre exploitation." },
    { icon: Headset, title: "Conseil technique", text: "Aide au choix de la pompe et des raccords." },
    { icon: Clock, title: "Devis sous 24 h", text: "Réponse sur WhatsApp avec prix et disponibilité." },
  ];
  return (
    <section aria-label="Nos engagements" className="border-b border-soil-200 bg-white">
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

export function CategoryCards({ ranges }: { ranges: Range[] }) {
  return (
    <section id="categories" className="scroll-mt-20 bg-soil-50 py-16 sm:py-20">
      <div className={wrap}>
        <div className="flex items-end justify-between gap-4">
          <h2 data-reveal="" className={sectionTitle}>Nos gammes</h2>
          <Link href="/produits" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-soil-900 hover:text-water-700">
            Tout le catalogue
            <ArrowRight className="h-4 w-4" />
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
                  <span className="block font-display text-lg font-semibold leading-tight sm:text-xl">{category.label}</span>
                  <span className="text-sm opacity-80">
                    {count} référence{count > 1 ? "s" : ""}
                  </span>
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
export function FeaturedCarousel({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="featured-title">
      <div className={wrap}>
        <h2 id="featured-title" data-reveal="" className={sectionTitle}>
          Sélection du moment
        </h2>
        <p className="mt-2 max-w-xl text-soil-600">Faites glisser pour parcourir, puis ajoutez à votre liste de devis.</p>
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
export function HowItWorks() {
  const steps = [
    { title: "Choisissez vos produits", text: "Parcourez le catalogue et ajoutez pompes, raccords ou kits à votre liste de devis, avec les quantités." },
    { title: "Envoyez la liste sur WhatsApp", text: "Un seul message, déjà rédigé, avec tous vos produits. Ajoutez votre nom et votre ville si vous le souhaitez." },
    { title: "Recevez votre devis", text: "Nous vous répondons sous 24 h avec les prix, la disponibilité et des conseils pour votre installation." },
  ];
  return (
    <section id="services" className="scroll-mt-20 bg-field-900 py-16 text-white sm:py-20">
      <div className={wrap}>
        <h2 data-reveal="" className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Comment ça marche</h2>
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
export function Showcase({ productCount, rangeCount }: { productCount: number; rangeCount: number }) {
  const photo = AMBIANCE_IMAGES.goutteAGoutte;
  const facts = [
    { value: String(productCount), countTo: productCount, label: "références en ligne" },
    { value: String(rangeCount), countTo: rangeCount, label: "gammes de matériel" },
    { value: "0 DH", countTo: undefined, label: "pour un devis" },
  ];
  return (
    <section className="bg-soil-50 py-16 sm:py-20">
      <div className={`${wrap} grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14`}>
        <div data-reveal="" className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-[5/4]">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 55vw, 100vw"
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            className="parallax object-cover"
          />
        </div>
        <div data-reveal="" style={rank(1)}>
          <h2 className={sectionTitle}>Du forage à la goutte</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-soil-700">
            Pompes immergées et centrifuges, raccords PE et PVC, accessoires de pompage et d&apos;arrosage : de quoi
            équiper une installation complète, du point d&apos;eau jusqu&apos;aux rangées de cultures.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-soil-300 pt-6">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd data-count-to={fact.countTo} className="font-display text-3xl font-semibold tabular-nums text-field-800 sm:text-4xl">
                  {fact.value}
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

/** Réponses limitées à ce qui est confirmé (devis gratuit, WhatsApp, livraison au Maroc, conseil). */
const FAQ = [
  {
    q: "Comment demander un devis ?",
    a: "Ajoutez les produits qui vous intéressent à votre liste de devis, puis envoyez-la sur WhatsApp en un clic. Vous pouvez aussi nous écrire directement sur WhatsApp depuis n'importe quelle page.",
  },
  { q: "Le devis est-il payant ?", a: "Non, le devis est gratuit." },
  {
    q: "Livrez-vous partout au Maroc ?",
    a: "Oui, nous livrons partout au Maroc. Indiquez votre ville dans votre demande : nous vous précisons les conditions de livraison avec le devis.",
  },
  {
    q: "Pouvez-vous m'aider à choisir ma pompe ?",
    a: "Oui. Décrivez votre besoin sur WhatsApp (profondeur du forage ou du puits, débit souhaité, surface à irriguer, alimentation électrique) et nous vous conseillons le matériel adapté.",
  },
  {
    q: "Comment demander plusieurs produits à la fois ?",
    a: "Utilisez le bouton « Ajouter au devis » sur chaque produit. Votre liste reste enregistrée sur votre appareil ; ouvrez-la depuis l'icône en haut de la page pour ajuster les quantités et l'envoyer.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className={sectionTitle}>Questions fréquentes</h2>
        <div data-reveal="" className="mt-8 divide-y divide-soil-200 border-y border-soil-200">
          {FAQ.map((item) => (
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

export function FinalCta({ brandName }: { brandName: string }) {
  const message = generalMessage(brandName);
  return (
    <section className="bg-water-50 py-16 sm:py-20">
      <div className={`${wrap} flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between`}>
        <div data-reveal="" className="max-w-xl">
          <h2 className={sectionTitle}>Un projet d&apos;irrigation ou de pompage ?</h2>
          <p className="mt-3 text-soil-700">Décrivez-le sur WhatsApp : vous recevez un devis gratuit sous 24 h.</p>
        </div>
        <WhatsAppServerLink
          source="accueil-cta"
          message={message}
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-whatsapp px-6 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
        >
          <WhatsApp className="h-4 w-4" />
          Écrire sur WhatsApp
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

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={wrap}>
        <h2 className={sectionTitle}>Ils nous font confiance</h2>
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
