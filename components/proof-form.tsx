"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, Upload, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import type { Region } from "@/lib/constants";
import { cn, uid } from "@/lib/utils";

interface ProofFormProps {
  missionId: string;
  treeId: string;
  fallbackRegion: string;
  region?: Region;
}

export function ProofForm({ missionId, treeId, fallbackRegion, region }: ProofFormProps) {
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number; source: string } | null>(
    region ? { lat: region.lat, lng: region.lng, source: "region" } : null
  );
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function captureLocation() {
    if (!("geolocation" in navigator)) {
      setLocation(region ? { lat: region.lat, lng: region.lng, source: "region" } : null);
      return;
    }
    setLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        source: "device",
      });
    } catch {
      setLocation(region ? { lat: region.lat, lng: region.lng, source: "region" } : null);
    } finally {
      setLocating(false);
    }
  }

  async function submit() {
    if (!photo) {
      setError("A clear photo of the planted tree is required.");
      return;
    }
    if (!location) {
      setError("Location information is required. Capture it or pick the region.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Add a short description of the planting (at least 10 characters).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const stamp = Date.now();

      let photoUrl: string | null = null;
      let videoUrl: string | null = null;

      if (photo) {
        const { data, error } = await supabase.storage
          .from("proof")
          .upload(`photos/${treeId}-${stamp}-${uid()}.${photo.name.split(".").pop() || "jpg"}`, photo, {
            contentType: photo.type,
          });
        if (error) throw new Error("Upload failed: " + error.message);
        photoUrl = supabase.storage.from("proof").getPublicUrl(data.path).data.publicUrl;
      }
      if (video) {
        const { data, error } = await supabase.storage
          .from("proof")
          .upload(`videos/${treeId}-${stamp}-${uid()}.${video.name.split(".").pop() || "mp4"}`, video, {
            contentType: video.type,
          });
        if (error) throw new Error("Video upload failed: " + error.message);
        videoUrl = supabase.storage.from("proof").getPublicUrl(data.path).data.publicUrl;
      }

      const { error: proofError } = await supabase.from("proof").insert({
        tree_id: treeId,
        mission_id: missionId,
        photo_url: photoUrl,
        video_url: videoUrl,
        lat: location.lat,
        lng: location.lng,
        location_data: { source: location.source },
        location_label: fallbackRegion,
        description: description.trim(),
        verification_status: "pending",
      });
      if (proofError) throw new Error(proofError.message);

      // Advance workflow — proof submitted does NOT auto-verify.
      await supabase
        .from("trees")
        .update({ status: "awaiting_verification" })
        .eq("id", treeId)
        .in("status", ["accepted", "planting"]);
      await supabase.from("planting_missions")
        .update({ status: "awaiting_verification" })
        .eq("id", missionId);

      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit proof.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-green-300 bg-green-50 p-8 text-center">
        <div className="text-5xl">📸</div>
        <h3 className="mt-4 font-display text-xl font-bold text-forest-950">
          Proof submitted — awaiting verification
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-forest-900/60">
          TRIKO will run automated checks and a reviewer will look at your photos, video and
          location. Your tree is <strong>not</strong> marked verified until it&apos;s approved.
        </p>
        <Button className="mt-5" variant="outline" onClick={() => router.push("/mymissions")}>
          Back to my missions
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-5"
    >
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Photo */}
      <ProofField icon={<Camera className="h-5 w-5" />} title="📸 Photo" hint="Clear photo of the planted tree" required>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-sm transition-colors",
            photo ? "border-forest-500 bg-forest-50 text-forest-800" : "border-forest-900/20 text-forest-900/50 hover:border-forest-400"
          )}
        >
          <Upload className="h-4 w-4" />
          {photo ? `📷 ${photo.name}` : "Choose photo"}
        </button>
      </ProofField>

      {/* Video */}
      <ProofField icon={<Video className="h-5 w-5" />} title="🎥 Video" hint="Short video of the tree and surroundings (optional)" required={false}>
        <input
          ref={videoRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => videoRef.current?.click()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-sm transition-colors",
            video ? "border-forest-500 bg-forest-50 text-forest-800" : "border-forest-900/20 text-forest-900/50 hover:border-forest-400"
          )}
        >
          <Upload className="h-4 w-4" />
          {video ? `🎬 ${video.name}` : "Choose video (optional)"}
        </button>
      </ProofField>

      {/* Location */}
      <ProofField icon={<MapPin className="h-5 w-5" />} title="📍 Location" hint="Capture your current location near the tree" required>
        <button
          type="button"
          onClick={captureLocation}
          disabled={locating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-600 px-4 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-forest-700 disabled:opacity-60"
        >
          <MapPin className="h-4 w-4" />
          {locating ? "Locating…" : location ? `✓ ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} (${location.source})` : "Capture location"}
        </button>
        {!location && (
          <p className="mt-2 text-xs text-forest-900/50">
            Uses your browser location — we never show your exact address publicly.
          </p>
        )}
      </ProofField>

      {/* Description */}
      <ProofField icon={<span className="text-lg">📝</span>} title="Description" hint='e.g. "Planted the neem sapling in the community garden."' required>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe the planting…"
          className="w-full rounded-2xl border border-forest-900/15 bg-cream px-4 py-3 text-forest-950 placeholder:text-forest-900/35 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        />
      </ProofField>

      <div className="rounded-2xl bg-forest-950 px-4 py-3 text-xs text-cream-200/80">
        Uploading proof does <strong>not</strong> automatically verify the tree. A TRIKO
        reviewer validates photos, video and location before the Tree ID is confirmed.
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={busy} loading={busy}>
        {busy ? "Submitting…" : "Submit proof"}
      </Button>
    </form>
  );
}

function ProofField({
  icon,
  title,
  hint,
  required,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-cream-50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-forest-950">{title}</span>
        </div>
        <span className="text-xs text-forest-900/45">{required ? "Required" : hint}</span>
      </div>
      {children}
    </div>
  );
}