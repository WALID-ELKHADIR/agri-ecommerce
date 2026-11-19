import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "field" | "water" | "harvest" | "danger" | "solid";

// Chaque couple fond / texte dépasse 4,5:1 (voir docs/design-system.md).
const TONES: Record<BadgeTone, string> = {
  neutral: "bg-soil-100 text-soil-700",
  field: "bg-field-50 text-field-700",
  water: "bg-water-50 text-water-700",
  harvest: "bg-harvest-100 text-harvest-800",
  danger: "bg-danger-50 text-danger-700",
  solid: "bg-field-900 text-white",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
