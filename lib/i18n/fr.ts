/** Textes français (langue par défaut du site). */
export const fr = {
  addToQuote: "Ajouter au devis",
  added: "Ajouté",
  myQuoteList: "Ma liste de devis",
  sendOnWhatsapp: "Envoyer sur WhatsApp",
  emptyList: "Votre liste est vide.",
  catalog: "Catalogue",
  contact: "Contact",
  home: "Accueil",
  freeQuote: "Devis gratuit sur WhatsApp",
  nationwideDelivery: "Livraison partout au Maroc",
  technicalAdvice: "Conseil technique",
  quoteWithin24h: "Devis sous 24 h",
  offline: "Vous êtes hors ligne",
  retry: "Réessayer",
  whatsappGeneral: (brand: string) =>
    `Bonjour ${brand} 👋, je souhaite un devis pour du matériel d'irrigation / de pompage. Pouvez-vous m'aider ?`,
};

export type Dictionary = typeof fr;
