import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Niveau de titre : h2 par défaut. */
  as?: "h1" | "h2" | "h3";
  align?: "start" | "center";
  /** Lien ou bouton aligné à droite (desktop), sous le texte (mobile). */
  action?: ReactNode;
  className?: string;
};

const HEADING_SIZE = { h1: "text-h1", h2: "text-h2", h3: "text-h3" } as const;

export function SectionHeading({
  title,
  description,
  as: Heading = "h2",
  align = "start",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <Heading className={cn("font-display font-bold text-soil-900", HEADING_SIZE[Heading])}>{title}</Heading>
        {description ? (
          <p className="mt-3 text-[17px] leading-relaxed text-soil-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
