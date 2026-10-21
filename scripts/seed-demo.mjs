// TRIKO demo data seeder.
//
// Creates demo users (sponsor / planter / admin), a species catalog,
// and a realistic set of trees, missions, proof, growth updates,
// payments and achievements. Run AFTER applying migrations + seed.sql
// and AFTER setting env vars in .env.local.
//
//   npm run seed:demo
//
// Uses the service role key â€” never use this in the browser.

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const PASSWORD = "demo1234";
const REGIONS = {
  madurai: { label: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  coimbatore: { label: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  bangalore: { label: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  mysore: { label: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
};
const SPECIES = [
  { slug: "neem", name: "Neem", scientific_name: "Azadirachta indica", emoji: "ðŸŒ³", planting_cost: 800, verification_fee: 100, planter_payout: 700, suitable_regions: ["madurai", "coimbatore", "bangalore", "ahmedabad", "jaipur", "delhi"] },
  { slug: "mango", name: "Mango", scientific_name: "Mangifera indica", emoji: "ðŸ¥­", planting_cost: 900, verification_fee: 100, planter_payout: 800, suitable_regions: ["madurai", "coimbatore", "bangalore", "mysore", "kerala", "pune"] },
  { slug: "banyan", name: "Banyan", scientific_name: "Ficus benghalensis", emoji: "ðŸŒ³", planting_cost: 850, verification_fee: 100, planter_payout: 750, suitable_regions: ["madurai", "bangalore", "kerala", "delhi", "nagpur", "ahmedabad"] },
  { slug: "peepal", name: "Peepal", scientific_name: "Ficus religiosa", emoji: "ðŸŒ³", planting_cost: 780, verification_fee: 100, planter_payout: 680, suitable_regions: ["madurai", "jaipur", "delhi", "mysore", "pune", "kerala"] },
  { slug: "sheesham", name: "Indian Rosewood (Sheesham)", scientific_name: "Dalbergia sissoo", emoji: "ðŸŒ²", planting_cost: 820, verification_fee: 100, planter_payout: 720, suitable_regions: ["delhi", "jaipur", "nagpur", "pune", "bangalore"] },
  { slug: "golden-shower", name: "Golden Shower (Amaltas)", scientific_name: "Cassia fistula", emoji: "ðŸŒ¼", planting_cost: 760, verification_fee: 100, planter_payout: 660, suitable_regions: ["madurai", "coimbatore", "ahmedabad", "jaipur", "kerala"] },
];
const IMAGES = {
  neem: "https://images.pexels.com/photos/5060587/pexels-photo-5060587.jpeg?auto=compress&cs=tinysrgb&w=1200",
  mango: "https://images.pexels.com/photos/7529893/pexels-photo-7529893.jpeg?auto=compress&cs=tinysrgb&w=1200",
  banyan: "https://images.pexels.com/photos/11008113/pexels-photo-11008113.jpeg?auto=compress&cs=tinysrgb&w=1200",
  peepal: "https://images.pexels.com/photos/38416538/pexels-photo-38416538.jpeg?auto=compress&cs=tinysrgb&w=1200",
  sheesham: "https://images.pexels.com/photos/20810259/pexels-photo-20810259.jpeg?auto=compress&cs=tinysrgb&w=1200",
  cassia: "https://images.pexels.com/photos/31242850/pexels-photo-31242850.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

function ok(marker, msg) {
  console.log(`  âœ“ ${marker}: ${msg}`);
}
function fail(marker, msg) {
  console.error(`  âœ— ${marker}: ${msg}`);
}

async function ensureUser({ email, name, role, region, verified }) {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === email);
  let id = found?.id;
  if (!found) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: name, role },
    });
    if (error) return fail("user", email + " â†’ " + error.message);
    id = data.user.id;
  }
  const profile = {
    id,
    full_name: name,
    role,
    ...(region ? { region } : {}),
    planter_verified: Boolean(verified),
    planter_rating: verified ? 4.9 : 0,
    planter_completed: verified ? 128 : 0,
    onboarding_done: true,
  };
  const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });
  if (error) return fail("profile", email + " â†’ " + error.message);
  return id;
}

async function nextTreeId(country) {
  const { data, error } = await supabase.rpc("gen_tree_id", { country_code: country ?? "IN" });
  if (error) throw new Error("gen_tree_id: " + error.message);
  return data;
}

async function seed() {
  console.log("\nTRIKO demo seeder\n==================\n");

  console.log("1. Users (password: demo1234)");
  const sponsorId = await ensureUser({ email: "sponsor@triko.com", name: "Ananya Sharma", role: "sponsor" });
  const planterId = await ensureUser({ email: "planter@triko.com", name: "Ravi", role: "planter", region: "madurai", verified: true });
  const adminId = await ensureUser({ email: "admin@triko.com", name: "TRIKO Admin", role: "admin" });
  if (!sponsorId || !planterId || !adminId) {
    console.error("Aborting â€” could not create demo users.");
    process.exit(1);
  }
  ok("sponsor", "sponsor@triko.com");
  ok("planter", "planter@triko.com (verified, Madurai)");
  ok("admin", "admin@triko.com");

  console.log("\n2. Species catalog");
  for (const s of SPECIES) {
    const { error } = await supabase.from("tree_species").upsert(
      { ...s, description: s.name + " â€” native and region-appropriate.", image_url: IMAGES[s.slug === "golden-shower" ? "cassia" : s.slug], native_to: "India", care_notes: "Water young trees weekly in the first season.", availability: true },
      { onConflict: "slug" }
    );
    if (error) return fail("species", s.slug + " â†’ " + error.message);
  }
  ok("species", SPECIES.length + " species upserted");

  console.log("\n3. Demo trees + missions");

  const now = Date.now();
  const day = 86400000;

  async function addVerifiedTree({ species, customName, dedication, region, plantedAt }) {
    const treeId = await nextTreeId("IN");
    const r = REGIONS[region] ?? REGIONS.madurai;
    const { data: tree, error } = await supabase
      .from("trees")
      .insert({
        tree_id: treeId,
        species_id: null,
        species_name: species.name,
        species_emoji: species.emoji,
        species_image: IMAGES[species.slug === "golden-shower" ? "cassia" : species.slug],
        sponsor_id: sponsorId,
        planter_id: planterId,
        custom_name: customName,
        dedication,
        region,
        location_label: `${r.label}, ${r.state} Â· community garden`,
        lat: r.lat + (Math.random() - 0.5) * 0.06,
        lng: r.lng + (Math.random() - 0.5) * 0.06,
        planted_at: new Date(plantedAt).toISOString(),
        status: "verified",
        survival_status: "growing",
        created_at: new Date(plantedAt).toISOString(),
        verified_at: new Date(plantedAt + day).toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error("tree insert: " + error.message);

    await supabase.from("planting_missions").insert({
      mission_label: "TC-" + String(Math.floor(10000 + Math.random() * 89999)),
      tree_id: tree.id,
      planter_id: planterId,
      payout: species.planter_payout,
      status: "verified",
      deadline: new Date(plantedAt + 2 * day).toISOString(),
      estimated_time: "1â€“2 hours",
      created_at: new Date(plantedAt - 2 * day).toISOString(),
    });

    await supabase.from("proof").insert({
      tree_id: tree.id,
      photo_url: IMAGES[species.slug === "golden-shower" ? "cassia" : species.slug],
      video_url: null,
      lat: r.lat,
      lng: r.lng,
      location_label: `${r.label}, ${r.state}`,
      description: `Planted a ${species.name} sapling in the community garden.`,
      submitted_at: new Date(plantedAt).toISOString(),
      verification_status: "approved",
      reviewed_at: new Date(plantedAt + day).toISOString(),
      reviewed_by: adminId,
    });

    await supabase.from("payments").insert({
      user_id: sponsorId,
      tree_id: tree.id,
      amount: species.planting_cost + species.verification_fee,
      description: `${species.name} Â· ${r.label} Â· demo payment`,
      status: "succeeded",
      provider: "demo",
      provider_txn_id: "DEMO-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
      created_at: new Date(plantedAt - 2 * day).toISOString(),
    });

    return { tree, species, region, plantedAt };
  }

  const structures = [
    { species: SPECIES[0], customName: "Grandpa's Neem", dedication: "For my grandfather.", region: "madurai", plantedAt: now - 2 * day },
    { species: SPECIES[1], customName: null, dedication: null, region: "coimbatore", plantedAt: now - 32 * day },
    { species: SPECIES[2], customName: "Aunty's Banyan", dedication: "A shady spot for the birds.", region: "bangalore", plantedAt: now - 95 * day },
    { species: SPECIES[3], customName: null, dedication: null, region: "bangalore", plantedAt: now - 190 * day },
    { species: SPECIES[0], customName: null, dedication: null, region: "madurai", plantedAt: now - 7 * day },
    { species: SPECIES[4], customName: null, dedication: null, region: "mysore", plantedAt: now - 400 * day },
  ];
  let added = [];
  for (const [i, s] of structures.entries()) {
    const t = await addVerifiedTree(s);
    added.push(t);
    if (i === 0) {
      // growth timeline for the flagship tree
      const flags = [
        { day_label: "Day 0", notes: "Planted â€” sapling in the ground.", status: "Planted", date: s.plantedAt },
        { day_label: "Day 30", notes: "First growth update: new leaves appearing.", status: "Growing", date: s.plantedAt + 30 * day },
        { day_label: "Day 90", notes: "Maintenance visit: watered and weeded.", status: "Healthy", date: s.plantedAt + 90 * day },
      ];
      for (const f of flags) {
        await supabase.from("growth_updates").insert({ tree_id: t.tree.id, day_label: f.day_label, notes: f.notes, status: f.status, date: new Date(f.date).toISOString() });
      }
    }
  }
  ok("verified trees", added.length + " verified trees for sponsor");

  // A funded tree waiting for a planter (sponsor just sponsored)
  {
    const species = SPECIES[0];
    const treeId = await nextTreeId("IN");
    const r = REGIONS.madurai;
    const { data: tree } = await supabase.from("trees").insert({
      tree_id: treeId,
      species_id: null,
      species_name: species.name,
      species_emoji: species.emoji,
      species_image: IMAGES.neem,
      sponsor_id: sponsorId,
      planter_id: null,
      custom_name: null,
      dedication: null,
      region: "madurai",
      location_label: `${r.label}, ${r.state}`,
      lat: r.lat,
      lng: r.lng,
      status: "funded",
      created_at: new Date(now - 1 * day).toISOString(),
    }).select().single();
    await supabase.from("planting_missions").insert({
      mission_label: "TC-" + String(Math.floor(10000 + Math.random() * 89999)),
      tree_id: tree.id,
      planter_id: null,
      payout: species.planter_payout,
      status: "funded",
      deadline: new Date(now + 2 * day).toISOString(),
      estimated_time: "1â€“2 hours",
      created_at: new Date(now - 1 * day).toISOString(),
    });
    await supabase.from("payments").insert({
      user_id: sponsorId,
      tree_id: tree.id,
      amount: species.planting_cost + species.verification_fee,
      description: `${species.name} Â· Madurai Â· demo payment`,
      status: "succeeded",
      provider: "demo",
      provider_txn_id: "DEMO-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
      created_at: new Date(now - 1 * day).toISOString(),
    });
    ok("funded mission", treeId + " waiting for a planter");
  }

  // A mission awaiting verification (proof submitted)
  {
    const species = SPECIES[1];
    const treeId = await nextTreeId("IN");
    const r = REGIONS.coimbatore;
    const { data: tree } = await supabase.from("trees").insert({
      tree_id: treeId,
      species_id: null,
      species_name: species.name,
      species_emoji: species.emoji,
      species_image: IMAGES.mango,
      sponsor_id: sponsorId,
      planter_id: planterId,
      custom_name: "Summer Mango",
      dedication: null,
      region: "coimbatore",
      location_label: `${r.label}, ${r.state}`,
      lat: r.lat,
      lng: r.lng,
      planted_at: new Date(now - 1 * day).toISOString(),
      status: "awaiting_verification",
      survival_status: null,
      created_at: new Date(now - 3 * day).toISOString(),
    }).select().single();
    await supabase.from("planting_missions").insert({
      mission_label: "TC-" + String(Math.floor(10000 + Math.random() * 89999)),
      tree_id: tree.id,
      planter_id: planterId,
      payout: species.planter_payout,
      status: "awaiting_verification",
      deadline: new Date(now + 1 * day).toISOString(),
      estimated_time: "1â€“2 hours",
      created_at: new Date(now - 3 * day).toISOString(),
    });
    await supabase.from("proof").insert({
      tree_id: tree.id,
      photo_url: IMAGES.mango,
      video_url: null,
      lat: r.lat,
      lng: r.lng,
      location_label: `${r.label}, ${r.state}`,
      description: "Planted the mango sapling by the canal side.",
      submitted_at: new Date(now - 1 * day).toISOString(),
      verification_status: "pending",
    });
    ok("verification queue", treeId + " awaiting admin review");
  }

  // A second pending row for variety in the admin queue
  {
    const species = SPECIES[4];
    const r = REGIONS.bangalore;
    const treeId = await nextTreeId("IN");
    const { data: tree } = await supabase.from("trees").insert({
      tree_id: treeId,
      species_name: species.name,
      species_emoji: species.emoji,
      species_image: IMAGES.sheesham,
      sponsor_id: sponsorId,
      planter_id: planterId,
      custom_name: null,
      region: "bangalore",
      location_label: `${r.label}, ${r.state}`,
      lat: r.lat,
      lng: r.lng,
      status: "awaiting_verification",
      created_at: new Date(now - 1 * day).toISOString(),
    }).select().single();
    await supabase.from("planting_missions").insert({
      mission_label: "TC-" + String(Math.floor(10000 + Math.random() * 89999)),
      tree_id: tree.id,
      planter_id: planterId,
      payout: species.planter_payout,
      status: "awaiting_verification",
      deadline: new Date(now + 2 * day).toISOString(),
      estimated_time: "1â€“2 hours",
      created_at: new Date(now - 2 * day).toISOString(),
    });
    await supabase.from("proof").insert({
      tree_id: tree.id,
      photo_url: IMAGES.sheesham,
      lat: r.lat,
      lng: r.lng,
      location_label: `${r.label}, ${r.state}`,
      description: "Sapling planted along the farm boundary.",
      submitted_at: new Date(now - 1 * day).toISOString(),
      verification_status: "pending",
    });
    ok("verification queue", treeId + " second pending row");
  }

  console.log("\n4. Gamification");
  await supabase.from("achievements").upsert(
    [
      { user_id: sponsorId, code: "first_seed", name: "First Seed", description: "Plant your first tree.", unlocked_at: new Date(now - 400 * day).toISOString() },
      { user_id: sponsorId, code: "small_grove", name: "Small Grove", description: "Plant 5 trees.", unlocked_at: new Date(now - 60 * day).toISOString() },
      { user_id: sponsorId, code: "forest_builder", name: "Forest Builder", description: "Plant 25 trees.", unlocked_at: new Date(now - 5 * day).toISOString() },
      { user_id: planterId, code: "first_seed", name: "First Seed", description: "Plant your first tree.", unlocked_at: new Date(now - 800 * day).toISOString() },
    ],
    { onConflict: "user_id,code" }
  );
  ok("achievements", "4 achievement rows");

  const activities = [
    { user_id: planterId, type: "verified", message: "ðŸŒ³ Tree TC-2026-IN-000482 was verified", meta: { tree_id: "TC-2026-IN-000482" } },
    { user_id: sponsorId, type: "mission", message: "ðŸŒ± You sponsored a Neem tree in Madurai", meta: {} },
  ];
  await supabase.from("activity").insert(activities);
  ok("activity", "2 activity rows");

  console.log("\nDone. Sign in with:");
  console.log("  sponsor@triko.com   / demo1234   (Sponsor â€” My Forest, Plant a Tree)");
  console.log("  planter@triko.com    / demo1234   (Planter â€” Missions, My Missions, Earnings)");
  console.log("  admin@triko.com      / demo1234   (Admin â€” verification queue)");
  console.log("");
}

seed().catch((e) => {
  console.error("\nSeeder failed:", e.message);
  process.exit(1);
});