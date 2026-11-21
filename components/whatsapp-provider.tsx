"use client";

import { createContext, useContext, type ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";

type WhatsappContact = { number: string; brandName: string };

const WhatsappContext = createContext<WhatsappContact>({
  number: siteConfig.whatsappNumber,
  brandName: siteConfig.name,
});

/**
 * Numéro WhatsApp des réglages de l'admin (repli : variables d'env), fourni à
 * tous les liens et à la liste de devis depuis le layout racine.
 */
export function WhatsappProvider({ number, brandName, children }: WhatsappContact & { children: ReactNode }) {
  return <WhatsappContext.Provider value={{ number, brandName }}>{children}</WhatsappContext.Provider>;
}

export function useWhatsappContact(): WhatsappContact {
  return useContext(WhatsappContext);
}
