/** Textes français (langue par défaut du site). */
export const fr = {
  // Liste de devis et commun
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

  // En-tête et menus
  navHome: "Accueil",
  navProducts: "Produits",
  navCategories: "Catégories",
  navServices: "Services",
  navContact: "Contact",
  topbarLong: "Conseil technique & devis sous 24h",
  topbarShort: "Devis sous 24h",
  searchPlaceholder: "Pompe, raccord, Ø…",
  searchMobilePlaceholder: "Rechercher un produit…",
  searchLabel: "Rechercher un produit",
  searchSubmit: "Lancer la recherche",
  searchOk: "OK",
  quoteWhatsapp: "Devis WhatsApp",
  requestQuote: "Demander un devis",
  openMenu: "Ouvrir le menu",
  menu: "Menu",
  homeLabel: "Saqia — accueil",
  languageSwitch: "Changer de langue",

  // Carrousel de l'accueil
  slogan: "L’eau au bon endroit.",
  hero1Text:
    "Pompes, raccords et kits d'irrigation pour les exploitations du Maroc. Composez votre liste, envoyez-la sur WhatsApp et recevez votre devis.",
  heroCtaWhatsapp: "Demander un devis sur WhatsApp",
  heroCtaCatalog: "Voir le catalogue",
  hero2Title: "Le pompage agricole, bien dimensionné.",
  hero2Text:
    "Pompes immergées, centrifuges et motopompes pour forages, puits et bassins. Nous vous aidons à choisir le bon débit et la bonne hauteur.",
  hero2Cta: "Voir les pompes",
  hero3Title: "Serres et réseaux sous pression.",
  hero3Text:
    "Raccords PE/PVC, vannes et accessoires pour des réseaux d'irrigation étanches, du forage jusqu'à la serre.",
  hero3Cta: "Voir les raccords",
  sliderLabel: "Présentation de Saqia",
  slidePrev: "Diapositive précédente",
  slideNext: "Diapositive suivante",
  slidePause: "Mettre en pause le défilement",
  slidePlay: "Relancer le défilement",
  slideGoto: "Aller à la diapositive",
  mobileFreeQuote: "Devis gratuit sur WhatsApp",

  // Textes avec valeur
  heroCount: (count: number) => `${count} références en ligne, devis gratuit.`,
  slideOf: (index: number, total: number) => `${index} sur ${total}`,
  whatsappGeneral: (brand: string) =>
    `Bonjour ${brand} 👋, je souhaite un devis pour du matériel d'irrigation / de pompage. Pouvez-vous m'aider ?`,
};

export type Dictionary = typeof fr;

/** Clés dont la valeur est un texte simple (utilisables avec <T k="…" />). */
export type TextKey = {
  [K in keyof Dictionary]: Dictionary[K] extends string ? K : never;
}[keyof Dictionary];
