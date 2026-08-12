"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export function AdminActions({
  treeId,
  missionId,
  sponsorId,
  proofId,
  treeLabel,
}: {
  treeId: string;
  missionId: string | null;
  sponsorId: string;
  proofId: string;
  treeLabel: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "request_more" | "reject") {
    setBusy(action);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const timestamp = new Date().toISOString();

      if (action === "approve") {
        await supabase
          .from("proof")
          .update({ verification_status: "approved", admin_note: note || null, reviewed_at: timestamp, reviewed_by: user.id })
          .eq("id", proofId);
        await supabase
          .from("trees")
          .update({ status: "verified", verified_at: timestamp, survival_status: "growing" })
          .eq("id", treeId);
        if (missionId) {
          await supabase.from("planting_missions").update({ status: "verified" }).eq("id", missionId);
        }
        await supabase.from("growth_updates").insert({
          tree_id: treeId,
          day_label: "Day 0",
          notes: "Planted and verified by TRIKO.",
          status: "Planted",
        });
        await supabase.from("activity").insert({
          user_id: sponsorId,
          type: "verified",
          message: `📍 Tree ${treeLabel} was verified`,
          meta: { tree_id: treeLabel },
        });
      } else {
        const proofStatus = action === "request_more" ? "needs_more_proof" : "rejected";
        await supabase
          .from("proof")
          .update({ verification_status: proofStatus, admin_note: note || (action === "request_more" ? "More proof requested." : "Proof rejected."), reviewed_at: timestamp, reviewed_by: user.id })
          .eq("id", proofId);
        await supabase.from("trees").update({ status: "needs_review" }).eq("id", treeId);
        if (missionId) {
          await supabase.from("planting_missions").update({ status: "needs_review" }).eq("id", missionId);
        }
      }

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
      setBusy(null);
    }
  }

  return (
    <div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder={busy ? "" : "Optional admin note…"}
        className="mb-3 w-full rounded-xl border border-forest-900/15 bg-cream px-3 py-2 text-xs text-forest-950 placeholder:text-forest-900/35 focus:border-forest-500 focus:outline-none"
      />
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" disabled={busy !== null} loading={busy === "approve"} onClick={() => act("approve")}>
          ✓ Approve
        </Button>
        <Button size="sm" variant="outline" disabled={busy !== null} loading={busy === "request_more"} onClick={() => act("request_more")}>
          Request more proof
        </Button>
        <Button size="sm" variant="danger" disabled={busy !== null} loading={busy === "reject"} onClick={() => act("reject")}>
          Reject
        </Button>
      </div>
    </div>
  );
}