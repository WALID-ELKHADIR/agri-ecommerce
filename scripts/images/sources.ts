// Source de vérité du traitement des images produits : quelle photo d'origine
// (public/images/_archive/2026-11-photos-fournisseur/photo-NN.jpg) donne quelle
// image du site, et comment. Décisions documentées dans docs/images-inventaire.md.
//
// - "cutout" : détourage puis pose sur fond soil-50, produit à ~70 % du cadre.
// - "crop"   : recadrage carré de la photo (mise en situation), sans détourage.
// Les scènes du fournisseur portant son logo ne sont utilisées qu'en "cutout" :
// le détourage ne garde que le produit.

export type Rect = { left: number; top: number; width: number; height: number };

/**
 * Zone masquée avant détourage (coordonnées de la photo d'origine) :
 * - rect + color : aplat, pour un fond uni (ciel) ;
 * - rect + clone : recopie la texture voisine décalée de (dx, dy), pour un
 *   fond texturé (un aplat serait pris pour un objet par le détourage).
 */
export type Erase = { rect: Rect } & ({ color: string } | { clone: { dx: number; dy: number } });

export type ImageSpec = {
  /** Numéro de la photo d'origine (1 à 38). */
  photo: number;
  mode: "cutout" | "crop";
  /** Recadrage appliqué avant tout traitement (pixels de la photo d'origine). */
  crop?: Rect;
  /** Zones repeintes avant détourage (ex. logo du fournisseur proche du produit). */
  erase?: Erase[];
  alt: string;
};

export type ProductImageSpec = {
  slug: string;
  /** Absent : image provisoire (photo à fournir). */
  main?: ImageSpec;
  gallery?: ImageSpec[];
  /** Correspondance photo → produit à faire confirmer par le propriétaire. */
  toConfirm?: string;
};

export const PRODUCT_IMAGES: ProductImageSpec[] = [
  // --- Produits existants
  {
    slug: "kit-pompe-immergee-4-pouces",
    main: { photo: 5, mode: "cutout", alt: "Kit pompe immergée : pompe inox, coffret de commande et câble" },
  },
  { slug: "pompe-immergee-inox-4-pouces" },
  {
    slug: "pompe-centrifuge-monobloc",
    main: { photo: 7, mode: "cutout", alt: "Pompe centrifuge monobloc à grand orifice d'aspiration" },
  },
  { slug: "motopompe-centrifuge-inox" },
  {
    slug: "pompe-centrifuge-haute-pression",
    main: { photo: 10, mode: "cutout", alt: "Pompe centrifuge à brides avec moteur électrique" },
    gallery: [{ photo: 13, mode: "cutout", alt: "Pompe centrifuge normalisée, vue de trois quarts" }],
    toConfirm: "Photos 10 et 13 : bien ce modèle haute pression ?",
  },
  {
    slug: "pompe-centrifuge-fonte",
    main: { photo: 8, mode: "cutout", alt: "Pompe centrifuge en fonte à brides" },
    gallery: [
      {
        photo: 9,
        mode: "cutout",
        crop: { left: 30, top: 60, width: 494, height: 494 },
        alt: "Pompe centrifuge en fonte, vue de trois quarts",
      },
    ],
    toConfirm: "Photos 8 et 9 : bien ce modèle en fonte ?",
  },
  {
    slug: "gamme-pompes-immergees-inox",
    main: { photo: 11, mode: "crop", alt: "Pompes immergées inox alignées en atelier, câbles bleus" },
    gallery: [
      {
        photo: 12,
        mode: "crop",
        crop: { left: 0, top: 60, width: 387, height: 387 },
        alt: "Rangée de pompes immergées inox prêtes à l'expédition",
      },
    ],
  },
  {
    slug: "coude-pe-compression-90",
    main: { photo: 3, mode: "cutout", alt: "Coude PE à compression 90°, corps noir et écrous bleus" },
    gallery: [
      {
        photo: 2,
        mode: "crop",
        crop: { left: 0, top: 150, width: 896, height: 896 },
        alt: "Coude PE à compression monté sur un réseau de tuyaux",
      },
    ],
  },
  { slug: "coude-pe-filete-male-90" },
  {
    slug: "te-pvc-pression",
    main: { photo: 1, mode: "cutout", alt: "Té PVC pression gris" },
    gallery: [
      {
        photo: 1,
        mode: "crop",
        crop: { left: 0, top: 200, width: 896, height: 896 },
        alt: "Té PVC pression sur un établi, entouré de tubes PVC",
      },
    ],
  },
  {
    slug: "coude-pe-reseau-enterre",
    main: { photo: 4, mode: "cutout", alt: "Coude PE à compression pour réseau d'irrigation" },
    gallery: [
      {
        photo: 4,
        mode: "crop",
        crop: { left: 0, top: 100, width: 896, height: 896 },
        alt: "Coude PE posé dans un champ, raccordé à des tuyaux d'irrigation",
      },
    ],
    toConfirm: "Même coude que le coude à compression : garder deux fiches ?",
  },

  // --- Nouveaux produits
  {
    slug: "asperseur-impact",
    main: { photo: 27, mode: "cutout", alt: "Asperseur à impact vert, buse et ressort en laiton" },
  },
  {
    slug: "asperseur-impact-orange",
    // La main touche le corps de l'asperseur : détourage impossible, recadrage.
    main: {
      photo: 14,
      mode: "crop",
      crop: { left: 0, top: 360, width: 720, height: 720 },
      alt: "Asperseur à impact orange tenu en main",
    },
    toConfirm: "Photo à refaire sans la main (fond uni).",
  },
  {
    slug: "micro-asperseur-piquet",
    main: { photo: 20, mode: "cutout", alt: "Micro-asperseur rotatif sur piquet, déflecteur orange" },
  },
  {
    slug: "mini-asperseur-piquet",
    main: {
      photo: 22,
      mode: "cutout",
      // Logo du fournisseur juste au-dessus du produit : effacé avant détourage.
      erase: [
        { rect: { left: 0, top: 0, width: 560, height: 280 }, color: "#cfe3f3" },
        // Filet du jet d'eau au-dessus de la tête.
        { rect: { left: 540, top: 110, width: 90, height: 130 }, color: "#cfe3f3" },
      ],
      alt: "Mini-asperseur sur piquet bleu",
    },
  },
  {
    slug: "mini-vanne-16-ecrous",
    main: { photo: 35, mode: "cutout", alt: "Mini-vanne 16 mm à écrous verts, poignée bleue" },
    gallery: [
      { photo: 15, mode: "cutout", alt: "Deux mini-vannes 16 mm, poignées bleue et verte" },
      { photo: 19, mode: "cutout", alt: "Mini-vanne 16 mm à poignée et écrou verts" },
    ],
  },
  {
    slug: "mini-vanne-16-cannelee",
    main: { photo: 36, mode: "cutout", alt: "Mini-vanne 16 mm à embouts cannelés, poignée bleue" },
  },
  {
    slug: "raccord-depart-gaine",
    main: { photo: 25, mode: "cutout", alt: "Raccord de départ pour gaine goutte-à-goutte, écrou bleu" },
  },
  {
    slug: "raccord-gaine",
    main: { photo: 30, mode: "cutout", alt: "Raccord pour gaine goutte-à-goutte, écrous bleus" },
  },
  {
    slug: "poincon-goutte-a-goutte",
    main: { photo: 28, mode: "cutout", alt: "Poinçon à poignée en T bleue pour percer les tuyaux" },
  },
  {
    slug: "injecteur-venturi",
    main: { photo: 23, mode: "cutout", alt: "Injecteur d'engrais Venturi avec tuyau d'aspiration transparent" },
  },
  {
    slug: "clapet-crepine-pvc",
    main: { photo: 21, mode: "cutout", alt: "Clapet crépine PVC gris à brides" },
  },
  {
    slug: "coffret-commande-pompe",
    main: { photo: 32, mode: "cutout", alt: "Coffret de commande pour pompe immergée, interrupteur rouge et câble" },
    gallery: [
      {
        photo: 26,
        mode: "crop",
        crop: { left: 0, top: 0, width: 792, height: 792 },
        alt: "Coffret de commande pour pompe immergée en main",
      },
    ],
  },
  {
    slug: "debroussailleuse-thermique",
    main: { photo: 37, mode: "cutout", alt: "Débroussailleuse thermique avec guidon et harnais" },
    // Fond blanc d'origine conservé : le détourage laissait un rectangle blanc.
    gallery: [{ photo: 34, mode: "crop", alt: "Débroussailleuse livrée avec ses accessoires : lames, bobines, protections" }],
  },
  {
    slug: "colle-pvc",
    // Posé sur un sol strié : le détourage garde l'ombre et la ligne du sol.
    main: {
      photo: 16,
      mode: "crop",
      crop: { left: 0, top: 160, width: 792, height: 792 },
      alt: "Flacon de colle PVC",
    },
    toConfirm: "Photo à refaire sur fond uni.",
  },
];

/** Photos d'origine non utilisées, et pourquoi (traçabilité). */
export const REJECTED_PHOTOS: Record<number, string> = {
  6: "Filigrane AVITO : photo d'une annonce d'un autre site",
  17: "Produit non identifié, main en gros plan",
  18: "Produit non identifié",
  24: "Logo du fournisseur au-dessus du produit ; remplacée par la photo 34",
  29: "Produit non identifié",
  31: "Produit non identifié, trop petit dans le cadre",
  33: "Personne identifiable en gros plan",
  38: "Colle pour bâches d'une autre marque, non confirmée au catalogue",
};
