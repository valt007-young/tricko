"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useSession } from "./session-provider";
import { Logo } from "./logo";
import { Button } from "./ui";
import { PLANTER_NAV, PRIMARY_NAV } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { profile } = useSession();
  const isPlanter = profile?.role === "planter";
  const isAdmin = profile?.role === "admin";

  const links = [
    ...PRIMARY_NAV,
    ...(isPlanter ? PLANTER_NAV : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-forest-600 text-cream-50"
                : "text-forest-900/70 hover:bg-forest-100/70 hover:text-forest-950"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

function Auth() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signOut, loading } = useSession();

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full bg-forest-100" aria-hidden />
    );
  }

  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)}
        >
          Log in
        </Button>
        <Button
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => router.push("/signup")}
        >
          Plant a Tree
        </Button>
        <div className="sm:hidden">
          <Button variant="primary" size="sm" onClick={() => router.push("/signup")}>
            Sign up
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="hidden md:inline-flex"
        onClick={() => router.push("/plant")}
      >
        🌱 Plant a Tree
      </Button>
      <div className="group relative">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-600 text-sm font-bold text-cream-50 transition-transform hover:scale-105"
          aria-label="Account menu"
        >
          {initials(profile?.full_name || user.email || "U")}
        </button>
        <div className="invisible absolute right-0 z-50 w-52 translate-y-2 rounded-2xl border border-forest-900/10 bg-cream-50 p-2 opacity-0 shadow-lift transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <div className="px-3 pb-2 pt-1">
            <p className="truncate text-sm font-semibold text-forest-950">
              {profile?.full_name || user.email}
            </p>
            <p className="text-xs capitalize text-forest-900/50">
              {profile?.role ?? "member"}
            </p>
          </div>
          <Link
            href="/account"
            className="block rounded-xl px-3 py-2 text-sm text-forest-800 hover:bg-forest-100"
          >
            Profile
          </Link>
          <Link
            href="/forest"
            className="block rounded-xl px-3 py-2 text-sm text-forest-800 hover:bg-forest-100"
          >
            My Forest
          </Link>
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
              router.refresh();
            }}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dark = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-300",
        dark ? "border-b border-cream-50/10" : "border-b border-forest-900/10 bg-cream/85 backdrop-blur",
        open && "bg-forest-950"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo dark={dark || open} />
        <nav className="hidden items-center gap-1 lg:flex">
          <NavLinks />
        </nav>
        <div className="hidden lg:block">
          <Auth />
        </div>
        <button
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full lg:hidden",
            dark || open ? "text-cream-50" : "text-forest-950"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-cream-50/10 bg-forest-950 px-4 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
          <div className="mt-4">
            <Auth />
          </div>
        </div>
      )}
    </header>
  );
}