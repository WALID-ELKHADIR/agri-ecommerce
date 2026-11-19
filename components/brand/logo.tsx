import { useId } from "react";
import { logoMarkup, type LogoLang, type LogoTone, type LogoVariant } from "@/lib/brand/logo-svg";

type LogoProps = {
  variant?: LogoVariant;
  tone?: LogoTone;
  lang?: LogoLang;
  /** Nom accessible. Sans titre, le logo est décoratif (aria-hidden). */
  title?: string;
  /** Taille : fixez la hauteur (ex. `h-8 w-auto`). En ton « mono », la couleur suit `color` (currentColor). */
  className?: string;
  /** Proportions renforcées pour les très petites tailles (≤ 32 px). */
  small?: boolean;
  /** Trace le canal d'eau à l'apparition (hero uniquement ; désactivé si mouvement réduit). */
  animated?: boolean;
};

/**
 * Logo Saqia (piste « Parcelle »). La géométrie vient de `lib/brand/logo-svg`,
 * source unique partagée avec les fichiers statiques et les icônes.
 */
export function Logo({
  variant = "full",
  tone = "color",
  lang = "fr",
  title,
  className = "h-8 w-auto",
  small = false,
  animated = false,
}: LogoProps) {
  const maskId = `saqia-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const { viewBox, width, height, inner } = logoMarkup({
    variant,
    tone,
    lang,
    maskId,
    small,
    animatable: animated,
    currentColor: true,
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width}
      height={height}
      className={`${animated ? "saqia-logo-animated " : ""}${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      // Markup statique produit par notre propre module (aucune donnée utilisateur).
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
