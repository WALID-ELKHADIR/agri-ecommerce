import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const CONTAINER_SIZES = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-[90rem]",
} as const;

type ContainerProps = HTMLAttributes<HTMLDivElement> & { size?: keyof typeof CONTAINER_SIZES };

/** Largeur de page et marges latérales (16 px sur mobile). */
export function Container({ size = "default", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", CONTAINER_SIZES[size], className)} {...props} />;
}
