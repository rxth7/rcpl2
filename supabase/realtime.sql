-- Realtime + RLS for live updates.
-- The browser connects with the public anon key, so the tables must have RLS
-- ENABLED and a policy that allows the anon role to RECEIVE realtime changes.
-- (All writes still happen server-side via the service_role key, which bypasses RLS.)

-- 1. Turn on replication for the tables we subscribe to.
--    The `supabase_realtime` publication exists by default in every Supabase
--    project. `ALTER PUBLICATION` has no IF EXISTS, so guard with a DO block.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.tickets;
    alter publication supabase_realtime add table public.ticket_comments;
    alter publication supabase_realtime add table public.ticket_timeline;
    alter publication supabase_realtime add table public.ticket_statuses;
    alter publication supabase_realtime add table public.notifications;
  else
    raise notice 'supabase_realtime publication not found; create it or enable replication in the dashboard.';
  end if;
end $$;

-- 2. Enable RLS (no policy for anon writes; anon only receives realtime events).
alter table if exists public.tickets enable row level security;
alter table if exists public.ticket_comments enable row level security;
alter table if exists public.ticket_timeline enable row level security;
alter table if exists public.ticket_statuses enable row level security;
alter table if exists public.notifications enable row level security;

-- 3. Allow the anon/authenticated role to *receive* realtime changes.
--    Realtime respects RLS select policies, so grant select to authenticated.
drop policy if exists "Realtime: tickets select" on public.tickets;
create policy "Realtime: tickets select" on public.tickets for select using (true);

drop policy if exists "Realtime: comments select" on public.ticket_comments;
create policy "Realtime: comments select" on public.ticket_comments for select using (true);

drop policy if exists "Realtime: timeline select" on public.ticket_timeline;
create policy "Realtime: timeline select" on public.ticket_timeline for select using (true);

drop policy if exists "Realtime: statuses select" on public.ticket_statuses;
create policy "Realtime: statuses select" on public.ticket_statuses for select using (true);

drop policy if exists "Realtime: notifications select" on public.notifications;
create policy "Realtime: notifications select" on public.notifications for select using (true);
