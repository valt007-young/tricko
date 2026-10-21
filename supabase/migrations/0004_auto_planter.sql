-- ====================================================================
-- TRIKO auto-planter — no admin approval queue. Planter signups are
-- verified immediately; roles are still chosen once at signup and
-- locked afterwards (column grants from 0003).
-- ====================================================================

-- 1. Trigger: planter signups get planter_verified = true right away.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  chosen_role text := coalesce(new.raw_user_meta_data ->> 'role', 'sponsor');
begin
  insert into public.profiles (id, full_name, role, planter_verified)
  values (new.id,
          coalesce(new.raw_user_meta_data ->> 'full_name', ''),
          chosen_role,
          chosen_role = 'planter')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Backfill: every existing planter counts as verified.
update public.profiles
set planter_verified = true
where role = 'planter' and planter_verified = false;

-- 3. Approval queue is gone.
drop function if exists public.approve_planter(uuid);