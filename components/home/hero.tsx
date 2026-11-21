import { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowRight, WhatsApp } from "@/components/icons";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { AMBIANCE_IMAGES } from "@/lib/ambiance-images";
import { generalMessage } from "@/lib/whatsapp";

type HeroProps = { brandName: string; slogan: string; productCount: number };

/**
 * Ouverture plein écran : la photo d'une ligne de goutte-à-goutte dans la terre
 * ocre, recadrée en 4:5 sur mobile et 16:9 sur ordinateur. C'est l'image LCP
 * de l'accueil : seule image chargée en priorité.
 */
export function Hero({ brandName, slogan, productCount }: HeroProps) {
  const desktop = AMBIANCE_IMAGES.heroDesktop;
  const mobile = AMBIANCE_IMAGES.heroMobile;
  const common = { alt: desktop.alt, sizes: "100vw" };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: desktop.src, width: desktop.width, height: desktop.height });
  const {
    props: { srcSet: mobileSrcSet, ...img },
  } = getImageProps({ ...common, src: mobile.src, width: mobile.width, height: mobile.height });
  const message = generalMessage(brandName);

  return (
    <section className="relative isolate flex min-h-[calc(100svh-6.5rem)] items-end overflow-hidden text-white" style={{ backgroundColor: desktop.dominantColor }}>
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
        <source srcSet={mobileSrcSet} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- art direction via getImageProps : alt fourni dans img */}
        <img
          {...img}
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_70%] md:object-center"
        />
      </picture>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-field-900/95 via-field-900/55 to-field-900/10 md:bg-gradient-to-r md:from-field-900/90 md:via-field-900/45 md:to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-32 sm:pb-28 md:pb-24">
        <div className="max-w-2xl">
          <h1 className="font-display text-[2.6rem] font-semibold leading-[0.98] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {slogan}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Pompes, raccords et kits d&apos;irrigation pour les exploitations du Maroc. Composez votre liste, envoyez-la
            sur WhatsApp et recevez votre devis.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppLink
              source="accueil-hero"
              message={message}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-whatsapp-hover"
            >
              <WhatsApp className="h-4 w-4" />
              Demander un devis sur WhatsApp
            </WhatsAppLink>
            <Link
              href="/produits"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Voir le catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/70">
            {productCount} références en ligne, devis gratuit.
          </p>
        </div>
      </div>
    </section>
  );
}
