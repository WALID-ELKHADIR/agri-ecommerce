"use client";

import type { ReactNode } from "react";
import { WhatsAppAnchor } from "@/components/whatsapp-anchor";
import { useWhatsappContact } from "@/components/whatsapp-provider";
import type { QuoteSource } from "@/lib/quote-sources";

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
 * Lien WhatsApp pour les composants client (header, fiche) : numéro lu dans le
 * contexte des réglages. Le clic est enregistré par l'écouteur global.
 * Dans un composant serveur, utilisez directement WhatsAppAnchor.
 */
export function WhatsAppLink(props: WhatsAppLinkProps) {
  const { number } = useWhatsappContact();
  return <WhatsAppAnchor number={number} {...props} />;
}
