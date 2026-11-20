/** Calcul du recadrage carré guidé de l'admin (module pur, testé). */

/** Réglages de l'utilisateur : zoom 1 à 3, décalages -1 (gauche/haut) à 1 (droite/bas). */
export type CropSettings = { zoom: number; x: number; y: number };

export type SquareCrop = { x: number; y: number; size: number };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const MAX_OUTPUT = 1600;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Zone carrée de l'image source (pixels) correspondant aux réglages. */
export function computeSquareCrop(width: number, height: number, settings: CropSettings): SquareCrop {
  const zoom = clamp(settings.zoom, MIN_ZOOM, MAX_ZOOM);
  const size = Math.round(Math.min(width, height) / zoom);
  const freeX = width - size;
  const freeY = height - size;
  return {
    x: Math.round((freeX / 2) * (1 + clamp(settings.x, -1, 1))),
    y: Math.round((freeY / 2) * (1 + clamp(settings.y, -1, 1))),
    size,
  };
}

/** Côté de l'image produite : 1600 px au plus, sans agrandir une petite photo. */
export function outputSize(cropSize: number): number {
  return Math.min(cropSize, MAX_OUTPUT);
}
