import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getSupabaseAdmin } from "./lib/supabase.js";
import { createAuditLog } from "./lib/utils.js";

export const ticketCategoryRouter = createRouter({
  list: publicQuery.query(async () => {
    const supabase = getSupabaseAdmin();
    const { data: categories } = await supabase
      .from("ticket_categories")
      .select("*")
      .eq("isActive", true);
    const { data: subcategories } = await supabase
      .from("ticket_subcategories")
      .select("*")
      .eq("isActive", true);

    return (categories ?? []).map(cat => ({
      ...cat,
      subcategories: (subcategories ?? []).filter(sub => sub.categoryId === cat.id),
    }));
  }),

  listAll: adminQuery.query(async () => {
    const supabase = getSupabaseAdmin();
    const { data: categories } = await supabase.from("ticket_categories").select("*");
    const { data: subcategories } = await supabase.from("ticket_subcategories").select("*");

    return (categories ?? []).map(cat => ({
      ...cat,
      subcategories: (subcategories ?? []).filter(sub => sub.categoryId === cat.id),
    }));
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("ticket_categories")
        .insert({
          name: input.name,
          description: input.description ?? null,
          isActive: true,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "create_category",
        entityType: "ticketCategory",
        entityId: data.id,
      });

      return { id: data.id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { id, ...updates } = input;
      const { error } = await supabase
        .from("ticket_categories")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "update_category",
        entityType: "ticketCategory",
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
        .eq("categoryId", input.id);

      if ((count ?? 0) > 0) {
        throw new Error("Cannot delete category that is in use");
      }

      const { error: delSubErr } = await supabase
        .from("ticket_subcategories")
        .delete()
        .eq("categoryId", input.id);
      if (delSubErr) throw new Error(delSubErr.message);

      const { error } = await supabase
        .from("ticket_categories")
        .delete()
        .eq("id", input.id);
      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "delete_category",
        entityType: "ticketCategory",
        entityId: input.id,
      });

      return { success: true };
    }),

  createSubcategory: adminQuery
    .input(
      z.object({
        categoryId: z.string(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("ticket_subcategories")
        .insert({
          categoryId: input.categoryId,
          name: input.name,
          description: input.description ?? null,
          isActive: true,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      await createAuditLog({
        userId: ctx.user.id,
        userType: "admin",
        action: "create_subcategory",
        entityType: "ticketSubcategory",
        entityId: data.id,
      });

      return { id: data.id };
    }),

  updateSubcategory: adminQuery
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseAdmin();
      const { id, ...updates } = input;
      const { error } = await supabase
        .from("ticket_subcategories")
        .update(updates)
        .eq("id", id);
      if (error) throw new Error(error.message);

      return { success: true };
    }),

  deleteSubcategory: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = getSupabaseAdmin();

      const { count } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("subcategoryId", input.id);

      if ((count ?? 0) > 0) {
        throw new Error("Cannot delete subcategory that is in use");
      }

      const { error } = await supabase
        .from("ticket_subcategories")
        .delete()
        .eq("id", input.id);
      if (error) throw new Error(error.message);
      return { success: true };
    }),
});
