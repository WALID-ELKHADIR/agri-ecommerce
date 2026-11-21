/** Calculs des animations de la vitrine (module pur, testé dans tests/motion.test.ts). */

export const TILT_MAX_DEG = 4;
export const COUNT_MS = 800;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
/** Arrondi au centième, sans « -0 ». */
const round = (value: number) => Math.round(value * 100) / 100 + 0;

/** Inclinaison d'une carte selon la position du pointeur : le côté survolé s'enfonce. */
export function tiltFromPointer(
  rect: { left: number; top: number; width: number; height: number },
  x: number,
  y: number,
): { rx: number; ry: number } {
  const px = clamp((x - rect.left) / rect.width - 0.5, -0.5, 0.5);
  const py = clamp((y - rect.top) / rect.height - 0.5, -0.5, 0.5);
  return { rx: round(-py * 2 * TILT_MAX_DEG), ry: round(px * 2 * TILT_MAX_DEG) };
}

/** L'inclinaison n'a de sens qu'avec une souris, et jamais si le visiteur réduit les animations. */
export function canTilt(media: { hover: boolean; finePointer: boolean; reducedMotion: boolean }): boolean {
  return media.hover && media.finePointer && !media.reducedMotion;
}

/** Valeur affichée par un compteur après `elapsedMs` (courbe ease-out cubique). */
export function countValue(target: number, elapsedMs: number): number {
  const t = clamp(elapsedMs / COUNT_MS, 0, 1);
  return Math.round(target * (1 - (1 - t) ** 3));
}

/** Seuls les éléments sous la ligne de flottaison sont cachés avant leur apparition. */
export function shouldHideForReveal(top: number, viewportHeight: number): boolean {
  return top >= viewportHeight;
}

/** Trajet de la pastille d'ajout vers l'icône « Ma liste » ; null si la cible est invisible. */
export function flightPath(
  from: { x: number; y: number } | null,
  to: { x: number; y: number; visible: boolean } | null,
): { dx: number; dy: number } | null {
  if (!from || !to || !to.visible) return null;
  return { dx: to.x - from.x, dy: to.y - from.y };
}
