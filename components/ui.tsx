import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Button                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "dark" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-forest-600 text-cream-50 hover:bg-forest-700 shadow-soft shadow-forest-900/20",
  secondary:
    "bg-forest-50 text-forest-800 hover:bg-forest-100 border border-forest-200",
  ghost: "text-forest-800 hover:bg-forest-100/60",
  outline: "bg-transparent border border-forest-300 text-forest-800 hover:bg-forest-50",
  dark: "bg-forest-950 text-cream-50 hover:bg-forest-900 shadow-soft",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizeClass: Record<string, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2",
  xl: "h-14 px-9 text-lg gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
        variantClass[variant],
        sizeClass[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

export function Card({
  className,
  hover = false,
  children,
}: {
  className?: string;
  hover?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-forest-900/10 bg-cream-50 shadow-soft",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading                                                    */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  lead,
  center = false,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-xs font-bold uppercase tracking-[0.2em]",
            dark ? "text-forest-300" : "text-forest-600"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-4xl font-bold leading-tight md:text-5xl",
          dark ? "text-cream-50" : "text-forest-950"
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-cream-200/80" : "text-forest-900/70")}>
          {lead}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-forest-600 border-t-transparent",
        className
      )}
      aria-hidden
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Empty / skeleton states                                            */
/* ------------------------------------------------------------------ */

export function EmptyState({
  emoji,
  title,
  body,
  action,
}: {
  emoji: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-forest-300/70 bg-cream-50 px-6 py-16 text-center">
      <div className="text-5xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="mt-4 text-xl font-bold text-forest-950">{title}</h3>
      {body && <p className="mt-2 max-w-md text-sm text-forest-900/60">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-forest-900/10", className)} />;
}