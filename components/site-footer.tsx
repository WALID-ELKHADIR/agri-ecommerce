import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Truck,
  WhatsApp,
} from "@/components/icons";
import { Logo } from "@/components/brand/logo";
import { BRAND, generalMessage } from "@/lib/catalog";
import type { SiteConfig } from "@/lib/site-config";
import { WhatsAppServerLink } from "@/components/whatsapp-server-link";
import { getDictionary } from "@/lib/i18n/server";

const RANGE_HREFS = ["/produits?gamme=pompes", "/produits?gamme=raccords", "/produits?gamme=kits", "/produits?gamme=arrosage"];
const INFO_HREFS = ["/#services", "/#faq", "/contact", "/contact"];

const YEAR = 2026;

/**
 * Pied de page. `brand` : coordonnées issues des réglages de l'admin (voir
 * SiteFooterWithSettings) ; à défaut, celles des variables d'environnement.
 */
export async function SiteFooter({ brand = BRAND }: { brand?: SiteConfig }) {
  const t = await getDictionary();
  const rangeLinks = RANGE_HREFS.map((href, index) => ({ href, label: t.footer.rangeLinks[index] }));
  const infoLinks = INFO_HREFS.map((href, index) => ({ href, label: t.footer.infoLinks[index] }));
  return (
    <footer id="contact" className="border-t border-soil-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:pb-14 sm:pt-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <Link href="/" aria-label={t.homeLabel} className="flex min-h-11 items-center">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-soil-600">
              {t.footer.about}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-soil-100 px-3 py-1.5 text-[11px] font-medium text-soil-600">
                <Truck className="h-3.5 w-3.5 text-water-600" />
                {t.footer.delivery}
              </span>
            </div>

            <WhatsAppServerLink
              source="footer"
              message={generalMessage(t)}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
            >
              <WhatsApp className="h-4 w-4" />
              {t.footer.chat}
            </WhatsAppServerLink>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-soil-500">
              {t.footer.ranges}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {rangeLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-soil-600 transition hover:text-water-700 lg:min-h-0 lg:py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-soil-500">
              {t.footer.information}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {infoLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-soil-600 transition hover:text-water-700 lg:min-h-0 lg:py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-soil-500">
              {t.footer.contact}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-soil-600">
              <li>
                <a
                  href={`tel:${brand.phoneRaw}`}
                  className="flex min-h-11 items-start gap-2.5 py-1 transition hover:text-water-700 lg:min-h-0"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-water-600" />
                  <bdi dir="ltr">{brand.phoneDisplay}</bdi>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="flex min-h-11 items-start gap-2.5 py-1 transition hover:text-water-700 lg:min-h-0"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-water-600" />
                  <bdi dir="ltr">{brand.email}</bdi>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-water-600" />
                {brand.address}
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-water-600" />
                {brand.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-soil-200 pt-6 text-center text-xs text-soil-500 sm:flex-row sm:text-start">
          <p>{t.footer.rights(YEAR)}</p>
          <p>{t.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
