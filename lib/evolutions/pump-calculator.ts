/**
 * Emplacement : calculateur de pompe (non publié). Voir docs/evolutions.md.
 * Entrées et sortie prévues ; l'algorithme sera écrit avec des données
 * techniques validées par le propriétaire (aucune valeur inventée).
 */
export type PumpNeed = {
  /** Débit souhaité, en m³/h. */
  flowM3h: number;
  /** Hauteur manométrique totale, en mètres. */
  headM: number;
  /** Source d'eau. */
  source: "forage" | "puits" | "bassin" | "reseau";
  /** Alimentation disponible. */
  power: "220V" | "380V" | "solaire";
};

export type PumpSuggestion = { slug: string; reason: string };
