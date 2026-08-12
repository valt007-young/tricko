-- ====================================================================
-- TRIKO core schema
-- RLS enabled everywhere; users can only access records they own,
-- planters only their missions, admins the full queue.
-- ====================================================================

-- uuid + gen_random_uuid()
create extension if not exists pgcrypto;

-- Sequences for permanent, non-reused IDs
create sequence if not exists public.tree_id_seq;
create sequence if not exists public.mission_seq;

-- Helper: is the current user an admin?
create or replace function public.is_admin() returns boolean
language plpgsql stable security definer set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
end;
$$;

-- Generate permanent Tree ID: TC-2026-IN-000482
create or replace function public.gen_tree_id(country_code text) returns text
language sql security definer set search_path = public
as $$
  select 'TC-' || to_char(now(), 'YYYY') || '-' || upper(country_code) || '-' ||
         lpad(nextval('public.tree_id_seq')::text, 6, '0');
$$;

-- Generate mission number: TC-10482
create or replace function public.gen_mission_no() returns text
language sql security definer set search_path = public
as $$
  select 'TC-' || nextval('public.mission_seq')::text;
$$;

-- ====================================================================
-- PROFILES
-- ====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'sponsor' check (role in ('sponsor','planter','admin')),
  avatar_url text,
  bio text,
  country text default 'India',
  region text,
  planter_verified boolean not null default false,
  planter_rating numeric(3,2) not null default 0,
  planter_completed integer not null default 0,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tree_species (
  id integer primary key generated always as identity,
  slug text unique not null,
  name text not null,
  scientific_name text not null,
  description text not null default '',
  image_url text,
  suitable_regions text[] not null default '{}',
  care_notes text,
  planting_cost numeric not null default 800,
  verification_fee numeric not null default 100,
  planter_payout numeric not null default 700,
  availability boolean not null default true,
  emoji text not null default '🌳',
  native_to text
);

-- ====================================================================
-- TREES
-- ====================================================================
create table if not exists public.trees (
  id uuid primary key default gen_random_uuid(),
  tree_id text unique not null,
  species_id integer references public.tree_species(id),
  species_name text not null,
  species_emoji text,
  species_image text,
  sponsor_id uuid not null references public.profiles(id),
  planter_id uuid references public.profiles(id),
  custom_name text,
  dedication text,
  region text not null default 'madurai',
  location_label text,
  lat double precision,
  lng double precision,
  planted_at timestamptz,
  status text not null default 'funded'
    check (status in ('funded','accepted','planting','awaiting_verification','verified','needs_review','failed')),
  survival_status text check (survival_status in ('growing','healthy','needs_attention','did_not_survive')),
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index if not exists trees_tree_id_idx on public.trees (tree_id);
create index if not exists trees_sponsor_idx on public.trees (sponsor_id);

-- ====================================================================
-- PLANTING MISSIONS
-- ====================================================================
create table if not exists public.planting_missions (
  id uuid primary key default gen_random_uuid(),
  mission_label text not null,
  tree_id uuid not null references public.trees(id) on delete cascade,
  planter_id uuid references public.profiles(id),
  payout numeric not null default 700,
  status text not null default 'funded'
    check (status in ('funded','accepted','planting','awaiting_verification','verified','needs_review','cancelled')),
  deadline timestamptz,
  estimated_time text,
  created_at timestamptz not null default now(),
  unique (tree_id)
);

create index if not exists missions_planter_idx on public.planting_missions (planter_id);
create index if not exists missions_status_idx on public.planting_missions (status);

-- ====================================================================
-- PROOF
-- ====================================================================
create table if not exists public.proof (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees(id) on delete cascade,
  mission_id uuid references public.planting_missions(id) on delete set null,
  photo_url text,
  video_url text,
  lat double precision,
  lng double precision,
  location_data jsonb,
  location_label text,
  description text not null default '',
  submitted_at timestamptz not null default now(),
  verification_status text not null default 'pending'
    check (verification_status in ('pending','approved','needs_more_proof','rejected')),
  admin_note text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

create index if not exists proof_tree_idx on public.proof (tree_id);

-- ====================================================================
-- GROWTH UPDATES
-- ====================================================================
create table if not exists public.growth_updates (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees(id) on delete cascade,
  day_label text,
  photo_url text,
  status text,
  notes text,
  date timestamptz not null default now()
);

create index if not exists growth_tree_idx on public.growth_updates (tree_id);

-- ====================================================================
-- PAYMENTS (demo mode by default)
-- ====================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  tree_id uuid references public.trees(id) on delete set null,
  amount numeric not null,
  description text,
  status text not null default 'succeeded'
    check (status in ('pending','succeeded','failed','refunded')),
  provider text not null default 'demo',
  provider_txn_id text,
  created_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);

-- ====================================================================
-- ACHIEVEMENTS + ACTIVITY FEED
-- ====================================================================
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  unlocked_at timestamptz not null default now(),
  unique (user_id, code)
);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  message text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_user_idx on public.activity (user_id);

-- ====================================================================
-- Auto-create profile row on signup
-- ====================================================================
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id,
          coalesce(new.raw_user_meta_data ->> 'full_name', ''),
          coalesce(new.raw_user_meta_data ->> 'role', 'sponsor'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY
-- ====================================================================
alter table public.profiles enable row level security;
alter table public.tree_species enable row level security;
alter table public.trees enable row level security;
alter table public.planting_missions enable row level security;
alter table public.proof enable row level security;
alter table public.growth_updates enable row level security;
alter table public.payments enable row level security;
alter table public.achievements enable row level security;
alter table public.activity enable row level security;

-- --- PROFILES -----------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
using (
  id = auth.uid()
  or public.is_admin()
  or (role = 'planter' and planter_verified)
);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert
with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- --- TREE SPECIES (public catalog) -------------------------------
drop policy if exists species_select on public.tree_species;
create policy species_select on public.tree_species for select using (true);

-- --- TREES ---------------------------------------------------------
drop policy if exists trees_select on public.trees;
create policy trees_select on public.trees for select
using (
  status = 'verified'
  or sponsor_id = auth.uid()
  or planter_id = auth.uid()
  or public.is_admin()
);

drop policy if exists trees_insert on public.trees;
create policy trees_insert on public.trees for insert
with check (sponsor_id = auth.uid() or public.is_admin());

drop policy if exists trees_update on public.trees;
create policy trees_update on public.trees for update
using (sponsor_id = auth.uid() or planter_id = auth.uid() or public.is_admin())
with check (sponsor_id = auth.uid() or planter_id = auth.uid() or public.is_admin());

-- --- PLANTING MISSIONS --------------------------------------------
drop policy if exists missions_select on public.planting_missions;
create policy missions_select on public.planting_missions for select
using (
  planter_id = auth.uid()
  or exists (select 1 from public.trees t where t.id = planting_missions.tree_id and t.sponsor_id = auth.uid())
  or public.is_admin()
);

-- Planters may view funded missions to choose work
drop policy if exists missions_select_funded on public.planting_missions;
create policy missions_select_funded on public.planting_missions for select
using (status = 'funded');

drop policy if exists missions_insert on public.planting_missions;
create policy missions_insert on public.planting_missions for insert
with check (
  public.is_admin()
  or exists (select 1 from public.trees t where t.id = planting_missions.tree_id and t.sponsor_id = auth.uid())
);

drop policy if exists missions_update on public.planting_missions;
create policy missions_update on public.planting_missions for update
using (planter_id = auth.uid() or public.is_admin())
with check (planter_id = auth.uid() or public.is_admin());

-- --- PROOF ----------------------------------------------------------
drop policy if exists proof_select on public.proof;
create policy proof_select on public.proof for select
using (
  public.is_admin()
  or exists (select 1 from public.trees t where t.id = proof.tree_id and (t.sponsor_id = auth.uid() or t.planter_id = auth.uid()))
);

drop policy if exists proof_insert on public.proof;
create policy proof_insert on public.proof for insert
with check (
  public.is_admin()
  or exists (select 1 from public.trees t where t.id = proof.tree_id and t.planter_id = auth.uid())
);

drop policy if exists proof_update on public.proof;
create policy proof_update on public.proof for update
using (public.is_admin())
with check (public.is_admin());

-- --- GROWTH UPDATES -------------------------------------------------
drop policy if exists growth_select on public.growth_updates;
create policy growth_select on public.growth_updates for select
using (
  public.is_admin()
  or exists (
    select 1 from public.trees t
    where t.id = growth_updates.tree_id and (t.sponsor_id = auth.uid() or t.planter_id = auth.uid() or t.status = 'verified')
  )
);

drop policy if exists growth_insert on public.growth_updates;
create policy growth_insert on public.growth_updates for insert
with check (
  public.is_admin()
  or exists (select 1 from public.trees t where t.id = growth_updates.tree_id and t.planter_id = auth.uid())
);

-- --- PAYMENTS -------------------------------------------------------
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists payments_insert on public.payments;
create policy payments_insert on public.payments for insert
with check (user_id = auth.uid() or public.is_admin());

-- --- ACHIEVEMENTS ---------------------------------------------------
drop policy if exists achievements_select on public.achievements;
create policy achievements_select on public.achievements for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists achievements_insert on public.achievements;
create policy achievements_insert on public.achievements for insert
with check (user_id = auth.uid() or public.is_admin());

-- --- ACTIVITY -------------------------------------------------------
drop policy if exists activity_select on public.activity;
create policy activity_select on public.activity for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists activity_insert on public.activity;
create policy activity_insert on public.activity for insert
with check (user_id = auth.uid() or public.is_admin());

-- ====================================================================
-- STORAGE (proof media) — public bucket, tree photos only
-- ====================================================================
insert into storage.buckets (id, name, public)
values ('proof', 'proof', true)
on conflict (id) do nothing;

drop policy if exists proof_storage_read on storage.objects;
create policy proof_storage_read on storage.objects for select using (bucket_id = 'proof');

drop policy if exists proof_storage_insert on storage.objects;
create policy proof_storage_insert on storage.objects for insert
with check (bucket_id = 'proof' and auth.role() = 'authenticated');

drop policy if exists proof_storage_update on storage.objects;
create policy proof_storage_update on storage.objects for update
using (bucket_id = 'proof' and auth.role() = 'authenticated')
with check (bucket_id = 'proof' and auth.role() = 'authenticated');

grant usage on sequence public.tree_id_seq to authenticated, service_role;
grant usage on sequence public.mission_seq to authenticated, service_role;
grant execute on function public.gen_tree_id(text) to authenticated;
grant execute on function public.gen_mission_no() to authenticated;