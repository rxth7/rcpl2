import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getSupabaseAdmin } from "./lib/supabase.js";
import { createAuditLog } from "./lib/utils.js";

export const settingsRouter = createRouter({
  list: publicQuery.query(async () => {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("system_settings").select("*");
    const settingsMap: Record<string, string> = {};
    for (const s of data ?? []) {
      settingsMap[s.key] = s.value;
    }
    return settingsMap;
  }),

  get: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", input.key)
        .maybeSingle();
      return data?.value || null;
    }),

  update: adminQuery
    .input(z.object({ settings: z.record(z.string(), z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const now = new Date().toISOString();

      const rows = Object.entries(input.settings).map(([key, value]) => ({
        key,
        value,
        updatedAt: now,
        updatedBy: ctx.user.id,
      }));

      await supabase.from("system_settings").upsert(rows, { onConflict: "key" });

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "update_settings",
        entityType: "systemSettings",
        details: { keys: Object.keys(input.settings) },
      });

      return { success: true };
    }),

  previewTicketNumber: adminQuery.query(async () => {
    const supabase = getSupabaseAdmin();
    const { data: formatRows } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "ticket_number_format")
      .maybeSingle();
    const { data: counterRows } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "ticket_number_counter")
      .maybeSingle();

    const format = formatRows?.value || "RC-YYYY-XXXXXX";
    const counter = parseInt(counterRows?.value || "0", 10) + 1;
    const year = new Date().getFullYear().toString();

    const preview = format
      .replace("YYYY", year)
      .replace("XXXXXX", counter.toString().padStart(6, "0"));

    return { preview, format };
  }),
});
