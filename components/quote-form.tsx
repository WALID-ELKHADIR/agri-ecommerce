"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, WhatsApp } from "@/components/icons";
import { saveQuoteRequest } from "@/lib/actions/quotes";
import { BRAND, whatsappLink } from "@/lib/catalog";

const profiles = [
  "Agriculteur / exploitation",
  "Coopérative ou société agricole",
  "Paysagiste / espaces verts",
  "Revendeur / distributeur",
  "Autre",
];

type Status = "idle" | "saving" | "saved";

export function QuoteForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profile, setProfile] = useState(profiles[0]);
  const [need, setNeed] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState<string | null>(null);
  // Champ piège (invisible pour un humain) et heure d'affichage du formulaire.
  const [website, setWebsite] = useState("");
  const mountedAt = useRef<number | undefined>(undefined);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const message = [
      `Bonjour ${BRAND.name} 👋,`,
      "Je souhaite un devis pour du matériel d'irrigation / de pompage.",
      "",
      name ? `• Nom : ${name}` : null,
      phone ? `• Téléphone : ${phone}` : null,
      `• Profil : ${profile}`,
      need ? `• Besoin : ${need}` : null,
      "",
      "Merci de me proposer une configuration adaptée.",
    ]
      .filter(Boolean)
      .join("\n");

    // Ouvre WhatsApp tout de suite : le navigateur bloque les fenêtres
    // ouvertes après un appel réseau.
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");

    setStatus("saving");
    setNotice(null);
    void saveQuoteRequest({
      name,
      phone,
      profile,
      message: need,
      source: "contact",
      website,
      // Durée mesurée dans le navigateur : insensible au décalage d'horloge.
      elapsedMs: mountedAt.current === undefined ? undefined : Date.now() - mountedAt.current,
    }).then((result) => {
      setStatus(result.ok ? "saved" : "idle");
      if (!result.ok && result.reason === "rate-limited") {
        setNotice(result.message ?? null);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-soil-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 className="text-lg font-semibold text-soil-900">
        Décrivez votre projet
      </h2>
      <p className="mt-1 text-xs text-soil-500">
        Remplissez ces champs : votre demande part sur WhatsApp et reste
        enregistrée pour notre équipe.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-soil-600">Nom</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Votre nom ou votre exploitation"
            className="min-h-11 w-full rounded-xl border border-soil-300 bg-white px-3.5 py-2.5 text-sm text-soil-900 placeholder:text-soil-500 focus:border-water-500"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-soil-600">
            Téléphone (optionnel)
          </span>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+212 6 00 00 00 00"
            className="min-h-11 w-full rounded-xl border border-soil-300 bg-white px-3.5 py-2.5 text-sm text-soil-900 placeholder:text-soil-500 focus:border-water-500"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-soil-600">
            Votre profil
          </span>
          <select
            value={profile}
            onChange={(event) => setProfile(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-soil-300 bg-white px-3.5 py-2.5 text-sm text-soil-900 focus:border-water-500"
          >
            {profiles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-soil-600">
            Votre besoin
          </span>
          <textarea
            value={need}
            onChange={(event) => setNeed(event.target.value)}
            rows={4}
            placeholder="Ex : pompe immergée pour un forage de 40 m, irrigation de 2 ha…"
            className="w-full resize-none rounded-xl border border-soil-300 bg-white px-3.5 py-2.5 text-sm text-soil-900 placeholder:text-soil-500 focus:border-water-500"
          />
        </label>
      </div>

      {/* Champ piège : masqué aux humains et aux lecteurs d'écran, rempli par les robots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site web
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-whatsapp-hover disabled:opacity-70"
      >
        <WhatsApp className="h-5 w-5" />
        Envoyer sur WhatsApp
      </button>

      {notice ? (
        <p role="status" className="mt-2 text-center text-[11px] font-medium text-harvest-800">
          {notice}
        </p>
      ) : status === "saved" ? (
        <p
          role="status"
          className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-field-700"
        >
          <Check className="h-3.5 w-3.5" />
          Demande enregistrée — WhatsApp s’est ouvert dans un nouvel onglet.
        </p>
      ) : (
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-soil-500">
          Réponse d’un technicien sous 24h ouvrées
          <ArrowRight className="h-3 w-3" />
        </p>
      )}
    </form>
  );
}
