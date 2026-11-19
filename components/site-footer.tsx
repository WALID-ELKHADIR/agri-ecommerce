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
import { Logo } from "@/components/logo";
import {
  BRAND,
  generalMessage,
  whatsappLink,
} from "@/lib/catalog";

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

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:pb-14 sm:pt-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <Link href="/" aria-label="Saqia — accueil">
              <Logo />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Matériel d’irrigation et de pompage pour les agriculteurs et les
              professionnels : pompes centrifuges et immergées, raccords PE/PVC
              et kits prêts à installer.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
                Garantie constructeur
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600">
                <Truck className="h-3.5 w-3.5 text-cyan-600" />
                Livraison nationale
              </span>
            </div>

            <a
              href={whatsappLink(generalMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1FA855] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#178f47]"
            >
              <WhatsApp className="h-4 w-4" />
              Discuter sur WhatsApp
            </a>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Nos gammes
            </h3>
            <ul className="mt-4 space-y-2.5">
              {rangeLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition hover:text-cyan-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Informations
            </h3>
            <ul className="mt-4 space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition hover:text-cyan-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <a
                  href={`tel:${BRAND.phoneRaw}`}
                  className="flex items-start gap-2.5 transition hover:text-cyan-700"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  {BRAND.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="flex items-start gap-2.5 transition hover:text-cyan-700"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  {BRAND.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                {BRAND.address}
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                {BRAND.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
          <p>© {YEAR} {BRAND.name}. Tous droits réservés.</p>
          <p>Matériel professionnel · Devis et conseil technique inclus</p>
        </div>
      </div>
    </footer>
  );
}
