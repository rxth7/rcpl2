-- Drop first to start clean
drop table if exists public.ticket_form_config;

-- Create fresh
create table public.ticket_form_config (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  fields jsonb not null default '[]'::jsonb,
  "filesEnabled" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint ticket_form_config_role_check check (role in ('IT', 'Branch Admin', 'Manager')),
  constraint ticket_form_config_role_unique unique (role)
);

-- Add custom fields column to tickets
alter table public.tickets add column if not exists "customFields" jsonb default '{}'::jsonb;

-- RLS
alter table public.ticket_form_config enable row level security;

drop policy if exists "ticket_form_config_admin_all" on public.ticket_form_config;
create policy "ticket_form_config_admin_all" on public.ticket_form_config
  for all using (true) with check (true);

drop policy if exists "ticket_form_config_branch_read" on public.ticket_form_config;
create policy "ticket_form_config_branch_read" on public.ticket_form_config
  for select using (true);

-- Default rows
insert into public.ticket_form_config (role, fields, "filesEnabled") values
  ('IT', '[]'::jsonb, true),
  ('Branch Admin', '[]'::jsonb, true),
  ('Manager', '[]'::jsonb, true)
on conflict (role) do nothing;

-- Realtime
alter publication supabase_realtime add table public.ticket_form_config;
