"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { slideIndex } from "@/lib/slider";

const AUTOPLAY_MS = 5000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(listener: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/**
 * Commandes du carrousel (îlot client) : flèches, puces, pause et défilement
 * automatique toutes les 5 s. Le défilement automatique s'arrête au survol,
 * quand le carrousel a le focus, quand il sort de l'écran ou que l'onglet est
 * caché, et n'est jamais lancé si le visiteur réduit les animations.
 */
export function HeroSliderControls({ trackId, count }: { trackId: string; count: number }) {
  const { t } = useLocale();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  // Mouvement réduit : jamais de défilement automatique.
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const autoplay = playing && !reducedMotion;
  const [held, setHeld] = useState(false);
  const currentRef = useRef(0);

  const track = useCallback(() => document.getElementById(trackId), [trackId]);

  const goTo = useCallback(
    (index: number) => {
      const element = track();
      if (!element) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollTo({ left: index * element.clientWidth, behavior: reduced ? "auto" : "smooth" });
    },
    [track],
  );

  // Diapositive visible : suivie au défilement (flèches, puces ou doigt).
  useEffect(() => {
    const element = track();
    if (!element) return;
    const slides = [...element.querySelectorAll<HTMLElement>("[data-slide]")];
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const index = Math.round(element.scrollLeft / Math.max(1, element.clientWidth));
        currentRef.current = index;
        setCurrent(index);
        // Diapositives hors écran : ni focus clavier ni lecture.
        slides.forEach((slide, position) => {
          slide.inert = position !== index;
        });
      });
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      element.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [track]);

  // Une fois la page chargée (image LCP déjà affichée), les photos des autres
  // diapositives sont chargées : pas de diapositive vide à leur apparition.
  useEffect(() => {
    const element = track();
    if (!element) return;
    const warm = () =>
      element.querySelectorAll<HTMLImageElement>("img[loading='lazy']").forEach((img) => {
        img.loading = "eager";
      });
    if (document.readyState === "complete") warm();
    else window.addEventListener("load", warm, { once: true });
    return () => window.removeEventListener("load", warm);
  }, [track]);

  // Pause au survol, au focus et hors de l'écran.
  useEffect(() => {
    const element = track();
    const section = element?.parentElement;
    if (!element || !section) return;
    let hover = false;
    let focus = false;
    let visible = true;
    const sync = () => setHeld(hover || focus || !visible || document.visibilityState === "hidden");
    const onEnter = () => {
      hover = true;
      sync();
    };
    const onLeave = () => {
      hover = false;
      sync();
    };
    const onFocusIn = () => {
      focus = true;
      sync();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (element.contains(event.relatedTarget as Node | null)) return;
      focus = false;
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      sync();
    });
    // Survol et focus des diapositives seulement : utiliser les commandes
    // (flèches, puces, lecture) ne met pas le défilement en pause.
    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("focusin", onFocusIn);
    element.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", sync);
    observer.observe(section);
    return () => {
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("focusin", onFocusIn);
      element.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", sync);
      observer.disconnect();
    };
  }, [track]);

  // Défilement automatique ; en pause, les changements sont annoncés.
  useEffect(() => {
    const element = track();
    if (element) element.setAttribute("aria-live", autoplay ? "off" : "polite");
    if (!autoplay || held) return;
    const timer = window.setInterval(() => goTo(slideIndex(currentRef.current, count, 1)), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, held, count, goTo, track]);

  const step = (direction: number) => goTo(slideIndex(currentRef.current, count, direction));

  return (
    <div
      dir="ltr"
      className="absolute inset-x-0 bottom-20 z-10 mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 md:bottom-8 md:justify-end"
    >
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label={t.slidePrev}
        className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur transition hover:bg-black/40 md:flex"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-1 rounded-full bg-black/25 px-2 backdrop-blur">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`${t.slideGoto} ${index + 1}`}
            aria-current={index === current ? "true" : undefined}
            className="flex h-11 w-7 items-center justify-center"
          >
            <span
              className={cn(
                "h-2 rounded-full bg-white transition-all motion-reduce:transition-none",
                index === current ? "w-5 opacity-100" : "w-2 opacity-50",
              )}
            />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPlaying(!autoplay)}
        aria-label={autoplay ? t.slidePause : t.slidePlay}
        aria-pressed={!autoplay}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur transition hover:bg-black/40"
      >
        {autoplay ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
          </svg>
        )}
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label={t.slideNext}
        className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur transition hover:bg-black/40 md:flex"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
