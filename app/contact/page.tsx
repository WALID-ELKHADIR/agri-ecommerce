import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Truck,
  WhatsApp,
} from "@/components/icons";
import { MobileCta } from "@/components/mobile-cta";
import { QuoteForm } from "@/components/quote-form";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { SiteFooterWithSettings } from "@/components/site-footer-server";
import { generalMessage } from "@/lib/catalog";
import { whatsappUrl, type SiteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact & devis — Saqia, pompes et irrigation",
  description:
    "Contactez Saqia pour un devis de pompes, raccords PE/PVC ou kits d'irrigation. WhatsApp, téléphone et e-mail — réponse sous 24h.",
};

/** Canaux de contact, avec les coordonnées des réglages de l'admin. */
const channelsFor = (BRAND: SiteConfig) => [
  {
    icon: WhatsApp,
    title: "WhatsApp",
    value: BRAND.phoneDisplay,
    text: "Le plus rapide : photos, schémas et devis direct.",
    href: whatsappUrl(generalMessage(), BRAND.whatsappNumber),
    external: true,
    accent: true,
  },
  {
    icon: Phone,
    title: "Téléphone",
    value: BRAND.phoneDisplay,
    text: BRAND.hours,
    href: `tel:${BRAND.phoneRaw}`,
  },
  {
    icon: Mail,
    title: "E-mail",
    value: BRAND.email,
    text: "Pour les demandes détaillées et appels d'offres.",
    href: `mailto:${BRAND.email}`,
  },
];

export default async function ContactPage() {
  const BRAND = await getSiteSettings();
  const channels = channelsFor(BRAND);

  return (
    <>
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-field-900">
          <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-water-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:pb-12 sm:pt-10">
            <nav aria-label="Fil d'Ariane" className="text-xs text-soil-300">
              <Link href="/" className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] transition hover:text-water-300">
                Accueil
              </Link>
              <span aria-hidden="true" className="mx-2 text-soil-400">/</span>
              <span className="text-soil-200">Contact</span>
            </nav>

            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Un projet d’irrigation ? Parlons-en.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-soil-300/80 sm:text-base">
              Devis, conseil de dimensionnement ou disponibilité d’une
              référence : un technicien vous répond sous 24h ouvrées.
            </p>
          </div>
        </section>

        <section className="bg-soil-50 py-10 sm:py-12">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div>
              <div className="grid gap-3">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    channel.accent ? (
                      <WhatsAppLink
                        key={channel.title}
                        href={channel.href}
                        source="contact"
                        message={generalMessage()}
                        className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                        channel.accent
                          ? "border-whatsapp/30 bg-white hover:border-whatsapp"
                          : "border-soil-200 bg-white hover:border-water-300"
                      }`}
                      >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          channel.accent
                            ? "bg-whatsapp/10 text-whatsapp"
                            : "bg-water-50 text-water-700"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soil-500">
                          {channel.title}
                        </p>
                        <p className="truncate text-sm font-semibold text-soil-900">
                          {channel.value}
                        </p>
                        <p className="mt-0.5 text-xs text-soil-500">
                          {channel.text}
                        </p>
                      </div>
                      </WhatsAppLink>
                    ) : (
                    <a
                      key={channel.title}
                      href={channel.href}
                      {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                        channel.accent
                          ? "border-whatsapp/30 bg-white hover:border-whatsapp"
                          : "border-soil-200 bg-white hover:border-water-300"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          channel.accent
                            ? "bg-whatsapp/10 text-whatsapp"
                            : "bg-water-50 text-water-700"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soil-500">
                          {channel.title}
                        </p>
                        <p className="truncate text-sm font-semibold text-soil-900">
                          {channel.value}
                        </p>
                        <p className="mt-0.5 text-xs text-soil-500">
                          {channel.text}
                        </p>
                      </div>
                    </a>
                    )
                  );
                })}
              </div>

              <div className="mt-3 rounded-2xl border border-soil-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-water-50 text-water-700">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soil-500">
                      Adresse & horaires
                    </p>
                    <p className="text-sm font-semibold text-soil-900">
                      {BRAND.address}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-soil-500">
                      <Clock className="h-3.5 w-3.5 text-water-600" />
                      {BRAND.hours}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-3 rounded-2xl border border-soil-200 bg-white p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-water-50 text-water-700">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soil-500">
                    Livraison
                  </p>
                  <p className="text-sm font-semibold text-soil-900">
                    Partout au Maroc
                  </p>
                  <p className="mt-0.5 text-xs text-soil-500">
                    Retrait sur place ou expédition selon volume et région.
                  </p>
                </div>
              </div>
            </div>

            <QuoteForm />
          </div>
        </section>
      </main>

      <SiteFooterWithSettings />
      <MobileCta />
    </>
  );
}
