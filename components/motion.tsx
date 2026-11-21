"use client";

import { useEffect } from "react";
import { useReveal } from "@/lib/hooks/use-reveal";
import { canTilt, tiltFromPointer } from "@/lib/motion";

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animations qui demandent du JavaScript, pour tout le site, dans un seul
 * composant : repli des apparitions, inclinaison des cartes,
 * header compact (repli). Le tracé du logo une fois par visite est géré par
 * un script de <head> (app/layout.tsx).
 * Les éléments sont marqués par des attributs `data-*` côté serveur.
 */
export function Motion() {
  useReveal();

  // Inclinaison 3D des cartes : un seul écouteur, souris uniquement.
  useEffect(() => {
    const allowed = canTilt({
      hover: window.matchMedia("(hover: hover)").matches,
      finePointer: window.matchMedia("(pointer: fine)").matches,
      reducedMotion: reducedMotion(),
    });
    if (!allowed) return;
    let frame = 0;
    let current: HTMLElement | null = null;

    function reset(element: HTMLElement | null) {
      element?.style.removeProperty("--rx");
      element?.style.removeProperty("--ry");
    }

    function onMove(event: PointerEvent) {
      const card = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-tilt]") : null;
      if (card !== current) {
        reset(current);
        current = card;
      }
      if (!card) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { rx, ry } = tiltFromPointer(card.getBoundingClientRect(), event.clientX, event.clientY);
        card.style.setProperty("--rx", `${rx}deg`);
        card.style.setProperty("--ry", `${ry}deg`);
      });
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      reset(current);
    };
  }, []);

  // Header compact : repli pour les navigateurs sans timeline scroll().
  useEffect(() => {
    if (CSS.supports("animation-timeline: scroll()")) return;
    const root = document.documentElement;
    const update = () => {
      if (window.scrollY > 40) root.dataset.scrolled = "";
      else delete root.dataset.scrolled;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return null;
}
