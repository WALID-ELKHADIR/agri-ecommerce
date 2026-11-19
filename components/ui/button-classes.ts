import { cn } from "../../lib/cn.ts";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "whatsapp";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap " +
  "transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-out-expo " +
  "motion-safe:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water-600";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-field-600 text-white hover:bg-field-700",
  secondary: "border border-soil-300 bg-white text-soil-900 hover:border-soil-400 hover:bg-soil-50",
  ghost: "text-soil-800 hover:bg-soil-100",
  // Vert WhatsApp réservé aux actions de conversion (texte blanc : 5,4:1).
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-hover",
};

// Cible tactile ≥ 44 px (min-h-11) sur mobile, y compris pour « sm ».
const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3.5 text-sm sm:min-h-9",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

/** Classes d'un bouton, réutilisables sur <button>, <a> ou <Link>. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}
