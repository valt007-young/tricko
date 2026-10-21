-- ====================================================================
-- TRIKO Cashfree payment intents
-- Tracks an order from "created" (checkout opened) to "completed"
-- (payment confirmed via webhook / order sync). Payload holds the
-- snapshot of what to plant once the money clears.
-- ====================================================================

create table if not exists public.payment_intents (
  order_id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'INR',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'created'
    check (status in ('created', 'processing', 'completed', 'failed')),
  cf_order_id text,
  payment_session_id text,
  provider_txn_id text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists payment_intents_user_idx on public.payment_intents (user_id);

alter table public.payment_intents enable row level security;

drop policy if exists payment_intents_select on public.payment_intents;
create policy payment_intents_select on public.payment_intents for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists payment_intents_insert on public.payment_intents;
create policy payment_intents_insert on public.payment_intents for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists payment_intents_update on public.payment_intents;
create policy payment_intents_update on public.payment_intents for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());