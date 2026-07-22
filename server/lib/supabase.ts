import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";
import type { Database } from "./database.js";

let adminClient: SupabaseClient<Database> | null = null;

/**
 * Server-side Supabase client using the service-role key.
 * Bypasses RLS and should NEVER be exposed to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!adminClient) {
    adminClient = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}

/** Browser-safe client (anon key). Use only in client code. */
export function getSupabaseBrowser() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
