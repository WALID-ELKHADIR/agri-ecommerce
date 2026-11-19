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
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND, generalMessage, whatsappLink } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Contact & devis — Saqia, pompes et irrigation",
  description:
    "Contactez Saqia pour un devis de pompes, raccords PE/PVC ou kits d'irrigation. WhatsApp, téléphone et e-mail — réponse sous 24h.",
};

const channels = [
  {
    icon: WhatsApp,
    title: "WhatsApp",
    value: BRAND.phoneDisplay,
    text: "Le plus rapide : photos, schémas et devis direct.",
    href: whatsappLink(generalMessage()),
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

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-[#0A2540]">
          <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:pb-12 sm:pt-10">
            <nav aria-label="Fil d'Ariane" className="text-xs text-slate-400">
              <Link href="/" className="transition hover:text-cyan-300">
                Accueil
              </Link>
              <span className="mx-2 text-slate-600">/</span>
              <span className="text-slate-200">Contact</span>
            </nav>

            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Un projet d’irrigation ? Parlons-en.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300/80 sm:text-base">
              Devis, conseil de dimensionnement ou disponibilité d’une
              référence : un technicien vous répond sous 24h ouvrées.
            </p>
          </div>
        </section>

        <section className="bg-[#f5f8fb] py-10 sm:py-12">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div>
              <div className="grid gap-3">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <a
                      key={channel.title}
                      href={channel.href}
                      {...(channel.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                        channel.accent
                          ? "border-[#1FA855]/30 bg-white hover:border-[#1FA855]"
                          : "border-slate-200 bg-white hover:border-cyan-300"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          channel.accent
                            ? "bg-[#1FA855]/10 text-[#1FA855]"
                            : "bg-cyan-50 text-cyan-700"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {channel.title}
                        </p>
                        <p className="truncate text-sm font-semibold text-[#0A2540]">
                          {channel.value}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {channel.text}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Adresse & horaires
                    </p>
                    <p className="text-sm font-semibold text-[#0A2540]">
                      {BRAND.address}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-cyan-600" />
                      {BRAND.hours}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Livraison
                  </p>
                  <p className="text-sm font-semibold text-[#0A2540]">
                    Partout au Maroc
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Retrait sur place ou expédition selon volume et région.
                  </p>
                </div>
              </div>
            </div>

            <QuoteForm />
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileCta />
    </>
  );
}
