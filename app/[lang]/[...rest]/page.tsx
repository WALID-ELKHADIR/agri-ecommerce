import { notFound } from "next/navigation";

/** Adresse inconnue : page 404 du site, dans la langue choisie (app/[lang]/not-found.tsx). */
export default function UnknownPage() {
  notFound();
}
