"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card } from "@/components/ui";
import { useSession } from "@/components/session-provider";
import { REGIONS } from "@/lib/constants";
import { initials } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const inputClass =
  "w-full rounded-2xl border border-forest-900/15 bg-cream px-4 py-3 text-forest-950 placeholder:text-forest-900/35 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30";

export function AccountForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const { refresh } = useSession();
  const [fullName, setFullName] = useState(initial.full_name);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [region, setRegion] = useState(initial.region ?? "madurai");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { error } = await createClient()
        .from("profiles")
        .update({ full_name: fullName.trim() || initial.full_name, bio: bio.trim() || null, region: region || null })
        .eq("id", initial.id);
      if (error) throw error;
      setMessage("Profile saved.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  async function becomePlanter() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { error } = await createClient()
        .from("profiles")
        .update({ role: "planter" })
        .eq("id", initial.id);
      if (error) throw error;
      setMessage("You're now a planter. Complete verification to unlock missions.");
      await refresh();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not switch role.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyMe() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { error } = await createClient()
        .from("profiles")
        .update({ planter_verified: true, planter_rating: 4.9, region: region || "madurai" })
        .eq("id", initial.id);
      if (error) throw error;
      setMessage("Planter verification complete (demo). You can now accept missions.");
      await refresh();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update verification.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="p-8">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-forest-600 text-xl font-bold text-cream-50">
            {initials(fullName)}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-forest-950">{fullName}</h2>
            <p className="text-sm capitalize text-forest-900/50">
              {initial.role} · {initial.planter_verified ? "Verified planter" : "Member"}
            </p>
          </div>
        </div>

        {message && <p className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</p>}
        {error && <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-forest-900">Full name</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-forest-900">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell the community a little about yourself…"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-forest-900">Region</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass}>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}, {r.state}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={save} loading={busy}>
            Save profile
          </Button>
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="font-display text-lg font-bold text-forest-950">Planter access</h3>
        <p className="mt-1 text-sm text-forest-900/60">
          Set your region to see available funded missions. Planters submit real proof and
          earn payouts after verification.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {initial.role === "planter" ? (
            <>
              <Button variant="outline" onClick={verifyMe} loading={busy}>
                ✓ Complete planter verification
              </Button>
              <p className="w-full text-xs text-forest-900/50">
                {initial.planter_verified
                  ? "Verification complete — missions are unlocked."
                  : "Verification unlocks paid planting missions."}
              </p>
            </>
          ) : (
            <Button variant="secondary" onClick={becomePlanter} loading={busy}>
              🌍 Become a planter
            </Button>
          )}
        </div>
      </Card>

      <p className="text-center text-xs text-forest-900/40">
        Payment information is private to you (row-level security). Triko demo mode — no real
        transactions.
      </p>
    </div>
  );
}