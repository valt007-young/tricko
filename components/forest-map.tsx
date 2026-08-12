"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface MapTree {
  treeId: string;
  species: string;
  region: string;
  lat: number;
  lng: number;
  plantedAt: string;
  status: string;
  photo: string | null;
  customName: string | null;
}

function makeIcon() {
  return L.divIcon({
    className: "triko-marker",
    html: `<div style="transform:translate(-50%,-100%);"><div style="background:#2f6b4a;border:2px solid #fbf9f3;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:22px;height:22px;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:11px;">🌳</span></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 22],
  });
}

function ClusterView({ trees }: { trees: MapTree[] }) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 55,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (c) =>
        L.divIcon({
          className: "triko-cluster",
          html: `<div style="background:#1e4432;color:#fbf9f3;border-radius:999px;border:2px solid #fbf9f3;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:var(--font-display);font-size:13px;box-shadow:0 6px 16px rgba(0,0,0,0.35);">${c.getChildCount()}</div>`,
          iconSize: [40, 40],
        }),
    });

    for (const t of trees) {
      const marker = L.marker([t.lat, t.lng], { icon: makeIcon() });
      marker.bindPopup(
        `<div style="min-width:210px;font-family:inherit;">
          <div style="font-weight:700;font-size:14px;color:#0b2017;">${t.customName ? escapeHtml(t.customName) : escapeHtml(t.species)}</div>
          <div style="font-size:12px;color:#27563e;margin:2px 0;">🌳 ${escapeHtml(t.species)}</div>
          <div style="font-size:12px;color:#0b2017;margin:2px 0;">🆔 ${escapeHtml(t.treeId)}</div>
          <div style="font-size:12px;color:#0b2017;margin:2px 0;">📍 ${escapeHtml(t.region)}</div>
          <div style="font-size:11px;color:#6b4a32;margin:8px 0 4px;">Planted ${t.plantedAt}</div>
          <a href="/tree/${encodeURIComponent(t.treeId)}" style="display:inline-block;background:#2f6b4a;color:#fff;padding:4px 12px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:600;">View tree →</a>
        </div>`
      );
      cluster.addLayer(marker);
    }
    cluster.addTo(map);

    return () => {
      map.removeLayer(cluster);
    };
  }, [map, trees]);

  return null;
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", '"': "&quot;" }[c]!));
}

export function ForestMap({ trees }: { trees: MapTree[] }) {
  const [species, setSpecies] = useState("all");
  const [region, setRegion] = useState("all");

  const speciesList = useMemo(
    () => Array.from(new Set(trees.map((t) => t.species))).sort(),
    [trees]
  );

  const filtered = useMemo(
    () =>
      trees.filter(
        (t) =>
          (species === "all" || t.species === species) &&
          (region === "all" || t.region === region)
      ),
    [trees, species, region]
  );

  return (
    <div className="overflow-hidden rounded-[2rem] border border-forest-900/10 shadow-lift">
      <div className="flex flex-wrap items-center gap-3 border-b border-forest-900/10 bg-cream-50 px-4 py-3">
        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="rounded-full border border-forest-900/15 bg-cream px-4 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none"
          aria-label="Filter by species"
        >
          <option value="all">All species</option>
          {speciesList.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-full border border-forest-900/15 bg-cream px-4 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none"
          aria-label="Filter by region"
        >
          <option value="all">All regions</option>
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <span className={cn("ml-auto rounded-full px-3 py-1 text-xs font-semibold", "bg-forest-100 text-forest-700")}>
          {filtered.length} trees shown
        </span>
      </div>

      <div className="h-[560px] w-full">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClusterView trees={filtered} />
        </MapContainer>
      </div>
    </div>
  );
}