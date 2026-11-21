"use client";

import { createContext, useContext, type ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";

/** Coordonnées des réglages de l'admin utiles aux composants client. */
type SiteContact = {
  number: string;
  brandName: string;
  phoneDisplay: string;
  phoneRaw: string;
  address: string;
};

const WhatsappContext = createContext<SiteContact>({
  number: siteConfig.whatsappNumber,
  brandName: siteConfig.name,
  phoneDisplay: siteConfig.phoneDisplay,
  phoneRaw: siteConfig.phoneRaw,
  address: siteConfig.address,
});

/**
 * Coordonnées des réglages de l'admin (repli : variables d'env), fournies depuis
 * le layout racine à tous les liens WhatsApp, à la liste de devis, à l'en-tête
 * et aux boutons d'appel.
 */
export function WhatsappProvider({ children, ...contact }: SiteContact & { children: ReactNode }) {
  return <WhatsappContext.Provider value={contact}>{children}</WhatsappContext.Provider>;
}

export function useWhatsappContact(): SiteContact {
  return useContext(WhatsappContext);
}
