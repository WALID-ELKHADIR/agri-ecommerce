/**
 * Emplacement : suivi de l'entonnoir de conversion (non branché).
 * Les clics WhatsApp sont déjà enregistrés dans quote_requests (colonne source) ;
 * ces étapes compléteront le suivi sans outil tiers. Voir docs/evolutions.md.
 */
export const FUNNEL_STEPS = ["visite", "fiche-vue", "ajout-devis", "liste-ouverte", "whatsapp"] as const;
export type FunnelStep = (typeof FUNNEL_STEPS)[number];
