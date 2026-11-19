export type Category = {
  id: string;
  label: string;
  short: string;
  description: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  image: string;
  imageAlt: string;
  badge?: string;
  specs: ProductSpec[];
  stock: string;
  featured?: boolean;
};

export type GalleryImage = {
  src: string;
  alt: string;
  label: string;
  contain?: boolean;
};

export const BRAND = {
  name: "AgriFlow",
  tagline: "Irrigation & pompage agricole",
  phoneDisplay: "+212 6 00 00 00 00",
  phoneRaw: "+212600000000",
  email: "contact@agriflow.ma",
  address: "Casablanca, Maroc â€” livraison nationale",
  hours: "Lun â€“ Sam Â· 8h30 â€“ 18h30",
};

/**
 * Remplacez ce numÃ©ro par le numÃ©ro WhatsApp rÃ©el de l'entreprise.
 * Format international sans "+" ni espaces (ex: 212612345678).
 */
export const WHATSAPP_NUMBER = "212600000000";

export const categories: Category[] = [
  {
    id: "all",
    label: "Tous les produits",
    short: "Tous",
    description: "L'ensemble de notre gamme irrigation et pompage.",
  },
  {
    id: "pompes",
    label: "Pompes & motopompes",
    short: "Pompes",
    description: "Centrifuges, immergÃ©es, haute pression et motopompes.",
  },
  {
    id: "raccords",
    label: "Raccords & fittings",
    short: "Raccords",
    description: "Compression PE, PVC pression, filetÃ©s et piÃ¨ces de rÃ©seau.",
  },
  {
    id: "kits",
    label: "Kits complets",
    short: "Kits",
    description: "Ensembles prÃªts Ã  installer : pompe, coffret et cÃ¢ble.",
  },
];

export const products: Product[] = [
  {
    slug: "kit-pompe-immergee-4-pouces",
    name: "Kit pompe immergÃ©e 4\" complet",
    category: "kits",
    categoryLabel: "Kits complets",
    description:
      "Ensemble prÃªt Ã  poser pour forage ou puits : pompe immergÃ©e inox, coffret de commande et cÃ¢ble Ã©lectrique.",
    image: "/images/products/kit-pompe-immergee.jpg",
    imageAlt: "Kit de pompe immergÃ©e avec coffret de commande et cÃ¢ble",
    badge: "Pack complet",
    specs: [
      { label: "Puissance", value: "0,37 â€“ 1,5 kW" },
      { label: "Alimentation", value: "220 V mono" },
      { label: "Inclus", value: "Coffret + cÃ¢ble" },
    ],
    stock: "Disponible",
    featured: true,
  },
  {
    slug: "pompe-immergee-inox-4-pouces",
    name: "Pompe immergÃ©e inox 4\"",
    category: "pompes",
    categoryLabel: "Pompes & motopompes",
    description:
      "Pompe de forage en acier inoxydable, conÃ§ue pour l'irrigation et l'alimentation en eau sur de longues pÃ©riodes.",
    image: "/images/products/pompe-immergee-4p.jpg",
    imageAlt: "Pompe immergÃ©e inoxydable 4 pouces",
    specs: [
      { label: "Puissance", value: "0,5 â€“ 2,2 kW" },
      { label: "DÃ©bit", value: "jusqu'Ã  8 mÂ³/h" },
      { label: "DiamÃ¨tre", value: "4 pouces" },
    ],
    stock: "Disponible",
    featured: true,
  },
  {
    slug: "pompe-centrifuge-monobloc",
    name: "Pompe centrifuge monobloc",
    category: "pompes",
    categoryLabel: "Pompes & motopompes",
    description:
      "Pompe de surface robuste pour l'irrigation, le transfert d'eau et les rÃ©seaux de distribution agricoles.",
    image: "/images/products/pompe-centrifuge-monobloc.jpg",
    imageAlt: "Pompe centrifuge monobloc bleu acier",
    specs: [
      { label: "Puissance", value: "0,75 â€“ 7,5 kW" },
      { label: "Alimentation", value: "220 / 380 V" },
      { label: "DÃ©bit", value: "6 â€“ 60 mÂ³/h" },
    ],
    stock: "Disponible",
    featured: true,
  },
  {
    slug: "motopompe-centrifuge-inox",
    name: "Motopompe centrifuge inox",
    category: "pompes",
    categoryLabel: "Pompes & motopompes",
    description:
      "Corps de pompe en inox pour les eaux claires et les usages intensifs : serres, aspersion, transfert.",
    image: "/images/products/motopompe-inox.jpg",
    imageAlt: "Motopompe centrifuge avec corps en inox",
    badge: "Inox",
    specs: [
      { label: "Puissance", value: "1 â€“ 5,5 kW" },
      { label: "Corps", value: "Acier inoxydable" },
      { label: "Usage", value: "Irrigation / transfert" },
    ],
    stock: "Sur commande",
    featured: true,
  },
  {
    slug: "pompe-centrifuge-haute-pression",
    name: "Pompe centrifuge haute pression",
    category: "pompes",
    categoryLabel: "Pompes & motopompes",
    description:
      "Solution de pompage Ã  forte hauteur manomÃ©trique pour rÃ©seaux sous pression et aspersion.",
    image: "/images/products/pompe-haute-pression.jpg",
    imageAlt: "Pompe centrifuge haute pression de grande taille",
    specs: [
      { label: "Puissance", value: "2 â€“ 15 kW" },
      { label: "HMT", value: "jusqu'Ã  90 m" },
      { label: "Corps", value: "Fonte / inox" },
    ],
    stock: "Sur commande",
  },
  {
    slug: "pompe-centrifuge-fonte",
    name: "Pompe centrifuge fonte",
    category: "pompes",
    categoryLabel: "Pompes & motopompes",
    description:
      "ModÃ¨le Ã©conomique et endurant pour l'irrigation de plein champ et le transfert d'eau claire.",
    image: "/images/products/pompe-centrifuge-fonte.jpg",
    imageAlt: "Pompe centrifuge en fonte bleue",
    specs: [
      { label: "Puissance", value: "0,75 â€“ 4 kW" },
      { label: "Alimentation", value: "220 / 380 V" },
      { label: "Usage", value: "Intensif" },
    ],
    stock: "Disponible",
  },
  {
    slug: "gamme-pompes-immergees-inox",
    name: "Gamme pompes immergÃ©es inox",
    category: "pompes",
    categoryLabel: "Pompes & motopompes",
    description:
      "Gamme professionnelle 4\" et 6\" pour forages profonds, avec plusieurs puissances et dÃ©bits au choix.",
    image: "/images/products/pompes-immergees-serie.jpg",
    imageAlt: "SÃ©rie de pompes immergÃ©es inox en atelier",
    badge: "Gamme pro",
    specs: [
      { label: "DiamÃ¨tres", value: "4\" et 6\"" },
      { label: "Puissance", value: "0,5 â€“ 7,5 kW" },
      { label: "Usage", value: "Forages profonds" },
    ],
    stock: "Disponible",
    featured: true,
  },
  {
    slug: "coude-pe-compression-90",
    name: "Coude PE Ã  compression 90Â°",
    category: "raccords",
    categoryLabel: "Raccords & fittings",
    description:
      "Raccord Ã  compression pour tuyaux PE, Ã©tanchÃ©itÃ© haute pression et montage sans outil spÃ©cifique.",
    image: "/images/products/raccord-pe-90.jpg",
    imageAlt: "Coude PE Ã  compression 90 degrÃ©s noir et bleu",
    badge: "Best-seller",
    specs: [
      { label: "DiamÃ¨tre", value: "Ã˜20 â€“ 63 mm" },
      { label: "Pression", value: "PN16" },
      { label: "Montage", value: "Sans outil" },
    ],
    stock: "Disponible",
    featured: true,
  },
  {
    slug: "coude-pe-filete-male-90",
    name: "Coude PE filetÃ© mÃ¢le 90Â°",
    category: "raccords",
    categoryLabel: "Raccords & fittings",
    description:
      "Raccord de transition PE vers filetage mÃ¢le, avec inserts laiton pour une Ã©tanchÃ©itÃ© durable.",
    image: "/images/products/raccord-pe-90-metal.jpg",
    imageAlt: "Coude PE filetÃ© mÃ¢le Ã  compression",
    specs: [
      { label: "DiamÃ¨tre", value: "Ã˜20 â€“ 50 mm" },
      { label: "Filetage", value: "Laiton mÃ¢le" },
      { label: "Ã‰tanchÃ©itÃ©", value: "RenforcÃ©e" },
    ],
    stock: "Disponible",
  },
  {
    slug: "te-pvc-pression",
    name: "TÃ© PVC pression",
    category: "raccords",
    categoryLabel: "Raccords & fittings",
    description:
      "TÃ© de distribution PVC pour rÃ©seaux sous pression, assemblage par collage solvant.",
    image: "/images/products/te-pvc.jpg",
    imageAlt: "TÃ© PVC pression gris sur Ã©tabli",
    specs: [
      { label: "DiamÃ¨tre", value: "Ã˜32 â€“ 110 mm" },
      { label: "Pression", value: "PN10 / PN16" },
      { label: "Assemblage", value: "Collage solvant" },
    ],
    stock: "Disponible",
  },
  {
    slug: "coude-pe-reseau-enterre",
    name: "Coude PE pour rÃ©seau enterrÃ©",
    category: "raccords",
    categoryLabel: "Raccords & fittings",
    description:
      "Raccord PE rÃ©sistant aux UV et Ã  l'enfouissement, pensÃ© pour les rÃ©seaux d'irrigation durables.",
    image: "/images/products/raccord-pe-terrain.jpg",
    imageAlt: "Raccord PE installÃ© sur un rÃ©seau d'irrigation enterrÃ©",
    badge: "RÃ©sistant UV",
    specs: [
      { label: "DiamÃ¨tre", value: "Ã˜25 â€“ 63 mm" },
      { label: "Usage", value: "RÃ©seau enterrÃ©" },
      { label: "MatÃ©riau", value: "PE haute densitÃ©" },
    ],
    stock: "Disponible",
  },
];

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/products/pompe-centrifuge-monobloc.jpg",
    alt: "Pompe centrifuge monobloc",
    label: "Pompes centrifuges",
    contain: true,
  },
  {
    src: "/images/products/raccord-pe-terrain.jpg",
    alt: "Raccord PE sur rÃ©seau d'irrigation",
    label: "Raccords PE",
  },
  {
    src: "/images/products/kit-pompe-immergee.jpg",
    alt: "Kit pompe immergÃ©e complet",
    label: "Kits de pompage",
    contain: true,
  },
  {
    src: "/images/products/te-pvc.jpg",
    alt: "TÃ© PVC pression",
    label: "PVC pression",
  },
  {
    src: "/images/products/pompe-immergee-4p.jpg",
    alt: "Pompe immergÃ©e inox 4 pouces",
    label: "Pompes immergÃ©es",
    contain: true,
  },
  {
    src: "/images/products/raccord-pe-90.jpg",
    alt: "Coude PE Ã  compression",
    label: "Compression PE",
    contain: true,
  },
  {
    src: "/images/products/pompes-immergees-serie.jpg",
    alt: "SÃ©rie de pompes immergÃ©es inox",
    label: "Gamme professionnelle",
  },
  {
    src: "/images/products/pompe-haute-pression.jpg",
    alt: "Pompe haute pression",
    label: "Haute pression",
    contain: true,
  },
  {
    src: "/images/products/raccord-pe-90-metal.jpg",
    alt: "Coude PE filetÃ©",
    label: "Raccords filetÃ©s",
  },
  {
    src: "/images/products/motopompe-inox.jpg",
    alt: "Motopompe inox",
    label: "Motopompes inox",
    contain: true,
  },
  {
    src: "/images/products/pompes-stock.jpg",
    alt: "Stock de pompes immergÃ©es",
    label: "Stock disponible",
  },
  {
    src: "/images/products/pompe-zenith.jpg",
    alt: "Pompe centrifuge de marque",
    label: "Marques pro",
    contain: true,
  },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function generalMessage() {
  return "Bonjour AgriFlow ðŸ‘‹, je souhaite un devis pour du matÃ©riel d'irrigation / de pompage. Pouvez-vous m'aider ?";
}

export function productMessage(product: Product, quantity = 1) {
  return [
    "Bonjour AgriFlow ðŸ‘‹,",
    "Je souhaite un devis pour :",
    `â€¢ ${product.name}${quantity > 1 ? ` â€” ${quantity} unitÃ©s` : ""}`,
    ...product.specs.slice(0, 2).map((spec) => `  ${spec.label} : ${spec.value}`),
    "",
    "Merci de me communiquer le prix, la disponibilitÃ© et le dÃ©lai de livraison.",
  ].join("\n");
}

export function categoryMessage(category: Category) {
  return `Bonjour AgriFlow ðŸ‘‹, je souhaite un devis pour la gamme Â« ${category.label} Â». Pouvez-vous me conseiller ?`;
}
