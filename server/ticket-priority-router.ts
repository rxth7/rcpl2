import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getSupabaseAdmin } from "./lib/supabase.js";
import { createAuditLog } from "./lib/utils.js";

export const ticketPriorityRouter = createRouter({
  list: publicQuery.query(async () => {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("ticket_priorities")
      .select("*")
      .order("sortOrder", { ascending: true });
    return data ?? [];
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        sortOrder: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("ticket_priorities")
        .insert({
          name: input.name,
          color: input.color,
          sortOrder: input.sortOrder,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "create_priority",
        entityType: "ticketPriority",
        entityId: data.id,
      });

      return { id: data.id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { id, ...updates } = input;
      const { error } = await supabase
        .from("ticket_priorities")
        .update(updates)
        .eq("id", id);
      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "update_priority",
        entityType: "ticketPriority",
        entityId: id,
      });

      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();

      const { count } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("priorityId", input.id);

      if ((count ?? 0) > 0) {
        throw new Error("Cannot delete priority that is in use");
      }

      const { error } = await supabase
        .from("ticket_priorities")
        .delete()
        .eq("id", input.id);
      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "delete_priority",
        entityType: "ticketPriority",
        entityId: input.id,
      });

      return { success: true };
    }),
});
