-- Migration: add branch sub-role support.
-- Run this in the Supabase SQL editor against your EXISTING database
-- (the tables were created by schema.sql, so we ALTER instead of recreate).

-- 1. Sub-role on branch users (IT / Branch Admin / Manager). Null = plain branch user.
alter table if exists public.profiles
  add column if not exists "branchRole" text check ("branchRole" in ('IT', 'Branch Admin', 'Manager'));

-- 2. Tag tickets with the creator's branch sub-role (for later custom routing/filtering).
alter table if exists public.tickets
  add column if not exists "branchRole" text check ("branchRole" in ('IT', 'Branch Admin', 'Manager'));
