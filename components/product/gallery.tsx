"use client";

import Image from "next/image";
import { useRef, useState, ViewTransition, type PointerEvent } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { Search } from "@/components/icons";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

export type GalleryImageItem = { src: string; alt: string; blurDataURL?: string; contain?: boolean };

/**
 * Galerie de la fiche produit : balayage natif (scroll-snap) sur mobile,
 * miniatures, et vue agrandie avec zoom ×2 au clic ou au toucher.
 * La première image est l'image LCP de la page.
 */
export function Gallery({ images, productName, slug }: { images: GalleryImageItem[]; productName: string; slug: string }) {
  const track = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const [current, setCurrent] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  function goTo(index: number) {
    const element = track.current;
    if (!element) return;
    // En arabe (rtl), la position de défilement est négative.
    const sign = getComputedStyle(element).direction === "rtl" ? -1 : 1;
    element.scrollTo({ left: sign * index * element.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const element = track.current;
    if (!element) return;
    setCurrent(Math.round(Math.abs(element.scrollLeft) / element.clientWidth));
  }

  function toggleZoom(event: PointerEvent<HTMLButtonElement>) {
    if (zoom) {
      setZoom(null);
      return;
    }
    const box = event.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    });
  }

  const shown = images[current] ?? images[0];

  return (
    <div className="grid gap-3">
      <div className="relative overflow-hidden rounded-3xl border border-soil-200 bg-gradient-to-br from-soil-50 via-white to-water-50/60">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          aria-label={t.ui.photosOf(productName)}
          role="region"
          tabIndex={0}
        >
          {images.map((image, index) => {
            const slide = (
            <div key={image.src} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder={image.blurDataURL ? "blur" : "empty"}
                blurDataURL={image.blurDataURL}
                className={image.contain === false ? "object-cover" : "object-contain p-6 sm:p-10"}
              />
            </div>
            );
            // La 1re image reprend le nom de l'image de la carte (transition carte → fiche).
            return index === 0 ? (
              <ViewTransition key={image.src} name={`produit-${slug}`} share="morph" default="none">
                {slide}
              </ViewTransition>
            ) : (
              slide
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setZoom(null);
            setZoomOpen(true);
          }}
          className="absolute bottom-3 end-3 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/90 px-3.5 text-xs font-semibold text-soil-900 shadow-sm backdrop-blur hover:bg-white"
        >
          <Search className="h-4 w-4" />
          {t.ui.enlarge}
        </button>

        {images.length > 1 ? (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden="true">
            {images.map((image, index) => (
              <span
                key={image.src}
                className={cn("h-1.5 rounded-full transition-all", index === current ? "w-5 bg-field-900" : "w-1.5 bg-soil-400")}
              />
            ))}
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => goTo(index)}
              aria-label={t.ui.showPhoto(index + 1, images.length)}
              aria-current={index === current}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white",
                index === current ? "border-field-900" : "border-transparent",
              )}
            >
              <Image src={image.src} alt="" fill sizes="64px" loading="lazy" className="object-contain p-1" />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} title={productName} className="w-[min(56rem,calc(100%-1rem))]">
        <button
          type="button"
          onPointerUp={toggleZoom}
          aria-label={zoom ? t.ui.zoomOut : t.ui.zoomIn}
          className={cn("relative block aspect-square w-full overflow-hidden bg-white", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
        >
          <Image
            src={shown.src}
            alt={shown.alt}
            fill
            sizes="(min-width: 900px) 56rem, 100vw"
            className="object-contain transition-transform duration-300 motion-reduce:transition-none"
            style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        </button>
      </Dialog>
    </div>
  );
}
