"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import type { Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

function AuthFormInner({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/forest";
  const presetRole = searchParams.get("role");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(presetRole === "planter" ? "planter" : "sponsor");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured()) return;
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active && data.user) router.replace(next);
      });
    return () => {
      active = false;
    };
  }, [router, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Missing fields
    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (mode === "signup" && !fullName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError(mode === "signup" ? "Password must be at least 6 characters." : "Password is too short.");
      return;
    }

    if (!supabaseConfigured()) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the dev server."
      );
      return;
    }

    setChecking(true);
    const supabase = createClient();
    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          if (/invalid login credentials/i.test(signInError.message)) {
            setError("Email or password is incorrect. Check your details and try again.");
          } else {
            setError(signInError.message);
          }
          return;
        }
        router.replace(next);
        router.refresh();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim(), role },
          },
        });
        if (signUpError) {
          if (/already registered/i.test(signUpError.message)) {
            setError("An account with this email already exists. Try logging in instead.");
          } else {
            setError(signUpError.message);
          }
          return;
        }

        // Profile row is created by the DB trigger `handle_new_user` (from the
        // role metadata above) — no client-side upsert needed, and it would be
        // blocked by the role-lock column grants anyway.

        if (data.session) {
          router.replace(next);
          router.refresh();
        } else {
          setError(
            "✔ Account created! We've sent a confirmation link to your email. Please confirm before logging in."
          );
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "A network error occurred. Please try again."
      );
    } finally {
      setChecking(false);
    }
  }

  const disabled = checking;

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[2rem] border border-forest-900/10 bg-cream-50 p-8 shadow-lift">
        <h1 className="font-display text-3xl font-bold text-forest-950">
          {mode === "login" ? "Welcome back" : "Start your forest"}
        </h1>
        <p className="mt-2 text-sm text-forest-900/60">
          {mode === "login"
            ? "Log in to see your trees, proof, and forest."
            : "Create an account to plant or sponsor real trees."}
        </p>

        {!supabaseConfigured && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Supabase not configured.</strong> Create a copy of{" "}
            <code>.env.local.example</code> as <code>.env.local</code> and fill in your
            Supabase URL and anon key, then restart the server.
          </div>
        )}

        {error && (
          <div
            className={cn(
              "mt-5 rounded-2xl border p-4 text-sm",
              error.startsWith("✔")
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            )}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <>
              <Field label="Full name">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  autoComplete="name"
                  className={inputClass}
                />
              </Field>

              <div>
                <p className="mb-1.5 text-sm font-medium text-forest-900">I want to be a…</p>
                <div className="grid grid-cols-2 gap-2">
                  <RoleButton
                    active={role === "sponsor"}
                    onClick={() => setRole("sponsor")}
                    emoji="🌍"
                    label="Sponsor"
                  />
                  <RoleButton
                    active={role === "planter"}
                    onClick={() => setRole("planter")}
                    emoji="🌱"
                    label="Planter"
                  />
                </div>
              </div>
            </>
          )}

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputClass}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className={inputClass}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={disabled} loading={checking}>
            {mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-forest-900/60">
          {mode === "login" ? (
            <>
              New to TRIKO?{" "}
              <Link href="/signup" className="font-semibold text-forest-600 hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href={`/login${presetRole ? `?role=${presetRole}` : ""}`}
                className="font-semibold text-forest-600 hover:underline"
              >
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-forest-900/15 bg-cream px-4 py-3 text-forest-950 placeholder:text-forest-900/35 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-forest-900">{label}</span>
      {children}
    </label>
  );
}

function RoleButton({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all",
        active
          ? "border-forest-600 bg-forest-600 text-cream-50 shadow-soft"
          : "border-forest-900/15 bg-cream text-forest-800 hover:border-forest-400"
      )}
    >
      <span aria-hidden>{emoji}</span>
      {label}
    </button>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return (
    <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-[2rem] bg-forest-100" />}>
      <AuthFormInner mode={mode} />
    </Suspense>
  );
}