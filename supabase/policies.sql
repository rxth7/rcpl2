-- Row Level Security policies.
-- The app accesses data server-side via the service_role key, which BYPASSES RLS,
-- so enabling RLS does NOT affect app functionality. These policies only protect
-- the tables from direct access using the public anon key.

-- Enable RLS on every table (no policy = no anon/authenticated access; service_role still works).
alter table if exists public.profiles enable row level security;
alter table if exists public.tickets enable row level security;
alter table if exists public.ticket_statuses enable row level security;
alter table if exists public.ticket_priorities enable row level security;
alter table if exists public.ticket_categories enable row level security;
alter table if exists public.ticket_subcategories enable row level security;
alter table if exists public.ticket_timeline enable row level security;
alter table if exists public.ticket_comments enable row level security;
alter table if exists public.ticket_attachments enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.audit_logs enable row level security;
alter table if exists public.system_settings enable row level security;
alter table if exists public.email_templates enable row level security;

-- Allow each user to read/update only their own profile row (useful if you later
-- add direct browser access; harmless today since the server uses service_role).
drop policy if exists "Profiles: owner select" on public.profiles;
create policy "Profiles: owner select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles: owner update" on public.profiles;
create policy "Profiles: owner update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
