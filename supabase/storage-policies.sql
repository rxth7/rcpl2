-- ============================================================
-- Storage bucket policies for ticket-attachments
-- ============================================================

-- Allow authenticated users to read files
drop policy if exists "ticket_attachments_select" on storage.objects;
create policy "ticket_attachments_select" on storage.objects
  for select using (
    bucket_id = 'ticket-attachments'
    and auth.role() = 'authenticated'
  );

-- Allow authenticated users to insert files
drop policy if exists "ticket_attachments_insert" on storage.objects;
create policy "ticket_attachments_insert" on storage.objects
  for insert with check (
    bucket_id = 'ticket-attachments'
    and auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete files
drop policy if exists "ticket_attachments_delete" on storage.objects;
create policy "ticket_attachments_delete" on storage.objects
  for delete using (
    bucket_id = 'ticket-attachments'
    and auth.role() = 'authenticated'
  );
