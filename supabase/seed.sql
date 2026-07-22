-- Standalone seed (safe to re-run; idempotent via ON CONFLICT DO NOTHING).
-- Run this in the Supabase SQL editor after schema.sql.

-- Ticket number settings
insert into public.system_settings (key, value, description)
values ('ticket_number_format', 'RC-YYYY-XXXXXX', 'Format for generated ticket numbers')
on conflict (key) do nothing;
insert into public.system_settings (key, value, description)
values ('ticket_number_counter', '0', 'Counter for generated ticket numbers')
on conflict (key) do nothing;

-- Default statuses
insert into public.ticket_statuses (name, color, "isOpen", "isDefault", "isEnabled", "sortOrder")
values ('Open', '#3B82F6', true, true, true, 1) on conflict do nothing;
insert into public.ticket_statuses (name, color, "isOpen", "isDefault", "isEnabled", "sortOrder")
values ('In Progress', '#F59E0B', true, false, true, 2) on conflict do nothing;
insert into public.ticket_statuses (name, color, "isOpen", "isDefault", "isEnabled", "sortOrder")
values ('Solved', '#10B981', false, false, true, 3) on conflict do nothing;
insert into public.ticket_statuses (name, color, "isOpen", "isDefault", "isEnabled", "sortOrder")
values ('Closed', '#6B7280', false, false, true, 4) on conflict do nothing;

-- Default priorities
insert into public.ticket_priorities (name, color, "isDefault", "sortOrder")
values ('Low', '#6B7280', false, 1) on conflict do nothing;
insert into public.ticket_priorities (name, color, "isDefault", "sortOrder")
values ('Medium', '#3B82F6', true, 2) on conflict do nothing;
insert into public.ticket_priorities (name, color, "isDefault", "sortOrder")
values ('High', '#F59E0B', false, 3) on conflict do nothing;
insert into public.ticket_priorities (name, color, "isDefault", "sortOrder")
values ('Urgent', '#EF4444', false, 4) on conflict do nothing;

-- Default category
insert into public.ticket_categories (name, description, "isActive")
values ('General', 'General inquiries and issues', true) on conflict do nothing;
