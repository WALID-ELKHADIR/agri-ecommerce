"use client";

import { useEffect } from "react";

/** Enregistre le service worker (public/sw.js), en production seulement. */
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sans service worker, le site fonctionne normalement (pas de page hors ligne).
    });
  }, []);
  return null;
}
