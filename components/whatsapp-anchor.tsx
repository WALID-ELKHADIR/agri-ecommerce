import type { ReactNode } from "react";
import type { QuoteSource } from "@/lib/quote-sources";
import { whatsappLink } from "@/lib/whatsapp";

export type WhatsAppAnchorProps = {
  number: string;
  source: QuoteSource;
  /** Texte envoyé sur WhatsApp, enregistré comme contenu de la demande. */
  message: string;
  product?: { slug: string; quantity: number };
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

/**
 * Lien WhatsApp rendu sans JavaScript propre. L'écouteur global
 * (components/click-tracker.tsx) lit `data-wa-*` et enregistre la demande
 * en arrière-plan : le lien s'ouvre toujours, sans attendre le serveur.
 */
export function WhatsAppAnchor({ number, source, message, product, className, children, ...rest }: WhatsAppAnchorProps) {
  return (
    <a
      href={whatsappLink(message, number)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={rest["aria-label"]}
      data-wa-source={source}
      data-wa-slug={product?.slug}
      data-wa-qty={product?.quantity}
    >
      {children}
    </a>
  );
}
