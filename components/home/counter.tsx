"use client";

import { useEffect, useRef, useState } from "react";
import { COUNT_MS, countValue } from "@/lib/motion";

/**
 * Chiffre qui compte jusqu'à sa valeur à son entrée dans l'écran.
 * Le serveur rend la valeur finale ; l'animation ne démarre qu'après
 * l'hydratation de ce composant (le texte n'est jamais modifié avant,
 * ce qui provoquerait une erreur d'hydratation). Seulement 2 instances.
 */
export function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Déjà visible : on ne « recule » pas un chiffre affiché.
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        setValue(countValue(to, now - start));
        if (now - start < COUNT_MS) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
    // La remise à 0 a lieu hors écran, après l'hydratation.
    frame = requestAnimationFrame(() => setValue(0));
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <span ref={ref} data-count-to={to}>
      {value}
    </span>
  );
}
