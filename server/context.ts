import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getSupabaseAdmin } from "./lib/supabase.js";
import { mapProfileToUnifiedUser, type Profile, type UnifiedUser } from "./lib/db-types.js";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: UnifiedUser;
};

async function loadProfileByAuthId(authId: string): Promise<UnifiedUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileToUnifiedUser(data as Profile);
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  const authHeader = opts.req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase.auth.getUser(token);
      if (data.user) {
        const user = await loadProfileByAuthId(data.user.id);
        if (user) ctx.user = user;
      }
    } catch {
      // Invalid token; leave user unauthenticated
    }
  }

  return ctx;
}
