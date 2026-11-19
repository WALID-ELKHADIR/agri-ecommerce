import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import type { ComponentType, ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";
import { PISTES, type Tone } from "./_pistes";

// Page interne de travail : jamais indexée, absente du sitemap.
export const metadata: Metadata = {
  title: "Pistes de logo — Saqia (interne)",
  robots: { index: false, follow: false },
};

const plexArabic = IBM_Plex_Sans_Arabic({
  weight: ["600"],
  subsets: ["arabic"],
  display: "swap",
});

type SymbolComponent = ComponentType<{ tone?: Tone; size?: number; title?: string }>;

const LIGHT = "bg-[#faf8f3]"; // soil-50
const DARK = "bg-[#1a2c18]"; // field-900

function Wordmark({ inverse = false, className = "" }: { inverse?: boolean; className?: string }) {
  return (
    <span
      className={`font-display font-bold leading-none tracking-[-0.045em] ${
        inverse ? "text-white" : "text-[#1f1c16]"
      } ${className}`}
    >
      saqia
    </span>
  );
}

function WordmarkArabic({ inverse = false, className = "" }: { inverse?: boolean; className?: string }) {
  return (
    <span
      lang="ar"
      dir="rtl"
      className={`${plexArabic.className} leading-none ${inverse ? "text-white" : "text-[#1f1c16]"} ${className}`}
    >
      ساقية
    </span>
  );
}

function Panel({ dark = false, className = "", children }: { dark?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-xl ${dark ? DARK : `${LIGHT} ring-1 ring-[#e5ddcb]`} ${className}`}>{children}</div>
  );
}

function Piste({
  letter,
  name,
  Symbol,
  idea,
  strengths,
  risks,
}: {
  letter: string;
  name: string;
  Symbol: SymbolComponent;
  idea: string;
  strengths: string;
  risks: string;
}) {
  return (
    <section aria-labelledby={`piste-${letter}`} className="border-t border-[#e5ddcb] py-12 first:border-t-0">
      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div className="max-w-prose">
          <h2 id={`piste-${letter}`} className="font-display text-3xl font-bold tracking-[-0.03em] text-[#1f1c16]">
            Piste {letter.toUpperCase()} : {name}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#1f1c16]">{idea}</p>
          <dl className="mt-5 space-y-3 text-sm leading-relaxed">
            <div>
              <dt className="font-semibold text-[#2f5129]">Points forts</dt>
              <dd className="text-[#6b6352]">{strengths}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#6b6352]">À surveiller</dt>
              <dd className="text-[#6b6352]">{risks}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-4">
          {/* Grand format : couleur sur clair, inversé sur foncé, monochrome */}
          <div className="grid grid-cols-3 gap-4">
            <Panel className="flex aspect-square items-center justify-center p-6">
              <div className="w-full max-w-[256px] [&>svg]:h-auto [&>svg]:w-full">
                <Symbol size={256} title={`Saqia, piste ${name}, couleur`} />
              </div>
            </Panel>
            <Panel dark className="flex aspect-square items-center justify-center p-6">
              <div className="w-full max-w-[256px] [&>svg]:h-auto [&>svg]:w-full">
                <Symbol size={256} tone="inverse" title={`Saqia, piste ${name}, inversé`} />
              </div>
            </Panel>
            <Panel className="flex aspect-square items-center justify-center p-6">
              <div className="w-full max-w-[256px] [&>svg]:h-auto [&>svg]:w-full">
                <Symbol size={256} tone="mono" title={`Saqia, piste ${name}, monochrome`} />
              </div>
            </Panel>
          </div>

          {/* Petites tailles : la lisibilité réelle */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[false, true].map((dark) => (
              <Panel key={String(dark)} dark={dark} className="flex items-end gap-6 px-6 py-5">
                {[16, 32, 64].map((size) => (
                  <figure key={size} className="flex flex-col items-center gap-2">
                    <Symbol size={size} tone={dark ? "inverse" : "color"} />
                    <figcaption className={`text-xs tabular-nums ${dark ? "text-white/60" : "text-[#6b6352]"}`}>
                      {size} px
                    </figcaption>
                  </figure>
                ))}
              </Panel>
            ))}
          </div>

          {/* Logotypes complets FR / AR */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel className="flex items-center justify-center gap-3 px-6 py-8">
              <Symbol size={48} />
              <Wordmark className="text-[44px]" />
            </Panel>
            <Panel dark className="flex items-center justify-center gap-3 px-6 py-8">
              <WordmarkArabic inverse className="text-[38px]" />
              <Symbol size={48} tone="inverse" />
            </Panel>
          </div>

          {/* En situation : header mobile et avatar WhatsApp */}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Panel className="overflow-hidden p-0">
              <div className="mx-auto max-w-[390px] bg-white shadow-[0_1px_0_#e5ddcb]">
                <div className="flex h-14 items-center justify-between px-4">
                  <span className="flex items-center gap-2">
                    <Symbol size={28} />
                    <Wordmark className="text-[24px]" />
                  </span>
                  <span className="rounded-full bg-[#0f7a43] px-3 py-1.5 text-xs font-semibold text-white">
                    Devis WhatsApp
                  </span>
                </div>
              </div>
              <p className="px-4 pb-3 pt-2 text-center text-xs text-[#6b6352]">Header mobile, 390 px</p>
            </Panel>
            <Panel className="flex items-center gap-5 px-6 py-4">
              <figure className="flex flex-col items-center gap-2">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1a2c18]">
                  <Symbol size={44} tone="inverse" />
                </span>
                <figcaption className="text-xs text-[#6b6352]">Avatar foncé</figcaption>
              </figure>
              <figure className="flex flex-col items-center gap-2">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white ring-1 ring-[#e5ddcb]">
                  <Symbol size={44} />
                </span>
                <figcaption className="text-xs text-[#6b6352]">Avatar clair</figcaption>
              </figure>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <Wordmark className="text-5xl" />
          <h1 className="mt-6 font-display text-4xl font-bold tracking-[-0.035em] text-[#1f1c16] sm:text-5xl">
            Trois pistes pour le symbole
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#1f1c16]">
            {siteConfig.name} vient de <span lang="ar">ساقية</span>, la rigole qui amène l’eau aux cultures.
            Chaque piste fusionne la lettre S, ce canal d’eau et les parcelles qu’il irrigue. Comparez-les surtout
            aux petites tailles et dans le header mobile, là où le logo sera vu le plus souvent.
          </p>
          <p className="mt-3 text-sm text-[#6b6352]">
            Page interne, non indexée. Le logo retenu sera ensuite décliné (favicon, icônes, avatar, image de partage).
          </p>
        </header>

        {PISTES.map((piste) => (
          <Piste
            key={piste.id}
            letter={piste.id}
            name={piste.name}
            Symbol={piste.Symbol}
            idea={piste.idea}
            strengths={piste.strengths}
            risks={piste.risks}
          />
        ))}
      </div>
    </main>
  );
}
