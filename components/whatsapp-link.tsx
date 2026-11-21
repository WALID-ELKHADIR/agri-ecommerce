"use client";

import type { ReactNode } from "react";
import { useWhatsappContact } from "@/components/whatsapp-provider";
import { saveQuoteRequest } from "@/lib/actions/quotes";
import { clickRecord, type QuoteSource } from "@/lib/quote-sources";
import { whatsappLink } from "@/lib/whatsapp";

type WhatsAppLinkProps = {
  source: QuoteSource;
  /** Texte envoyé sur WhatsApp, enregistré comme contenu de la demande. */
  message: string;
  product?: { slug: string; quantity: number };
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

/**
 * Lien WhatsApp vers le numéro des réglages de l'admin, qui enregistre chaque
 * clic dans `quote_requests`. L'enregistrement part en arrière-plan : le lien
 * s'ouvre toujours, sans attendre le serveur (réseau lent, hors ligne, limite de débit).
 */
export function WhatsAppLink({ source, message, product, className, children, ...rest }: WhatsAppLinkProps) {
  const { number } = useWhatsappContact();
  return (
    <a
      href={whatsappLink(message, number)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={rest["aria-label"]}
      onClick={() => {
        void saveQuoteRequest(clickRecord(source, message, product)).catch(() => {});
      }}
    >
      {children}
    </a>
  );
}
