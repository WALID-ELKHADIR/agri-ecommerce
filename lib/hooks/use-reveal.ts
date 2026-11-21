"use client";

import { useEffect } from "react";
import { shouldHideForReveal } from "@/lib/motion";

/** Vrai si le navigateur anime déjà les apparitions en CSS (timeline view()). */
function hasScrollTimelines(): boolean {
  return typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");
}

/**
 * Repli des apparitions au défilement, utilisé une seule fois (components/motion.tsx).
 * Un seul IntersectionObserver pour tous les `[data-reveal]` : seuls les éléments
 * sous la flottaison sont cachés, puis révélés à leur entrée dans l'écran.
 * Les éléments ajoutés plus tard (navigation) sont pris en compte via un MutationObserver.
 */
export function useReveal(): void {
  useEffect(() => {
    if (hasScrollTimelines() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("motion-js");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          delete element.dataset.hidden;
          element.dataset.revealed = "";
          observer.unobserve(element);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const seen = new WeakSet<Element>();
    function scan() {
      for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
        if (seen.has(element)) continue;
        seen.add(element);
        if (shouldHideForReveal(element.getBoundingClientRect().top, window.innerHeight)) {
          element.dataset.hidden = "";
          observer.observe(element);
        }
      }
    }

    scan();
    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
}
