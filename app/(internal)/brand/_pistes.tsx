import { useId, type ReactNode } from "react";

/**
 * Pistes de logo Saqia — exploration interne (page /brand).
 * Chaque symbole est dessiné sur une grille de 64 × 64, en formes pleines,
 * avec un espace de 4 unités entre la terre et l'eau : la « rigole ».
 */

export type Tone = "color" | "mono" | "inverse";

const PALETTE: Record<Tone, { field: string; water: string }> = {
  color: { field: "#3a6631", water: "#177c87" }, // field-600 / water-600
  mono: { field: "#1f1c16", water: "#1f1c16" }, // soil-900
  inverse: { field: "#ffffff", water: "#ffffff" },
};

type SymbolProps = { tone?: Tone; size?: number; title?: string };

function Svg({
  size,
  title,
  children,
}: {
  size: number;
  title?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      shapeRendering="geometricPrecision"
    >
      {children}
    </svg>
  );
}

/** A · Méandre — le S est le canal ; deux parcelles se logent dans ses courbes. */
export function Meandre({ tone = "color", size = 64, title }: SymbolProps) {
  const c = PALETTE[tone];
  return (
    <Svg size={size} title={title}>
      <rect x="22" y="17" width="34" height="8" rx="4" fill={c.field} />
      <rect x="8" y="39" width="34" height="8" rx="4" fill={c.field} />
      <path
        d="M54 10H22a11 11 0 0 0 0 22h20a11 11 0 0 1 0 22H10"
        fill="none"
        stroke={c.water}
        strokeWidth="8"
      />
    </Svg>
  );
}

/**
 * B · Sillons — irrigation à la raie : les sillons (terre) forment les barres
 * du S, l'eau fait demi-tour au bout de chacun pour passer au suivant.
 */
export function Sillons({ tone = "color", size = 64, title }: SymbolProps) {
  const c = PALETTE[tone];
  return (
    <Svg size={size} title={title}>
      <rect x="22" y="6" width="36" height="10" rx="5" fill={c.field} />
      <rect x="22" y="27" width="20" height="10" fill={c.field} />
      <rect x="6" y="48" width="36" height="10" rx="5" fill={c.field} />
      <path
        d="M18 11a10.5 10.5 0 0 0 0 21M46 32a10.5 10.5 0 0 1 0 21"
        fill="none"
        stroke={c.water}
        strokeWidth="10"
      />
    </Svg>
  );
}

/** C · Parcelle — une parcelle pleine, traversée de bord à bord par un canal en S. */
export function Parcelle({ tone = "color", size = 64, title }: SymbolProps) {
  const c = PALETTE[tone];
  const maskId = `parcelle-${useId().replace(/:/g, "")}`;
  const channel = "M64 18H29a7 7 0 0 0 0 14h6a7 7 0 0 1 0 14H0";
  return (
    <Svg size={size} title={title}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="#fff" />
          <path d={channel} fill="none" stroke="#000" strokeWidth="15" />
        </mask>
      </defs>
      <rect width="64" height="64" rx="16" fill={c.field} mask={`url(#${maskId})`} />
      <path d={channel} fill="none" stroke={c.water} strokeWidth="7" />
    </Svg>
  );
}

export const PISTES = [
  {
    id: "a",
    name: "Méandre",
    Symbol: Meandre,
    idea: "Le S est la rigole elle-même. Elle serpente et entoure deux parcelles : l’eau arrive exactement là où il faut.",
    strengths: "Le plus fidèle au nom (la saqia est une rigole). Silhouette souple, très reconnaissable.",
    risks: "Trait d’eau assez fin à 16 px ; demande une version simplifiée pour le favicon.",
  },
  {
    id: "b",
    name: "Sillons",
    Symbol: Sillons,
    idea: "L’irrigation à la raie : l’eau longe un sillon, fait demi-tour au bout et repart dans le suivant. Les sillons dessinent le S, l’eau ses virages.",
    strengths: "Raconte un geste agricole réel. Géométrique, se décline bien en motif (bordures, fonds de section).",
    risks: "Le bleu n’occupe que les virages : en petit, le symbole paraît surtout vert.",
  },
  {
    id: "c",
    name: "Parcelle",
    Symbol: Parcelle,
    idea: "Une parcelle pleine, traversée de bord à bord par un canal en S qui la partage et l’irrigue.",
    strengths: "La forme la plus compacte : excellente à 16 px, en avatar WhatsApp et en icône d’application.",
    risks: "Le carré arrondi rappelle une icône d’app ; le S est en creux, donc moins immédiat.",
  },
] as const;
