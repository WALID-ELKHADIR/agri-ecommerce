import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  WhatsApp,
} from "@/components/icons";
import { Logo } from "@/components/brand/logo";
import { BRAND, generalMessage } from "@/lib/catalog";
import { whatsappUrl, type SiteConfig } from "@/lib/site-config";
import { WhatsAppLink } from "@/components/whatsapp-link";

const rangeLinks = [
  { href: "/produits", label: "Pompes & motopompes" },
  { href: "/produits", label: "Raccords & fittings" },
  { href: "/produits", label: "Kits complets" },
  { href: "/produits", label: "Tuyauterie & filtration" },
];

const infoLinks = [
  { href: "/#services", label: "Conseil & dimensionnement" },
  { href: "/#services", label: "Livraison & stock" },
  { href: "/contact", label: "Demander un devis" },
  { href: "/contact", label: "Service après-vente" },
];

const YEAR = 2026;

/**
 * Pied de page. `brand` : coordonnées issues des réglages de l'admin (voir
 * SiteFooterWithSettings) ; à défaut, celles des variables d'environnement.
 */
export function SiteFooter({ brand = BRAND }: { brand?: SiteConfig }) {
  return (
    <footer id="contact" className="border-t border-soil-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:pb-14 sm:pt-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <Link href="/" aria-label="Saqia — accueil" className="flex min-h-11 items-center">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-soil-600">
              Matériel d’irrigation et de pompage pour les agriculteurs et les
              professionnels : pompes centrifuges et immergées, raccords PE/PVC
              et kits prêts à installer.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-soil-100 px-3 py-1.5 text-[11px] font-medium text-soil-600">
                <ShieldCheck className="h-3.5 w-3.5 text-water-600" />
                Garantie constructeur
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-soil-100 px-3 py-1.5 text-[11px] font-medium text-soil-600">
                <Truck className="h-3.5 w-3.5 text-water-600" />
                Livraison nationale
              </span>
            </div>

            <WhatsAppLink
              href={whatsappUrl(generalMessage(), brand.whatsappNumber)}
              source="footer"
              message={generalMessage()}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
            >
              <WhatsApp className="h-4 w-4" />
              Discuter sur WhatsApp
            </WhatsAppLink>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-soil-500">
              Nos gammes
            </h3>
            <ul className="mt-4 space-y-2.5">
              {rangeLinks.map((link) => (
                <li key={link.label}>
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
              Informations
            </h3>
            <ul className="mt-4 space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.label}>
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
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-soil-600">
              <li>
                <a
                  href={`tel:${brand.phoneRaw}`}
                  className="flex min-h-11 items-start gap-2.5 py-1 transition hover:text-water-700 lg:min-h-0"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-water-600" />
                  {brand.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="flex min-h-11 items-start gap-2.5 py-1 transition hover:text-water-700 lg:min-h-0"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-water-600" />
                  {brand.email}
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

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-soil-200 pt-6 text-center text-xs text-soil-500 sm:flex-row sm:text-left">
          <p>© {YEAR} {brand.name}. Tous droits réservés.</p>
          <p>Matériel professionnel · Devis et conseil technique inclus</p>
        </div>
      </div>
    </footer>
  );
}
