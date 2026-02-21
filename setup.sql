-- ═══════════════════════════════════════════════════════
-- HourTrack — Database Setup
-- Paste this entire script into Supabase SQL Editor and Run
-- ═══════════════════════════════════════════════════════

-- 1. ASSETS
create table if not exists public.assets (
  id text primary key,
  name text not null,
  location text default '',
  meter_max_value integer not null default 9999,
  reset_count integer not null default 0,
  stuck_reading integer not null default 0,
  created_at text,
  active_status boolean default true,
  threshold_hours integer default 200
);

-- 2. MONTHLY READINGS
create table if not exists public.monthly_readings (
  id text primary key,
  asset_id text references public.assets(id) on delete cascade,
  month text not null,
  raw_meter_reading integer not null,
  locked boolean default false,
  created_at text,
  created_by text default '',
  validation text default 'OK',
  constraint unique_asset_month unique(asset_id, month)
);

-- 3. REPLACEMENT LOGS
create table if not exists public.replacement_logs (
  id text primary key,
  asset_id text references public.assets(id),
  replacement_date text,
  last_stuck_reading integer default 0,
  previous_reset_count integer default 0,
  new_reset_count integer default 0,
  notes text default ''
);

-- 4. AUDIT LOG
create table if not exists public.audit_log (
  id text primary key,
  timestamp text,
  user_email text,
  action text,
  entity text,
  entity_id text,
  detail text
);

-- 5. CLOSED MONTHS
create table if not exists public.closed_months (
  month text primary key,
  closed_by text,
  closed_at timestamptz default now()
);

-- 6. USER PROFILES (roles)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  role text default 'viewer',
  created_at timestamptz default now()
);

-- 7. AUTO-CREATE PROFILE ON SIGNUP
--    First user to ever sign up becomes Admin automatically.
--    Everyone after starts as Viewer. Admin promotes them in the app.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_count integer;
  v_role  text;
begin
  select count(*) into v_count from public.profiles;
  v_role := case when v_count = 0 then 'admin' else 'viewer' end;
  insert into public.profiles (id, email, role)
  values (new.id, new.email, v_role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. ROW LEVEL SECURITY (RLS)
alter table public.assets          enable row level security;
alter table public.monthly_readings enable row level security;
alter table public.replacement_logs enable row level security;
alter table public.audit_log        enable row level security;
alter table public.closed_months    enable row level security;
alter table public.profiles         enable row level security;

-- All authenticated users can read and write everything.
-- Role restrictions (who can edit) are enforced inside the app UI.
create policy "auth_all_assets"    on public.assets          for all using (auth.role() = 'authenticated');
create policy "auth_all_readings"  on public.monthly_readings for all using (auth.role() = 'authenticated');
create policy "auth_all_repls"     on public.replacement_logs for all using (auth.role() = 'authenticated');
create policy "auth_all_audit"     on public.audit_log        for all using (auth.role() = 'authenticated');
create policy "auth_all_closed"    on public.closed_months    for all using (auth.role() = 'authenticated');
create policy "auth_all_profiles"  on public.profiles         for all using (auth.role() = 'authenticated');
