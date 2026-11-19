"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Placement = "center" | "bottom" | "right";

type DialogProps = {
  open: boolean;
  /** Appelé une seule fois par fermeture (✕, Échap, clic sur le fond ou `open` passé à false). */
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Actions en pied (boutons). */
  footer?: ReactNode;
  className?: string;
};

// Position, taille et animation d'entrée selon l'emplacement.
const PLACEMENTS: Record<Placement, string> = {
  center:
    "m-auto max-h-[85dvh] w-[min(32rem,calc(100%-2rem))] rounded-panel " +
    "opacity-0 motion-safe:scale-95 open:opacity-100 open:scale-100 " +
    "starting:open:opacity-0 motion-safe:starting:open:scale-95",
  bottom:
    "mt-auto mb-0 max-h-[85dvh] w-full max-w-none rounded-t-panel " +
    "motion-safe:translate-y-full open:translate-y-0 motion-safe:starting:open:translate-y-full",
  right:
    "ml-auto mr-0 h-dvh max-h-none w-[min(28rem,100%)] " +
    "motion-safe:translate-x-full open:translate-x-0 motion-safe:starting:open:translate-x-full",
};

/** Vrai si le clic tombe hors de la boîte (donc sur le fond assombri). */
function isBackdropClick(event: MouseEvent<HTMLDialogElement>): boolean {
  if (event.target !== event.currentTarget) return false;
  const box = event.currentTarget.getBoundingClientRect();
  return (
    event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom
  );
}

/**
 * Fenêtre modale sur l'élément natif <dialog> : piège du focus, touche Échap,
 * arrière-plan inerte et retour du focus sont gérés par le navigateur.
 * Toute fermeture passe par `dialog.close()`, dont l'événement `close` est le
 * seul à appeler `onClose`.
 */
function ModalBase({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  placement,
}: DialogProps & { placement: Placement }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        if (isBackdropClick(event)) close();
      }}
      className={cn(
        "flex-col bg-white p-0 text-soil-900 shadow-overlay open:flex backdrop:bg-soil-900/45",
        "transition-[opacity,transform,overlay,display] transition-discrete duration-(--duration-base) ease-out-expo",
        "backdrop:transition-[opacity] backdrop:duration-(--duration-base) starting:open:backdrop:opacity-0",
        PLACEMENTS[placement],
        className,
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-soil-200 px-5 py-4">
        <div>
          <h2 id={titleId} className="font-display text-h3 font-bold">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="mt-1 text-sm text-soil-600">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-soil-600 hover:bg-soil-100 hover:text-soil-900"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
            <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* Seul le corps défile : l'en-tête et le pied restent visibles. */}
      {children ? <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div> : null}
      {footer ? (
        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-soil-200 px-5 py-4">{footer}</div>
      ) : null}
    </dialog>
  );
}

/** Boîte de dialogue centrée (confirmation, formulaire court). */
export function Dialog(props: DialogProps) {
  return <ModalBase {...props} placement="center" />;
}

/** Tiroir : depuis le bas sur mobile (filtres, liste de devis), depuis la droite sinon. */
export function Sheet({ side = "bottom", ...props }: DialogProps & { side?: "bottom" | "right" }) {
  return <ModalBase {...props} placement={side} />;
}
