import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  dark = false,
  size = "md",
  className,
}: {
  dark?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-2xl bg-forest-600 text-cream-50 shadow-soft transition-transform duration-300 group-hover:rotate-6",
          size === "lg" ? "h-11 w-11 text-2xl" : "h-9 w-9 text-xl"
        )}
        aria-hidden
      >
        🌳
      </span>
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          size === "lg" ? "text-2xl" : "text-xl",
          dark ? "text-cream-50" : "text-forest-950"
        )}
      >
        TRIKO
      </span>
    </Link>
  );
}