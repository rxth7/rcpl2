import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sql = `
create table if not exists public.ticket_form_config (
  id uuid primary key default gen_random_uuid(),
  "role" text not null check ("role" in ('IT', 'Branch Admin', 'Manager')),
  "enabled" boolean not null default true,
  "fields" jsonb not null default '[]'::jsonb,
  "filesEnabled" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("role")
);

comment on table public.ticket_form_config is 'Customizable ticket form fields per user role';
comment on column public.ticket_form_config.enabled is 'Whether ticket portal is enabled for this role';
comment on column public.ticket_form_config.fields is 'Array of field definitions: [{ id, label, type, required, options?, placeholder?, sortOrder }]';
comment on column public.ticket_form_config.filesEnabled is 'Whether file upload is enabled for this role';

alter table if exists public.tickets
  add column if not exists "customFields" jsonb default '{}'::jsonb;

comment on column public.tickets.customFields is 'Key-value pairs of custom field values keyed by field id';

alter table if exists public.ticket_form_config enable row level security;

drop policy if exists "ticket_form_config_admin_all" on public.ticket_form_config;
create policy "ticket_form_config_admin_all" on public.ticket_form_config
  for all using (true)
  with check (true);

drop policy if exists "ticket_form_config_branch_read" on public.ticket_form_config;
create policy "ticket_form_config_branch_read" on public.ticket_form_config
  for select using (true);

insert into public.ticket_form_config ("role", "enabled", "fields", "filesEnabled")
values
  ('IT', true, '[]'::jsonb, true),
  ('Branch Admin', true, '[]'::jsonb, true),
  ('Manager', true, '[]'::jsonb, true)
on conflict ("role") do nothing;

alter publication supabase_realtime add table public.ticket_form_config;
`;

async function run() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // The supabase-js client doesn't have a raw SQL method,
  // so we'll try via rpc or direct fetch.
  // Using the REST API with service role key directly.
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apiKey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Migration failed:", res.status, text);
    process.exit(1);
  }

  const result = await res.json();
  console.log("Migration successful:", JSON.stringify(result, null, 2));
}

run().catch(console.error);
