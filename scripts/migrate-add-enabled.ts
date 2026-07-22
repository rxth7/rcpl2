const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

const sql = `
alter table public.ticket_form_config
  add column if not exists enabled boolean not null default true;

comment on column public.ticket_form_config.enabled is 'Whether ticket portal is enabled for this role';

update public.ticket_form_config set enabled = true where enabled is null;
`;

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pg_query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apiKey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
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
