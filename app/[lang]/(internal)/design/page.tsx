import type { Metadata } from "next";
import type { ReactNode } from "react";
import { WhatsApp } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select, Textarea } from "@/components/ui/field";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveDemo } from "./_interactive-demo";

// Page interne de référence du design system : jamais indexée.
export const metadata: Metadata = {
  title: "Design system — Saqia (interne)",
  robots: { index: false, follow: false },
};

const PALETTES = [
  { name: "field", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "water", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "harvest", shades: [50, 100, 200, 300, 500, 800, 900] },
  { name: "soil", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "danger", shades: [50, 100, 200, 600, 700] },
] as const;

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-soil-200 py-10">
      <h2 className="mb-6 font-display text-h3 font-bold text-soil-900">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignPage() {
  return (
    <main className="min-h-screen bg-soil-50 py-10">
      <Container size="narrow">
        <SectionHeading
          as="h1"
          title="Design system"
          description="Tokens et composants de base de Saqia. Toute nouvelle interface part d’ici."
        />

        <Block title="Couleurs">
          <div className="grid gap-4">
            {PALETTES.map((palette) => (
              <div key={palette.name}>
                <p className="mb-2 text-sm font-semibold text-soil-800">{palette.name}</p>
                <div className="flex overflow-hidden rounded-control ring-1 ring-soil-200">
                  {palette.shades.map((shade) => (
                    <div
                      key={shade}
                      className="h-12 flex-1"
                      style={{ backgroundColor: `var(--color-${palette.name}-${shade})` }}
                      title={`${palette.name}-${shade}`}
                    />
                  ))}
                </div>
              </div>
            ))}
            <p className="text-sm text-soil-600">
              Le vert WhatsApp (<span className="font-semibold text-whatsapp">whatsapp</span>) n’apparaît que sur les
              boutons de conversion.
            </p>
          </div>
        </Block>

        <Block title="Typographie">
          <div className="grid gap-4">
            <p className="font-display text-display font-bold text-soil-900">L’eau au bon endroit.</p>
            <p className="font-display text-h1 font-bold text-soil-900">Pompes immergées</p>
            <p className="font-display text-h2 font-bold text-soil-900">Raccords PE à compression</p>
            <p className="font-display text-h3 font-bold text-soil-900">Comment choisir sa pompe</p>
            <p className="max-w-prose text-[17px] leading-relaxed text-soil-800">
              Indiquez la profondeur de votre forage et le débit souhaité : nous vous proposons la pompe adaptée et
              vous envoyons le devis sur WhatsApp.
            </p>
            <p className="text-sm text-soil-500">Texte secondaire, 14 px, soil-500 (4,8:1 sur soil-50).</p>
          </div>
        </Block>

        <Block title="Boutons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Voir le catalogue</Button>
            <Button variant="secondary">Comparer</Button>
            <Button variant="ghost">Annuler</Button>
            <Button variant="whatsapp">
              <WhatsApp className="h-5 w-5" />
              Demander un devis
            </Button>
            <Button loading>Enregistrement</Button>
            <Button disabled>Indisponible</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary">
              Petit
            </Button>
            <Button size="md" variant="secondary">
              Moyen
            </Button>
            <Button size="lg" variant="secondary">
              Grand
            </Button>
          </div>
        </Block>

        <Block title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Sur commande</Badge>
            <Badge tone="field">Disponible</Badge>
            <Badge tone="water">Inox</Badge>
            <Badge tone="harvest">Nouveau</Badge>
            <Badge tone="danger">Rupture</Badge>
            <Badge tone="solid">Kit complet</Badge>
          </div>
        </Block>

        <Block title="Champs de formulaire">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nom" placeholder="Votre nom ou votre exploitation" autoComplete="name" />
            <Input label="Téléphone" type="tel" placeholder="06 12 34 56 78" hint="Pour vous rappeler si besoin." />
            <Select label="Votre profil" defaultValue="agriculteur">
              <option value="agriculteur">Agriculteur / exploitation</option>
              <option value="revendeur">Revendeur</option>
            </Select>
            <Input label="E-mail" type="email" defaultValue="ali@" error="Ajoutez la fin de l’adresse, par exemple ali@exemple.ma." />
            <div className="sm:col-span-2">
              <Textarea label="Votre besoin" placeholder="Ex. pompe immergée pour un forage de 40 m, irrigation de 2 ha" />
            </div>
          </div>
        </Block>

        <Block title="Fenêtres, tiroir et notifications">
          <InteractiveDemo />
        </Block>

        <Block title="Chargement et état vide">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-card bg-white p-4 shadow-soft">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
            <EmptyState
              title="Aucun produit ne correspond"
              description="Retirez un filtre ou décrivez votre besoin : nous trouvons la référence pour vous."
              action={<Button variant="secondary">Effacer les filtres</Button>}
            />
          </div>
        </Block>

        <Block title="Rayons et ombres">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex h-24 items-center justify-center rounded-control bg-white text-sm shadow-soft">
              control · soft
            </div>
            <div className="flex h-24 items-center justify-center rounded-card bg-white text-sm shadow-lifted">
              card · lifted
            </div>
            <div className="flex h-24 items-center justify-center rounded-panel bg-white text-sm shadow-overlay">
              panel · overlay
            </div>
          </div>
        </Block>
      </Container>
    </main>
  );
}
