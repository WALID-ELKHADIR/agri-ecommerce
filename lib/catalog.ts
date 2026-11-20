import { resolveProductImages, type ProductImage } from "./product-images";
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
  /** Aperçu flou de l'image principale (chargement sans saut). */
  imageBlurDataURL?: string;
  /** Image provisoire : la photo du produit reste à fournir. */
  imagePlaceholder: boolean;
  /** Vues secondaires (mise en situation, détails). */
  gallery: ProductImage[];
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
  {
    id: "accessoires-pompage",
    label: "Accessoires de pompage",
    short: "Accessoires",
    description: "Coffrets de commande, clapets et crépines pour vos installations de pompage.",
  },
  {
    id: "arrosage",
    label: "Arrosage & goutte-à-goutte",
    short: "Arrosage",
    description: "Asperseurs, mini-vannes, raccords de gaine et accessoires de micro-irrigation.",
  },
  {
    id: "outillage",
    label: "Motoculture & outillage",
    short: "Outillage",
    description: "Matériel d'entretien des parcelles et des abords.",
  },
];

type ProductData = Omit<Product, "image" | "imageAlt" | "imageBlurDataURL" | "imagePlaceholder" | "gallery">;

/** Complète un produit avec ses images (manifest, ou image enregistrée en base). */
export function withImages(product: ProductData, stored?: { src: string; alt: string }): Product {
  const { image, gallery } = resolveProductImages(product.slug, stored);
  return {
    ...product,
    image: image.src,
    imageAlt: image.alt || product.name,
    imageBlurDataURL: image.blurDataURL,
    imagePlaceholder: image.placeholder,
    gallery,
  };
}

const productData: ProductData[] = [
  {
    slug: "kit-pompe-immergee-4-pouces",
    name: "Kit pompe immergée 4\" complet",
    category: "kits",
    categoryLabel: "Kits complets",
    description:
      "Ensemble prêt à poser pour forage ou puits : pompe immergée inox, coffret de commande et câble électrique.",
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
    badge: "Résistant UV",
    specs: [
      { label: "Diamètre", value: "Ø25 – 63 mm" },
      { label: "Usage", value: "Réseau enterré" },
      { label: "Matériau", value: "PE haute densité" },
    ],
    stock: "Disponible",
  },
  {
    slug: "asperseur-impact",
    name: "Asperseur à impact",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Asperseur rotatif à impact pour l'arrosage par aspersion des grandes surfaces.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "asperseur-impact-orange",
    name: "Asperseur à impact (modèle orange)",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Asperseur rotatif à impact en matière plastique, pour l'arrosage par aspersion.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "micro-asperseur-piquet",
    name: "Micro-asperseur rotatif sur piquet",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Micro-asperseur rotatif à planter, pour l'arrosage localisé des cultures.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "mini-asperseur-piquet",
    name: "Mini-asperseur sur piquet",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Mini-asperseur monté sur piquet, à raccorder sur une ligne d'irrigation.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "mini-vanne-16-ecrous",
    name: "Mini-vanne goutte-à-goutte 16 mm à écrous",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Mini-vanne d'arrêt pour tuyau goutte-à-goutte de 16 mm, raccordement par écrous.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "mini-vanne-16-cannelee",
    name: "Mini-vanne goutte-à-goutte 16 mm cannelée",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Mini-vanne d'arrêt pour tuyau goutte-à-goutte de 16 mm, embouts cannelés.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "raccord-depart-gaine",
    name: "Raccord de départ pour gaine",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Raccord de départ pour relier une gaine ou un tuyau goutte-à-goutte à la conduite principale.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "raccord-gaine",
    name: "Raccord pour gaine goutte-à-goutte",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Raccord pour gaine et tuyau de goutte-à-goutte.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "poincon-goutte-a-goutte",
    name: "Poinçon pour tuyau goutte-à-goutte",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Outil à poignée pour percer proprement les tuyaux avant la pose des raccords et goutteurs.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "injecteur-venturi",
    name: "Injecteur d'engrais Venturi",
    category: "arrosage",
    categoryLabel: "Arrosage & goutte-à-goutte",
    description:
      "Injecteur Venturi pour incorporer les engrais à l'eau d'irrigation (fertigation).",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "clapet-crepine-pvc",
    name: "Clapet crépine PVC",
    category: "accessoires-pompage",
    categoryLabel: "Accessoires de pompage",
    description:
      "Clapet crépine à placer en bout d'aspiration : filtre l'eau et maintient la pompe amorcée.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "coffret-commande-pompe",
    name: "Coffret de commande pour pompe immergée",
    category: "accessoires-pompage",
    categoryLabel: "Accessoires de pompage",
    description:
      "Coffret électrique de démarrage et de protection pour pompe immergée monophasée.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "debroussailleuse-thermique",
    name: "Débroussailleuse thermique",
    category: "outillage",
    categoryLabel: "Motoculture & outillage",
    description:
      "Débroussailleuse à moteur thermique, livrée avec ses accessoires de coupe.",
    specs: [],
    stock: "Sur demande",
  },
  {
    slug: "colle-pvc",
    name: "Colle PVC",
    category: "raccords",
    categoryLabel: "Raccords & fittings",
    description:
      "Colle pour l'assemblage des tubes et raccords en PVC pression.",
    specs: [],
    stock: "Sur demande",
  },
];

export const products: Product[] = productData.map((product) => withImages(product));

/** Image du manifest pour la galerie de l'accueil (principale ou 1re vue de galerie). */
function showcase(slug: string, label: string, kind: "main" | "gallery" = "main"): GalleryImage {
  const { image, gallery } = resolveProductImages(slug);
  const picked = kind === "gallery" && gallery[0] ? gallery[0] : image;
  return { src: picked.src, alt: picked.alt, label, contain: kind === "main" };
}

export const galleryImages: GalleryImage[] = [
  showcase("pompe-centrifuge-monobloc", "Pompes centrifuges"),
  showcase("coude-pe-reseau-enterre", "Raccords PE", "gallery"),
  showcase("kit-pompe-immergee-4-pouces", "Kits de pompage"),
  showcase("te-pvc-pression", "PVC pression", "gallery"),
  showcase("asperseur-impact", "Aspersion"),
  showcase("coude-pe-compression-90", "Compression PE"),
  showcase("gamme-pompes-immergees-inox", "Pompes immergées"),
  showcase("mini-vanne-16-ecrous", "Goutte-à-goutte"),
  showcase("pompe-centrifuge-fonte", "Pompes à brides"),
  showcase("clapet-crepine-pvc", "Accessoires de pompage"),
  showcase("injecteur-venturi", "Fertigation"),
  showcase("coffret-commande-pompe", "Coffrets de commande"),
];

export function whatsappLink(message: string) {
  return whatsappUrl(message);
}

export function generalMessage() {
  return `Bonjour ${BRAND.name} 👋, je souhaite un devis pour du matériel d'irrigation / de pompage. Pouvez-vous m'aider ?`;
}

export function productMessage(product: Product, quantity = 1) {
  return [
    `Bonjour ${BRAND.name} 👋,`,
    "Je souhaite un devis pour :",
    `• ${product.name}${quantity > 1 ? ` — ${quantity} unités` : ""}`,
    ...product.specs.slice(0, 2).map((spec) => `  ${spec.label} : ${spec.value}`),
    "",
    "Merci de me communiquer le prix, la disponibilité et le délai de livraison.",
  ].join("\n");
}

export function categoryMessage(category: Category) {
  return `Bonjour ${BRAND.name} 👋, je souhaite un devis pour la gamme « ${category.label} ». Pouvez-vous me conseiller ?`;
}
