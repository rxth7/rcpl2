import { z } from "zod";
import { createRouter, authedQuery } from "./middleware.js";
import { getSupabaseAdmin } from "./lib/supabase.js";

export const notificationRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        unreadOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const params = input || { page: 1, limit: 20, unreadOnly: false };

      const recipientId = ctx.user.id;
      const recipientType = ctx.user.type;

      let countQuery = supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipientId", recipientId)
        .eq("recipientType", recipientType);
      if (params.unreadOnly) {
        countQuery = countQuery.eq("isRead", false);
      }
      const { count } = await countQuery;

      let itemsQuery = supabase
        .from("notifications")
        .select("*")
        .eq("recipientId", recipientId)
        .eq("recipientType", recipientType);
      if (params.unreadOnly) {
        itemsQuery = itemsQuery.eq("isRead", false);
      }
      const { data: items } = await itemsQuery
        .order("createdAt", { ascending: false })
        .range((params.page - 1) * params.limit, params.page * params.limit - 1);

      return {
        items: items ?? [],
        total: count ?? 0,
      };
    }),

  unreadCount: authedQuery.query(async ({ ctx }) => {
    const supabase = getSupabaseAdmin();
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipientId", ctx.user.id)
      .eq("recipientType", ctx.user.type)
      .eq("isRead", false);
    return { count: count ?? 0 };
  }),

  markAsRead: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from("notifications")
        .update({ isRead: true })
        .eq("id", input.id)
        .eq("recipientId", ctx.user.id)
        .eq("recipientType", ctx.user.type);
      if (error) throw new Error(error.message);
      return { success: true };
    }),

  markAllAsRead: authedQuery.mutation(async ({ ctx }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("notifications")
      .update({ isRead: true })
      .eq("recipientId", ctx.user.id)
      .eq("recipientType", ctx.user.type)
      .eq("isRead", false);
    if (error) throw new Error(error.message);
    return { success: true };
  }),

  delete: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", input.id)
        .eq("recipientId", ctx.user.id)
        .eq("recipientType", ctx.user.type);
      if (error) throw new Error(error.message);
      return { success: true };
    }),
});
