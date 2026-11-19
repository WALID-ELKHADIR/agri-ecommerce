import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** L'action qui permet d'en sortir (un écran vide est une invitation à agir). */
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-soil-300 bg-white px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-field-50 text-field-700">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-h3 font-bold text-soil-900">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm leading-relaxed text-soil-600">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
