"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "info" | "error";

type ToastInput = { title: string; description?: string; tone?: ToastTone };
type ToastItem = ToastInput & { id: number; tone: ToastTone };

const DURATION_MS = 4500;

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

const TONES: Record<ToastTone, { box: string; dot: string }> = {
  success: { box: "border-field-200", dot: "bg-field-600" },
  info: { box: "border-water-200", dot: "bg-water-600" },
  error: { box: "border-danger-200", dot: "bg-danger-600" },
};

/** Fournit `useToast()` et affiche les notifications (zone aria-live). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((toast: ToastInput) => {
    nextId.current += 1;
    setToasts((current) => [...current.slice(-2), { ...toast, tone: toast.tone ?? "success", id: nextId.current }]);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const tone = TONES[toast.tone];
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border bg-white py-3 pl-4 pr-1 shadow-lifted",
        "motion-safe:animate-[toast-in_var(--duration-base)_var(--ease-out-expo)]",
        tone.box,
      )}
    >
      <span aria-hidden="true" className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", tone.dot)} />
      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-sm font-semibold text-soil-900">{toast.title}</p>
        {toast.description ? <p className="mt-0.5 text-sm text-soil-600">{toast.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-soil-500 hover:bg-soil-100 hover:text-soil-900"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5">
          <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/** Affiche une notification : `toast({ title: "Ajouté au devis" })`. */
export function useToast(): (toast: ToastInput) => void {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé à l'intérieur de <ToastProvider>.");
  }
  return context;
}
