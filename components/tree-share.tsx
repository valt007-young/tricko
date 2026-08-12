"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { SITE_URL } from "@/lib/constants";

interface CertificateData {
  customName: string;
  speciesName: string;
  treeId: string;
  location: string;
  plantedAt: string;
  status: string;
  emoji: string;
}

export function TreeShare({ data }: { data: CertificateData }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}/tree/${data.treeId}`;
  const shareText = `🌳 I planted a tree with TRIKO.\n\nTree ID: ${data.treeId}\n\nDon't just plant a tree. Grow a forest.\n${url}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  }

  function downloadCertificate() {
    const svg = certificateSvg(data, url);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `TRIKO-certificate-${data.treeId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button size="sm" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`)}>
        Share to WhatsApp
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`)
        }
      >
        Share to X
      </Button>
      <Button size="sm" variant="outline" onClick={copyLink}>
        {copied ? "✓ Copied" : "Copy link"}
      </Button>
      <Button size="sm" variant="outline" onClick={downloadCertificate}>
        ⬇ Download certificate
      </Button>
    </div>
  );
}

function certificateSvg(d: CertificateData, url: string): string {
  const W = 900;
  const H = 560;
  const title = d.customName || `${d.speciesName} tree`;
  const lines = [
    [`(font-weight='bold' font-size='16' fill='#2f6b4a')TRIKO TREE CERTIFICATE`],
    [`font-size='24' fill='#0b2017')This certifies that`],
    [`font-size='40' font-weight='bold' fill='#173629')${escapeXml(title)}`],
    [`font-size='16' fill='#17402f')has been planted through TRIKO.`],
    [``],
    [`font-size='14' fill='#0b2017')Tree ID: ${d.treeId}`],
    [`font-size='14' fill='#0b2017')Species: ${d.speciesName}`],
    [`font-size='14' fill='#0b2017')Location: ${d.location}`],
    [`font-size='14' fill='#0b2017')Planting date: ${d.plantedAt}`],
    [`font-size='14' fill='#2f6b4a' font-weight='bold')Status: ${d.status}`],
    [``],
    [`font-size='12' fill='#6b4a32')A digital record of a real tree — not an NFT or cryptocurrency asset.`],
    [`font-size='12' fill='#6b4a32')${escapeXml(url)}`],
  ];
  const textGroups = lines
    .map(
      (pair, i) =>
        `<text x='64' y=${120 + i * 42} ${pair[0] || `font-size='16' fill='#173629'`}>${pair[1]}</text>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#fbf9f3"/>
      <stop offset="100%" stop-color="#dcede0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="36" fill="none" stroke="#2f6b4a" stroke-width="2.5" stroke-dasharray="10 6"/>
  <text x="${W / 2}" y="76" text-anchor="middle" font-size="64">${d.emoji}</text>
  ${textGroups}
  <text x="${W - 64}" y="${H - 52}" text-anchor="end" font-size="13" fill="#2f6b4a">Don't just plant a tree. Grow a forest.</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}