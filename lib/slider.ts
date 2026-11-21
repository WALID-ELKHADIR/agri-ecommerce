/** Index de diapositive circulaire (module pur, testé). */
export function slideIndex(current: number, count: number, step: number): number {
  if (count <= 0) return 0;
  return (((current + step) % count) + count) % count;
}
