"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { useSession } from "@/components/session-provider";

export function AcceptMissionButton({
  missionId,
}: {
  missionId: string;
}) {
  const router = useRouter();
  const { profile } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPlanter = profile?.role === "planter";
  const verified = Boolean(profile?.planter_verified);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      // Claim the mission (RLS: planter_id must be me).
      const { error: missionError } = await supabase
        .from("planting_missions")
        .update({ planter_id: profile!.id, status: "accepted" })
        .eq("id", missionId)
        .eq("status", "funded")
        .is("planter_id", null);
      if (missionError) throw missionError;

      // Reflect on the tree too.
      const { data: mission } = await supabase
        .from("planting_missions")
        .select("tree_id")
        .eq("id", missionId)
        .maybeSingle();
      if (mission) {
        await supabase
          .from("trees")
          .update({ planter_id: profile!.id, status: "accepted" })
          .eq("id", mission.tree_id)
          .in("status", ["funded"]);
      }

      router.push(`/missions/${missionId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not accept this mission.");
      setBusy(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {!isPlanter ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/signup?role=planter")}
        >
          Sign up as a planter to accept
        </Button>
      ) : !verified ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Planter verification pending. You can accept demo missions while you complete
          your profile.
          <Button size="sm" className="mt-3 w-full" disabled={busy} loading={busy} onClick={accept}>
            Accept anyway (demo)
          </Button>
        </div>
      ) : (
        <Button className="w-full" size="lg" disabled={busy} loading={busy} onClick={accept}>
          {busy ? "Accepting…" : "🟢 Accept Mission"}
        </Button>
      )}
    </div>
  );
}