import { siteConfig, whatsappUrl } from "./site-config";

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

/** Coordonnées de l'entreprise : à régler via les variables `NEXT_PUBLIC_*` (voir `.env.example`). */
export const BRAND = siteConfig;

/** Numéro WhatsApp au format international, chiffres uniquement. */
export const WHATSAPP_NUMBER = siteConfig.whatsappNumber;

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
    description: "Centrifuges, immergées, haute pression et motopompes.",
  },
  {
    id: "raccords",
    label: "Raccords & fittings",
    short: "Raccords",
    description: "Compression PE, PVC pression, filetés et pièces de réseau.",
  },
  {
    id: "kits",
    label: "Kits complets",
    short: "Kits",
    description: "Ensembles prêts à installer : pompe, coffret et câble.",
  },
];

export const products: Product[] = [
  {
    slug: "kit-pompe-immergee-4-pouces",
    name: "Kit pompe immergée 4\" complet",
    category: "kits",
    categoryLabel: "Kits complets",
    description:
      "Ensemble prêt à poser pour forage ou puits : pompe immergée inox, coffret de commande et câble électrique.",
    image: "/images/products/kit-pompe-immergee.jpg",
    imageAlt: "Kit de pompe immergée avec coffret de commande et câble",
    badge: "Pack complet",
    specs: [
      { label: "Puissance", value: "0,37 – 1,5 kW" },
      { label: "Alimentation", value: "220 V mono" },
      { label: "Inclus", value: "Coffret + câble" },
    ],
    stock: "Disponible",
    featured: true,
  },
  {
    slug: "pompe-immergee-inox-4-pouces",
    name: "Pompe immergée inox 4\"",
    category: "pompes",
    categoryLabel: "Pompes & motopompes",
    description:
      "Pompe de forage en acier inoxydable, conçue pour l'irrigation et l'alimentation en eau sur de longues périodes.",
    image: "/images/products/pompe-immergee-4p.jpg",
    imageAlt: "Pompe immergée inoxydable 4 pouces",
    specs: [
      { label: "Puissance", value: "0,5 – 2,2 kW" },
      { label: "Débit", value: "jusqu'à 8 m³/h" },
      { label: "Diamètre", value: "4 pouces" },
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
      "Pompe de surface robuste pour l'irrigation, le transfert d'eau et les réseaux de distribution agricoles.",
    image: "/images/products/pompe-centrifuge-monobloc.jpg",
    imageAlt: "Pompe centrifuge monobloc bleu acier",
    specs: [
      { label: "Puissance", value: "0,75 – 7,5 kW" },
      { label: "Alimentation", value: "220 / 380 V" },
      { label: "Débit", value: "6 – 60 m³/h" },
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
      { label: "Puissance", value: "1 – 5,5 kW" },
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
      "Solution de pompage à forte hauteur manométrique pour réseaux sous pression et aspersion.",
    image: "/images/products/pompe-haute-pression.jpg",
    imageAlt: "Pompe centrifuge haute pression de grande taille",
    specs: [
      { label: "Puissance", value: "2 – 15 kW" },
      { label: "HMT", value: "jusqu'à 90 m" },
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
      "Modèle économique et endurant pour l'irrigation de plein champ et le transfert d'eau claire.",
    image: "/images/products/pompe-centrifuge-fonte.jpg",
    imageAlt: "Pompe centrifuge en fonte bleue",
    specs: [
      { label: "Puissance", value: "0,75 – 4 kW" },
      { label: "Alimentation", value: "220 / 380 V" },
      { label: "Usage", value: "Intensif" },
    ],
    stock: "Disponible",
  },
  {
    slug: "gamme-pompes-immergees-inox",
    name: "Gamme pompes immergées inox",
    category: "pompes",
    categoryLabel: "Pompes & motopompes",
    description:
      "Gamme professionnelle 4\" et 6\" pour forages profonds, avec plusieurs puissances et débits au choix.",
    image: "/images/products/pompes-immergees-serie.jpg",
    imageAlt: "Série de pompes immergées inox en atelier",
    badge: "Gamme pro",
    specs: [
      { label: "Diamètres", value: "4\" et 6\"" },
      { label: "Puissance", value: "0,5 – 7,5 kW" },
      { label: "Usage", value: "Forages profonds" },
    ],
    stock: "Disponible",
    featured: true,
  },
  {
    slug: "coude-pe-compression-90",
    name: "Coude PE à compression 90°",
    category: "raccords",
    categoryLabel: "Raccords & fittings",
    description:
      "Raccord à compression pour tuyaux PE, étanchéité haute pression et montage sans outil spécifique.",
    image: "/images/products/raccord-pe-90.jpg",
    imageAlt: "Coude PE à compression 90 degrés noir et bleu",
    badge: "Best-seller",
    specs: [
      { label: "Diamètre", value: "Ø20 – 63 mm" },
      { label: "Pression", value: "PN16" },
      { label: "Montage", value: "Sans outil" },
    ],
    stock: "Disponible",
    featured: true,
  },
  {
    slug: "coude-pe-filete-male-90",
    name: "Coude PE fileté mâle 90°",
    category: "raccords",
    categoryLabel: "Raccords & fittings",
    description:
      "Raccord de transition PE vers filetage mâle, avec inserts laiton pour une étanchéité durable.",
    image: "/images/products/raccord-pe-90-metal.jpg",
    imageAlt: "Coude PE fileté mâle à compression",
    specs: [
      { label: "Diamètre", value: "Ø20 – 50 mm" },
      { label: "Filetage", value: "Laiton mâle" },
      { label: "Étanchéité", value: "Renforcée" },
    ],
    stock: "Disponible",
  },
  {
    slug: "te-pvc-pression",
    name: "Té PVC pression",
    category: "raccords",
    categoryLabel: "Raccords & fittings",
    description:
      "Té de distribution PVC pour réseaux sous pression, assemblage par collage solvant.",
    image: "/images/products/te-pvc.jpg",
    imageAlt: "Té PVC pression gris sur établi",
    specs: [
      { label: "Diamètre", value: "Ø32 – 110 mm" },
      { label: "Pression", value: "PN10 / PN16" },
      { label: "Assemblage", value: "Collage solvant" },
    ],
    stock: "Disponible",
  },
  {
    slug: "coude-pe-reseau-enterre",
    name: "Coude PE pour réseau enterré",
    category: "raccords",
    categoryLabel: "Raccords & fittings",
    description:
      "Raccord PE résistant aux UV et à l'enfouissement, pensé pour les réseaux d'irrigation durables.",
    image: "/images/products/raccord-pe-terrain.jpg",
    imageAlt: "Raccord PE installé sur un réseau d'irrigation enterré",
    badge: "Résistant UV",
    specs: [
      { label: "Diamètre", value: "Ø25 – 63 mm" },
      { label: "Usage", value: "Réseau enterré" },
      { label: "Matériau", value: "PE haute densité" },
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
    alt: "Raccord PE sur réseau d'irrigation",
    label: "Raccords PE",
  },
  {
    src: "/images/products/kit-pompe-immergee.jpg",
    alt: "Kit pompe immergée complet",
    label: "Kits de pompage",
    contain: true,
  },
  {
    src: "/images/products/te-pvc.jpg",
    alt: "Té PVC pression",
    label: "PVC pression",
  },
  {
    src: "/images/products/pompe-immergee-4p.jpg",
    alt: "Pompe immergée inox 4 pouces",
    label: "Pompes immergées",
    contain: true,
  },
  {
    src: "/images/products/raccord-pe-90.jpg",
    alt: "Coude PE à compression",
    label: "Compression PE",
    contain: true,
  },
  {
    src: "/images/products/pompes-immergees-serie.jpg",
    alt: "Série de pompes immergées inox",
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
    alt: "Coude PE fileté",
    label: "Raccords filetés",
  },
  {
    src: "/images/products/motopompe-inox.jpg",
    alt: "Motopompe inox",
    label: "Motopompes inox",
    contain: true,
  },
  {
    src: "/images/products/pompes-stock.jpg",
    alt: "Stock de pompes immergées",
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
  return whatsappUrl(message);
}

export function generalMessage() {
  return "Bonjour AgriFlow 👋, je souhaite un devis pour du matériel d'irrigation / de pompage. Pouvez-vous m'aider ?";
}

export function productMessage(product: Product, quantity = 1) {
  return [
    "Bonjour AgriFlow 👋,",
    "Je souhaite un devis pour :",
    `• ${product.name}${quantity > 1 ? ` — ${quantity} unités` : ""}`,
    ...product.specs.slice(0, 2).map((spec) => `  ${spec.label} : ${spec.value}`),
    "",
    "Merci de me communiquer le prix, la disponibilité et le délai de livraison.",
  ].join("\n");
}

export function categoryMessage(category: Category) {
  return `Bonjour AgriFlow 👋, je souhaite un devis pour la gamme « ${category.label} ». Pouvez-vous me conseiller ?`;
}
