-- Add enabled column to ticket_form_config
alter table public.ticket_form_config
  add column if not exists enabled boolean not null default true;

comment on column public.ticket_form_config.enabled is 'Whether ticket portal is enabled for this role';

-- Set existing rows to enabled by default
update public.ticket_form_config set enabled = true where enabled is null;
