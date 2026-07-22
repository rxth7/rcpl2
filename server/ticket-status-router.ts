import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getSupabaseAdmin } from "./lib/supabase.js";
import type { TicketStatusRow } from "./lib/db-types.js";
import { createAuditLog } from "./lib/utils.js";

export const ticketStatusRouter = createRouter({
  list: publicQuery.query(async () => {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("ticket_statuses")
      .select("*")
      .order("sortOrder", { ascending: true });
    return data ?? [];
  }),

  listEnabled: publicQuery.query(async () => {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("ticket_statuses")
      .select("*")
      .eq("isEnabled", true)
      .order("sortOrder", { ascending: true });
    return data ?? [];
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        isOpen: z.boolean().default(true),
        sortOrder: z.number().default(0),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("ticket_statuses")
        .insert({
          name: input.name,
          color: input.color,
          isOpen: input.isOpen,
          sortOrder: input.sortOrder,
          description: input.description ?? null,
          isDefault: false,
          isEnabled: true,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "create_status",
        entityType: "ticketStatus",
        entityId: data.id,
        details: { name: input.name, color: input.color },
      });

      return { id: data.id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        isOpen: z.boolean().optional(),
        isEnabled: z.boolean().optional(),
        sortOrder: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { id, ...rest } = input;

      const updates: Partial<TicketStatusRow> = { updatedAt: new Date().toISOString() };
      if (rest.name !== undefined) updates.name = rest.name;
      if (rest.color !== undefined) updates.color = rest.color;
      if (rest.isOpen !== undefined) updates.isOpen = rest.isOpen;
      if (rest.isEnabled !== undefined) updates.isEnabled = rest.isEnabled;
      if (rest.sortOrder !== undefined) updates.sortOrder = rest.sortOrder;
      if (rest.description !== undefined) updates.description = rest.description;

      const { error } = await supabase.from("ticket_statuses").update(updates).eq("id", id);
      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "update_status",
        entityType: "ticketStatus",
        entityId: id,
        details: updates,
      });

      return { success: true };
    }),

  reorder: adminQuery
    .input(
      z.object({
        orders: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();

      for (const item of input.orders) {
        await supabase
          .from("ticket_statuses")
          .update({ sortOrder: item.sortOrder })
          .eq("id", item.id);
      }

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "reorder_statuses",
        entityType: "ticketStatus",
        details: { count: input.orders.length },
      });

      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();

      const { data: status } = await supabase
        .from("ticket_statuses")
        .select("*")
        .eq("id", input.id)
        .maybeSingle();
      if (!status) throw new Error("Status not found");
      if (status.isDefault) throw new Error("Cannot delete default statuses");

      const { count } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("statusId", input.id);

      if ((count ?? 0) > 0) {
        throw new Error("Cannot delete status that is in use by tickets");
      }

      const { error } = await supabase.from("ticket_statuses").delete().eq("id", input.id);
      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "delete_status",
        entityType: "ticketStatus",
        entityId: input.id,
        details: { name: status.name },
      });

      return { success: true };
    }),
});
