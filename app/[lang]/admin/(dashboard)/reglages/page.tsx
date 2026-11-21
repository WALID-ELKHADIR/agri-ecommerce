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
import { getAdminDictionary } from "@/lib/i18n/server";

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
  const t = await getAdminDictionary();
  const r = t.settings;
  const byDefault = t.common.defaultValue;

  return (
    <div className="space-y-4">
      <SetupNotice />
      <AdminHeader
        title={r.title}
        description={r.description}
      />

      <form action={saveSettingsAction} className="grid gap-6">
        <section className="grid gap-4 rounded-card border border-soil-200 bg-white p-5 shadow-soft sm:p-6">
          <div>
            <h2 className="font-semibold text-soil-900">{r.contact}</h2>
            <p className="mt-1 text-sm text-soil-600">
              {r.contactText}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={r.whatsapp}
              name="whatsappNumber"
              type="tel"
              inputMode="tel"
              defaultValue={contact.whatsappNumber}
              placeholder="06 12 34 56 78"
              dir="ltr"
              hint={byDefault(`+${siteConfig.whatsappNumber}`)}
            />
            <Input
              label={r.phone}
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={contact.phone}
              placeholder="05 22 11 22 33"
              dir="ltr"
              hint={byDefault(siteConfig.phoneDisplay)}
            />
            <Input
              label={r.email}
              name="email"
              type="email"
              defaultValue={contact.email}
              dir="ltr"
              hint={byDefault(siteConfig.email)}
            />
            <Input label={r.hours} name="hours" defaultValue={contact.hours} hint={byDefault(siteConfig.hours)} />
          </div>
          <Input label={r.address} name="address" defaultValue={contact.address} hint={byDefault(siteConfig.address)} />
        </section>

        <section className="grid gap-4 rounded-card border border-soil-200 bg-white p-5 shadow-soft sm:p-6">
          <div>
            <h2 className="font-semibold text-soil-900">{r.regions}</h2>
            <p className="mt-1 text-sm text-soil-600">
              {r.regionsText}
            </p>
          </div>
          <Textarea
            label={r.regionsField}
            name="regions"
            rows={5}
            defaultValue={regionsToText(regions)}
            placeholder={"Souss-Massa : 06 70 00 00 01\nOriental : 06 70 00 00 02"}
            hint={r.regionsHint}
          />
        </section>

        <div className="flex justify-end">
          <Button type="submit">{r.save}</Button>
        </div>
      </form>
    </div>
  );
}
