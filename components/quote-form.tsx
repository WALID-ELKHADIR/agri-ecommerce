"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, WhatsApp } from "@/components/icons";
import { whatsappLink } from "@/lib/catalog";

const profiles = [
  "Agriculteur / exploitation",
  "Coopérative ou société agricole",
  "Paysagiste / espaces verts",
  "Revendeur / distributeur",
  "Autre",
];

export function QuoteForm() {
  const [name, setName] = useState("");
  const [profile, setProfile] = useState(profiles[0]);
  const [need, setNeed] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const message = [
      "Bonjour AgriFlow 👋,",
      "Je souhaite un devis pour du matériel d'irrigation / de pompage.",
      "",
      name ? `• Nom : ${name}` : null,
      `• Profil : ${profile}`,
      need ? `• Besoin : ${need}` : null,
      "",
      "Merci de me proposer une configuration adaptée.",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 className="text-lg font-semibold text-[#0A2540]">
        Décrivez votre projet
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Remplissez ces trois champs : votre demande part directement sur
        WhatsApp.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-slate-600">Nom</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Votre nom ou votre exploitation"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-slate-600">
            Votre profil
          </span>
          <select
            value={profile}
            onChange={(event) => setProfile(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] focus:border-cyan-500 focus:outline-none"
          >
            {profiles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-slate-600">
            Votre besoin
          </span>
          <textarea
            value={need}
            onChange={(event) => setNeed(event.target.value)}
            rows={4}
            placeholder="Ex : pompe immergée pour un forage de 40 m, irrigation de 2 ha…"
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1FA855] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#178f47]"
      >
        <WhatsApp className="h-5 w-5" />
        Envoyer sur WhatsApp
      </button>

      <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-400">
        Réponse d’un technicien sous 24h ouvrées
        <ArrowRight className="h-3 w-3" />
      </p>
    </form>
  );
}
