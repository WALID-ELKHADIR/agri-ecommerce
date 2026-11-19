import type { ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonStyleOptions } from "./button-classes";

export { buttonClasses } from "./button-classes";
export type { ButtonSize, ButtonVariant } from "./button-classes";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<ButtonStyleOptions, "className"> & {
    /** Affiche un indicateur et bloque le bouton pendant une action. */
    loading?: boolean;
  };

/**
 * Bouton du design system. Pour un lien qui ressemble à un bouton :
 * `<Link className={buttonClasses({ variant: "secondary" })}>`.
 */
export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      ) : null}
      {children}
    </button>
  );
}
