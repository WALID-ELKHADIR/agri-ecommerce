import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
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
import { WhatsAppServerLink } from "@/components/whatsapp-server-link";
import { SiteFooterWithSettings } from "@/components/site-footer-server";
import { generalMessage } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({
    title: t.contactPage.metaTitle,
    description: t.contactPage.metaDescription,
    path: "/contact",
    siteUrl: siteConfig.siteUrl,
    ogLocale: t.meta.ogLocale,
  });
}

const cardClass = (accent: boolean) =>
  `flex items-start gap-3 rounded-2xl border p-4 transition ${
    accent ? "border-whatsapp/30 bg-white hover:border-whatsapp" : "border-soil-200 bg-white hover:border-water-300"
  }`;

function ChannelBody({
  icon: Icon,
  accent,
  title,
  value,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  accent: boolean;
  title: string;
  value: ReactNode;
  text: string;
}) {
  return (
    <>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          accent ? "bg-whatsapp/10 text-whatsapp" : "bg-water-50 text-water-700"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soil-500">{title}</p>
        <p className="truncate text-sm font-semibold text-soil-900">{value}</p>
        <p className="mt-0.5 text-xs text-soil-500">{text}</p>
      </div>
    </>
  );
}

export default async function ContactPage() {
  const BRAND = await getSiteSettings();
  const t = await getDictionary();
  const page = t.contactPage;
  // Les numéros et adresses restent de gauche à droite, même en arabe.
  const phone = <bdi dir="ltr">{BRAND.phoneDisplay}</bdi>;

  return (
    <>
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-field-900">
          <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-water-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:pb-12 sm:pt-10">
            <nav aria-label={t.ui.breadcrumb} className="text-xs text-soil-300">
              <Link href="/" className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] transition hover:text-water-300">
                {t.navHome}
              </Link>
              <span aria-hidden="true" className="mx-2 text-soil-400">/</span>
              <span className="text-soil-200">{t.navContact}</span>
            </nav>

            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {page.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-soil-300/80 sm:text-base">{page.intro}</p>
          </div>
        </section>

        <section className="bg-soil-50 py-10 sm:py-12">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div>
              <div className="grid gap-3">
                <WhatsAppServerLink source="contact" message={generalMessage(t)} className={cardClass(true)}>
                  <ChannelBody icon={WhatsApp} accent title={t.ui.whatsapp} value={phone} text={page.whatsappText} />
                </WhatsAppServerLink>
                <a href={`tel:${BRAND.phoneRaw}`} className={cardClass(false)}>
                  <ChannelBody icon={Phone} accent={false} title={page.phoneTitle} value={phone} text={BRAND.hours} />
                </a>
                <a href={`mailto:${BRAND.email}`} className={cardClass(false)}>
                  <ChannelBody
                    icon={Mail}
                    accent={false}
                    title={page.emailTitle}
                    value={<bdi dir="ltr">{BRAND.email}</bdi>}
                    text={page.emailText}
                  />
                </a>
              </div>

              <div className="mt-3 rounded-2xl border border-soil-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-water-50 text-water-700">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soil-500">
                      {page.addressTitle}
                    </p>
                    <p className="text-sm font-semibold text-soil-900">{BRAND.address}</p>
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
                    {page.deliveryTitle}
                  </p>
                  <p className="text-sm font-semibold text-soil-900">{page.deliveryValue}</p>
                  <p className="mt-0.5 text-xs text-soil-500">{page.deliveryText}</p>
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
