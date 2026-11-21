import { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowRight, WhatsApp } from "@/components/icons";
import { WhatsAppServerLink } from "@/components/whatsapp-server-link";
import { AMBIANCE_IMAGES, type AmbianceImage } from "@/lib/ambiance-images";
import { catalogHref } from "@/lib/catalog-query";
import type { TextKey } from "@/lib/i18n/fr";
import { getDictionary } from "@/lib/i18n/server";
import { HeroSliderControls } from "./hero-slider-controls";

export const HERO_TRACK_ID = "hero-track";

type Slide = {
  id: string;
  desktop: AmbianceImage;
  mobile: AmbianceImage;
  title: TextKey;
  text: TextKey;
  cta: { href: string; label: TextKey };
};

const SLIDES: Slide[] = [
  {
    id: "irrigation",
    desktop: AMBIANCE_IMAGES.heroDesktop,
    mobile: AMBIANCE_IMAGES.heroMobile,
    title: "slogan",
    text: "hero1Text",
    cta: { href: "/produits", label: "heroCtaCatalog" },
  },
  {
    id: "pompage",
    desktop: AMBIANCE_IMAGES.heroPompageDesktop,
    mobile: AMBIANCE_IMAGES.heroPompageMobile,
    title: "hero2Title",
    text: "hero2Text",
    cta: { href: catalogHref({ gamme: "pompes" }), label: "hero2Cta" },
  },
  {
    id: "serres",
    desktop: AMBIANCE_IMAGES.heroSerresDesktop,
    mobile: AMBIANCE_IMAGES.heroSerresMobile,
    title: "hero3Title",
    text: "hero3Text",
    cta: { href: catalogHref({ gamme: "raccords" }), label: "hero3Cta" },
  },
];

/** Photo plein cadre en direction artistique : 4:5 sur mobile, 16:9 sur ordinateur. */
function SlidePicture({ slide, first }: { slide: Slide; first: boolean }) {
  const common = { alt: slide.desktop.alt, sizes: "100vw" };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: slide.desktop.src, width: slide.desktop.width, height: slide.desktop.height });
  const {
    props: { srcSet: mobileSrcSet, ...img },
  } = getImageProps({ ...common, src: slide.mobile.src, width: slide.mobile.width, height: slide.mobile.height });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
      <source srcSet={mobileSrcSet} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- art direction via getImageProps : alt fourni dans img */}
      <img
        {...img}
        // Seule la 1re diapositive est l'image LCP ; les suivantes attendent.
        fetchPriority={first ? "high" : "low"}
        loading={first ? "eager" : "lazy"}
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_70%] md:object-center"
      />
    </picture>
  );
}

/**
 * Carrousel de l'accueil, rendu par le serveur : 3 diapositives en défilement
 * natif (balayage au doigt, scroll-snap). Les flèches, les puces, la pause et
 * le défilement automatique (5 s) sont dans un petit îlot client.
 * Textes dans la langue de la page (lib/i18n).
 */
export async function HeroSlider({ brandName, productCount }: { brandName: string; productCount: number }) {
  const t = await getDictionary();
  const message = t.whatsappGeneral(brandName);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.sliderLabel}
      className="relative isolate text-white"
      style={{ backgroundColor: AMBIANCE_IMAGES.heroDesktop.dominantColor }}
    >
      <div
        id={HERO_TRACK_ID}
        dir="ltr"
        aria-live="off"
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide, index) => {
          const Heading = index === 0 ? "h1" : "h2";
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={t.slideOf(index + 1, SLIDES.length)}
              data-slide={index}
              className="relative isolate flex min-h-[calc(100svh-6.5rem)] w-full shrink-0 snap-start items-end overflow-hidden"
            >
              <SlidePicture slide={slide} first={index === 0} />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-field-900/95 via-field-900/55 to-field-900/10 md:bg-gradient-to-r md:from-field-900/90 md:via-field-900/45 md:to-transparent rtl:md:bg-gradient-to-l"
              />
              <div className="hero-inner mx-auto w-full max-w-7xl px-4 pb-36 pt-32 md:pb-28">
                <div className="hero-copy max-w-2xl">
                  <Heading className="font-display text-[2.6rem] font-semibold leading-[0.98] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                    {t[slide.title]}
                  </Heading>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                    {t[slide.text]}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <WhatsAppServerLink
                      source="accueil-hero"
                      message={message}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-whatsapp-hover"
                    >
                      <WhatsApp className="h-4 w-4" />
                      {t.heroCtaWhatsapp}
                    </WhatsAppServerLink>
                    <Link
                      href={slide.cta.href}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                    >
                      {t[slide.cta.label]}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </div>
                  {index === 0 ? (
                    <p className="mt-6 text-sm text-white/70">
                      {t.heroCount(productCount)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <HeroSliderControls trackId={HERO_TRACK_ID} count={SLIDES.length} />
    </section>
  );
}
