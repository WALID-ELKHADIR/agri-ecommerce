"use client";

import { useEffect } from "react";
import { useReveal } from "@/lib/hooks/use-reveal";
import { canTilt, COUNT_MS, countValue, tiltFromPointer } from "@/lib/motion";

const LOGO_KEY = "saqia:logo-vu";

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animations qui demandent du JavaScript, pour tout le site, dans un seul
 * composant : repli des apparitions, compteurs, inclinaison des cartes,
 * header compact (repli) et tracé du logo une fois par visite.
 * Les éléments sont marqués par des attributs `data-*` côté serveur.
 */
export function Motion() {
  useReveal();

  // Compteurs : de 0 à la valeur rendue par le serveur, à l'entrée dans l'écran.
  useEffect(() => {
    if (reducedMotion()) return;
    const frames = new Set<number>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        const target = Number(element.dataset.countTo);
        if (!Number.isFinite(target)) continue;
        const start = performance.now();
        const step = (now: number) => {
          element.textContent = String(countValue(target, now - start));
          if (now - start < COUNT_MS) frames.add(requestAnimationFrame(step));
        };
        frames.add(requestAnimationFrame(step));
      }
    });
    const seen = new WeakSet<Element>();
    function scan() {
      for (const element of document.querySelectorAll<HTMLElement>("[data-count-to]")) {
        if (seen.has(element)) continue;
        seen.add(element);
        // Remis à 0 seulement s'il n'est pas encore visible : rien ne « recule » à l'écran.
        if (element.getBoundingClientRect().top >= window.innerHeight) element.textContent = "0";
        observer.observe(element);
      }
    }
    scan();
    // Pages affichées ensuite par navigation côté client.
    const mutations = new MutationObserver(() => scan());
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      frames.forEach((frame) => cancelAnimationFrame(frame));
    };
  }, []);

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

  // Logo : tracé du canal d'eau à la première page vue de la visite seulement.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(LOGO_KEY)) {
        document.querySelectorAll(".saqia-logo-animated").forEach((logo) => logo.classList.remove("saqia-logo-animated"));
      } else {
        window.sessionStorage.setItem(LOGO_KEY, "1");
      }
    } catch {
      // Stockage indisponible : le tracé se rejoue, sans conséquence.
    }
  }, []);

  return null;
}
