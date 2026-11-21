/** Emplacement : fiches conseils (non publiées). Voir docs/evolutions.md. */
export type AdviceSheet = {
  slug: string;
  title: string;
  summary: string;
  /** Produits du catalogue liés à la fiche. */
  productSlugs: string[];
  publishedAt: string;
};
