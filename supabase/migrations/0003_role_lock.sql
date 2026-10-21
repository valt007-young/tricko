-- ====================================================================
-- TRIKO role lock — roles and planter verification can no longer be
-- changed by users. Role is chosen at signup; only an admin approves
-- planter verification (via public.approve_planter).
-- ====================================================================

-- 1. Column-level lockdown on profiles.
--    Users may still edit their profile (name/bio/region), but the
--    columns that grant access or powers are frozen for them.
--    service_role (scripts, webhook finalizer) keeps full access.
revoke update on table public.profiles from authenticated;
grant update (full_name, bio, region) on table public.profiles to authenticated;

-- 2. Admin approval helper. SECURITY DEFINER so the column lock above
--    doesn't block admin approvals made from the normal login client.
create or replace function public.approve_planter(target uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'admins only';
  end if;

  update public.profiles
  set planter_verified = true
  where id = target and role = 'planter';
end;
$$;

revoke execute on function public.approve_planter(uuid) from public;
revoke execute on function public.approve_planter(uuid) from anon;
grant execute on function public.approve_planter(uuid) to authenticated;