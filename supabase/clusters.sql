-- =============================================================
-- CLUSTER FEATURE — FULL MIGRATION SCRIPT
-- Run this on a fresh Supabase project after running
-- schema.sql, branches.sql, stationary.sql, policies.sql, etc.
-- =============================================================

-- 0. Add 'cluster' to profiles role CHECK constraint
--    (required so the 'cluster' role can be stored in profiles)
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'profiles_role_check' and table_name = 'profiles'
  ) then
    alter table public.profiles drop constraint profiles_role_check;
  end if;
end $$;
alter table public.profiles
  add constraint profiles_role_check
  CHECK (role in ('admin', 'branch', 'cluster'));

-- 1. Create clusters table
create table if not exists public.clusters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "createdBy" uuid
);

comment on table public.clusters is 'Cluster groups for branch management';

-- 2. Add clusterId to profiles
alter table public.profiles
  add column if not exists "clusterId" uuid;

-- 3. Add cluster fields to stationary_orders
alter table public.stationary_orders
  add column if not exists "clusterId" uuid;
alter table public.stationary_orders
  add column if not exists "clusterApprovedAt" timestamptz;
alter table public.stationary_orders
  add column if not exists "clusterApprovedBy" uuid;

-- 4. Foreign key constraints
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'profiles_clusterid_fkey' and table_name = 'profiles'
  ) then
    alter table public.profiles
      add constraint profiles_clusterid_fkey
      foreign key ("clusterId") references public.clusters(id)
      on delete set null;
  end if;

  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'stationary_orders_clusterid_fkey' and table_name = 'stationary_orders'
  ) then
    alter table public.stationary_orders
      add constraint stationary_orders_clusterid_fkey
      foreign key ("clusterId") references public.clusters(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_profiles_cluster_id
  on public.profiles ("clusterId");

-- 5. RLS policies for clusters table
alter table public.clusters enable row level security;

drop policy if exists "clusters_admin_all" on public.clusters;
create policy "clusters_admin_all"
  on public.clusters for all using (true) with check (true);

drop policy if exists "clusters_cluster_read" on public.clusters;
create policy "clusters_cluster_read"
  on public.clusters for select using (true);

drop policy if exists "clusters_branch_read" on public.clusters;
create policy "clusters_branch_read"
  on public.clusters for select using (true);

-- 6. Add clusters to realtime publication
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and tablename = 'clusters'
      and schemaname = 'public'
  ) then
    alter publication supabase_realtime add table public.clusters;
  end if;
end $$;
