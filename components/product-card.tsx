import Image from "next/image";
import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import { WhatsApp } from "@/components/icons";
import { AddToQuoteButton } from "@/components/quote-list/add-to-quote-button";
import { WhatsAppServerLink } from "@/components/whatsapp-server-link";
import { productMessage, type Product } from "@/lib/catalog";
import { cn } from "@/lib/cn";

/** `sizes` des cartes selon leur contexte (largeurs réelles des colonnes). */
export const CARD_SIZES = {
  grid: "(min-width: 1280px) 280px, (min-width: 768px) 33vw, 50vw",
  carousel: "(min-width: 768px) 280px, 72vw",
} as const;

type ProductCardProps = {
  product: Product;
  sizes: string;
  /** Carte visible dès le chargement (première rangée) : image chargée en priorité. */
  priority?: boolean;
  /** Rang dans la cascade d'apparition ; absent pour une carte visible au chargement. */
  reveal?: number;
  className?: string;
};

/**
 * Carte produit rendue par le serveur. Seuls le bouton « Ajouter au devis » et
 * le lien WhatsApp (qui enregistre le clic) sont interactifs.
 */
export function ProductCard({ product, sizes, priority = false, reveal, className }: ProductCardProps) {
  const second = product.gallery[0];
  const message = productMessage(product);

  return (
    <article
      data-tilt=""
      data-reveal={reveal === undefined ? undefined : ""}
      style={reveal === undefined ? undefined : ({ "--i": reveal % 8 } as CSSProperties)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-soil-200 bg-white shadow-sm transition duration-300",
        "hover:-translate-y-0.5 hover:border-water-200 hover:shadow-lg hover:shadow-field-900/15 active:scale-[0.98] motion-reduce:transform-none",
        className,
      )}
    >
      <Link
        href={`/produits/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gradient-to-br from-soil-50 via-white to-water-50/60"
        aria-label={`Voir la fiche de ${product.name}`}
      >
        {/* Même nom que la 1re image de la fiche : l'image glisse de la carte à la fiche. */}
        <ViewTransition name={`produit-${product.slug}`} share="morph" default="none">
          <span className="absolute inset-0 block">
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              sizes={sizes}
              preload={priority}
              placeholder={product.imageBlurDataURL ? "blur" : "empty"}
              blurDataURL={product.imageBlurDataURL}
              className="object-contain p-4 transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
            />
          </span>
        </ViewTransition>
        {second ? (
          <Image
            src={second.src}
            alt=""
            fill
            sizes={sizes}
            loading="lazy"
            className="hidden object-cover opacity-0 transition duration-500 group-hover:opacity-100 motion-reduce:transition-none md:block"
          />
        ) : null}
        {product.badge ? (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-field-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-water-700">{product.categoryLabel}</p>
        <h3 className="mt-1 text-sm font-semibold leading-snug text-soil-900 sm:text-base">
          <Link href={`/produits/${product.slug}`} className="hover:text-water-700">
            {product.name}
          </Link>
        </h3>

        {product.specs.length > 0 ? (
          <ul className="mt-2 grid gap-0.5 text-[11px] text-soil-600 sm:text-xs">
            {product.specs.slice(0, 3).map((spec) => (
              <li key={spec.label} className="truncate">
                {spec.label} : <span className="font-medium text-soil-800">{spec.value}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-field-700">
          <span className="h-1.5 w-1.5 rounded-full bg-field-500" />
          {product.stock}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-3">
          <AddToQuoteButton product={{ slug: product.slug, name: product.name }} size="sm" className="flex-1" />
          <WhatsAppServerLink
            source="carte-produit"
            message={message}
            product={{ slug: product.slug, quantity: 1 }}
            aria-label={`Demander un devis WhatsApp pour ${product.name}`}
            className="inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white transition hover:bg-whatsapp-hover sm:min-h-9 sm:w-9"
          >
            <WhatsApp className="h-4 w-4" />
          </WhatsAppServerLink>
        </div>
      </div>
    </article>
  );
}
