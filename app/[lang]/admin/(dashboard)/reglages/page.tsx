import { Suspense } from "react";
import { AdminHeader, SetupNotice } from "@/components/admin/dashboard";
import { FormSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { saveSettingsAction } from "@/lib/actions/settings";
import { requireAdmin } from "@/lib/auth";
import { regionsToText } from "@/lib/settings-merge";
import { siteConfig } from "@/lib/site-config";
import { getStoredSettings } from "@/lib/site-settings";

export default function ReglagesPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Reglages />
    </Suspense>
  );
}

async function Reglages() {
  await requireAdmin();
  const { contact, regions } = await getStoredSettings();

  return (
    <div className="space-y-4">
      <SetupNotice />
      <AdminHeader
        title="Réglages"
        description="Coordonnées affichées sur le site et numéro qui reçoit les demandes WhatsApp."
      />

      <form action={saveSettingsAction} className="grid gap-6">
        <section className="grid gap-4 rounded-card border border-soil-200 bg-white p-5 shadow-soft sm:p-6">
          <div>
            <h2 className="font-semibold text-soil-900">Coordonnées</h2>
            <p className="mt-1 text-sm text-soil-600">
              Laissez un champ vide pour garder la valeur par défaut, indiquée sous chaque champ.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Numéro WhatsApp des demandes"
              name="whatsappNumber"
              type="tel"
              inputMode="tel"
              defaultValue={contact.whatsappNumber}
              placeholder="06 12 34 56 78"
              hint={`Par défaut : +${siteConfig.whatsappNumber}`}
            />
            <Input
              label="Téléphone affiché"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={contact.phone}
              placeholder="05 22 11 22 33"
              hint={`Par défaut : ${siteConfig.phoneDisplay}`}
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              defaultValue={contact.email}
              hint={`Par défaut : ${siteConfig.email}`}
            />
            <Input label="Horaires" name="hours" defaultValue={contact.hours} hint={`Par défaut : ${siteConfig.hours}`} />
          </div>
          <Input label="Adresse" name="address" defaultValue={contact.address} hint={`Par défaut : ${siteConfig.address}`} />
        </section>

        <section className="grid gap-4 rounded-card border border-soil-200 bg-white p-5 shadow-soft sm:p-6">
          <div>
            <h2 className="font-semibold text-soil-900">Numéros WhatsApp par région</h2>
            <p className="mt-1 text-sm text-soil-600">
              Préparé pour orienter chaque client vers le commercial de sa région. Ces numéros sont enregistrés, mais
              le site utilise pour l&apos;instant le numéro principal ; le routage par région arrive avec la refonte de
              la vitrine.
            </p>
          </div>
          <Textarea
            label="Une région par ligne"
            name="regions"
            rows={5}
            defaultValue={regionsToText(regions)}
            placeholder={"Souss-Massa : 06 70 00 00 01\nOriental : 06 70 00 00 02"}
            hint="Format : Région : numéro"
          />
        </section>

        <div className="flex justify-end">
          <Button type="submit">Enregistrer les réglages</Button>
        </div>
      </form>
    </div>
  );
}
