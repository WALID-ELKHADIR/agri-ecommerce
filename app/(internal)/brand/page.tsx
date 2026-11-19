import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site-config";

// Page interne de référence : jamais indexée, absente du sitemap.
export const metadata: Metadata = {
  title: "Logo et marque — Saqia (interne)",
  robots: { index: false, follow: false },
};

const COLORS = [
  { name: "field-600", hex: "#3a6631", role: "Primaire, parcelle", dark: true },
  { name: "field-900", hex: "#1a2c18", role: "Fonds foncés", dark: true },
  { name: "water-600", hex: "#177c87", role: "Secondaire, canal", dark: true },
  { name: "harvest-300", hex: "#f6c75f", role: "Accent, texte foncé", dark: false },
  { name: "soil-50", hex: "#faf8f3", role: "Fond principal", dark: false },
  { name: "soil-900", hex: "#1f1c16", role: "Texte", dark: true },
  { name: "whatsapp", hex: "#0f7a43", role: "Boutons WhatsApp seulement", dark: true },
] as const;

const SYMBOL_SIZES = [
  { size: 16, className: "h-4 w-4" },
  { size: 24, className: "h-6 w-6" },
  { size: 32, className: "h-8 w-8" },
  { size: 48, className: "h-12 w-12" },
  { size: 64, className: "h-16 w-16" },
] as const;

const FILES = [
  { src: "/brand/avatar-640.png", label: "Avatar WhatsApp, clair", round: true },
  { src: "/brand/avatar-640-dark.png", label: "Avatar WhatsApp, foncé", round: true },
  { src: "/icons/maskable-512.png", label: "Icône PWA maskable", round: true },
  { src: "/apple-icon.png", label: "Icône Apple", round: false },
] as const;

function Section({ title, children, note }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="border-t border-[#e5ddcb] py-10">
      <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-[#1f1c16]">{title}</h2>
      {note ? <p className="mt-2 max-w-prose text-sm leading-relaxed text-[#6b6352]">{note}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Tile({ dark = false, className = "", children }: { dark?: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl px-6 py-10 ${
        dark ? "bg-[#1a2c18]" : "bg-[#faf8f3] ring-1 ring-[#e5ddcb]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="pb-10">
          <Logo animated title={siteConfig.name} className="h-16 w-auto sm:h-20" />
          <h1 className="mt-8 font-display text-4xl font-bold tracking-[-0.035em] text-[#1f1c16] sm:text-5xl">
            Logo et marque
          </h1>
          <p className="mt-4 max-w-prose text-[17px] leading-relaxed text-[#1f1c16]">
            Une parcelle pleine, traversée par un canal en S : la <span lang="ar">ساقية</span> qui amène l’eau
            au bon endroit. Règles complètes dans <code className="text-[15px]">docs/brand.md</code>.
          </p>
        </header>

        <Section title="Versions">
          <div className="grid gap-4 sm:grid-cols-2">
            <Tile>
              <Logo title="Saqia, couleur" className="h-14 w-auto" />
            </Tile>
            <Tile dark>
              <Logo tone="inverse" title="Saqia, inversé" className="h-14 w-auto" />
            </Tile>
            <Tile>
              <Logo tone="mono" title="Saqia, monochrome" className="h-14 w-auto text-[#1f1c16]" />
            </Tile>
            <Tile>
              <Logo lang="ar" title="ساقية" className="h-14 w-auto" />
            </Tile>
          </div>
        </Section>

        <Section
          title="Petites tailles"
          note="Jusqu’à 32 px, le symbole passe en version renforcée : canal plus épais, coins un peu plus serrés."
        >
          <Tile className="justify-start gap-8">
            {SYMBOL_SIZES.map(({ size, className }) => (
              <figure key={size} className="flex flex-col items-center gap-2">
                <Logo variant="symbol" small={size <= 32} className={className} />
                <figcaption className="text-xs tabular-nums text-[#6b6352]">{size} px</figcaption>
              </figure>
            ))}
          </Tile>
        </Section>

        <Section
          title="Zone de protection"
          note="Un quart de la hauteur du symbole sur les quatre côtés. Taille minimale du logo complet : 24 px de haut."
        >
          <Tile>
            <div className="outline-2 outline-offset-0 outline-dashed outline-[#177c87]/50">
              {/* Logo de 56 px de haut : zone de protection de 14 px. */}
              <div className="p-3.5">
                <Logo className="h-14 w-auto" />
              </div>
            </div>
          </Tile>
        </Section>

        <Section title="Avatars et icônes" note="Le cercle montre le recadrage appliqué par WhatsApp et Android.">
          <div className="flex flex-wrap gap-6">
            {FILES.map((file) => (
              <figure key={file.src} className="flex flex-col items-center gap-2">
                <Image
                  src={file.src}
                  alt=""
                  width={120}
                  height={120}
                  className={file.round ? "rounded-full" : "rounded-[22%]"}
                />
                <figcaption className="text-xs text-[#6b6352]">{file.label}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section title="Couleurs">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {COLORS.map((color) => (
              <li key={color.name} className="overflow-hidden rounded-xl ring-1 ring-[#e5ddcb]">
                <div className="h-16" style={{ backgroundColor: color.hex }} />
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-[#1f1c16]">{color.name}</p>
                  <p className="text-xs tabular-nums text-[#6b6352]">{color.hex}</p>
                  <p className="text-xs text-[#6b6352]">{color.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Typographie">
          <p className="font-display text-5xl font-bold tracking-[-0.035em] text-[#1f1c16]">{siteConfig.slogan}</p>
          <p className="mt-2 text-sm text-[#6b6352]">Bricolage Grotesque, 700 — titres et chiffres clés</p>
          <p className="mt-6 max-w-prose text-[17px] leading-relaxed text-[#1f1c16]">
            Pompes immergées, centrifuges et raccords PE : nous vous aidons à choisir le bon débit et la bonne
            hauteur, puis nous vous envoyons le devis sur WhatsApp.
          </p>
          <p className="mt-2 text-sm text-[#6b6352]">Geist — texte courant</p>
        </Section>
      </div>
    </main>
  );
}
