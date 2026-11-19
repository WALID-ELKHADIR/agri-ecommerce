import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/** Bloc de chargement ; fixez sa taille avec className (ex. `h-4 w-32`). */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-control bg-soil-200/70 motion-reduce:animate-none", className)}
      {...props}
    />
  );
}
