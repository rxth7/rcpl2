import { z } from "zod";
import { createRouter, adminQuery, authedQuery } from "./middleware.js";
import { getSupabaseAdmin } from "./lib/supabase.js";
import { createAuditLog } from "./lib/utils.js";
import type { BranchRow } from "./lib/db-types.js";

export const branchRouter = createRouter({
  list: adminQuery
    .input(
      z
        .object({
          page: z.number().default(1),
          limit: z.number().default(50),
          search: z.string().optional(),
          status: z.enum(["all", "active", "inactive"]).default("all"),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const supabase = getSupabaseAdmin();
      const params = input || { page: 1, limit: 50, status: "all" as const };
      const from = (params.page - 1) * params.limit;

      let query = supabase.from("branches").select("*", { count: "exact" });
      if (params.search) query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`);
      if (params.status === "active") query = query.eq("isActive", true);
      else if (params.status === "inactive") query = query.eq("isActive", false);

      const { data, count, error } = await query
        .order("name", { ascending: true })
        .range(from, from + params.limit - 1);
      if (error) throw new Error(error.message);

      const items = (data ?? []).map((b: BranchRow) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        contactPerson: b.contactPerson,
        address: b.address,
        isActive: b.isActive,
        createdAt: b.createdAt,
      }));

      const total = count ?? 0;
      return { items, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
    }),

  listAll: adminQuery.query(async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("branches")
      .select("id, name, code")
      .eq("isActive", true)
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((b) => ({ id: b.id, name: b.name, code: b.code }));
  }),

  byId: adminQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("branches").select("*").eq("id", input.id).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      return { id: data.id, name: data.name, code: data.code, contactPerson: data.contactPerson, address: data.address, isActive: data.isActive };
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        contactPerson: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { data: existing } = await supabase.from("branches").select("id").eq("code", input.code).maybeSingle();
      if (existing) throw new Error("Branch code already exists");

      const { data, error } = await supabase
        .from("branches")
        .insert({
          name: input.name,
          code: input.code,
          contactPerson: input.contactPerson ?? null,
          address: input.address ?? null,
          createdBy: ctx.user.id,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);

      await createAuditLog({ userId: ctx.user.id, userType: "admin", action: "create_branch", entityType: "branch", entityId: data.id, details: { name: input.name, code: input.code } });
      return { id: data.id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        contactPerson: z.string().optional(),
        address: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { id, ...rest } = input;
      const set: Partial<BranchRow> = {};
      if (rest.name !== undefined) set.name = rest.name;
      if (rest.code !== undefined) set.code = rest.code;
      if (rest.contactPerson !== undefined) set.contactPerson = rest.contactPerson;
      if (rest.address !== undefined) set.address = rest.address;
      if (rest.isActive !== undefined) set.isActive = rest.isActive;

      const { error } = await supabase.from("branches").update(set).eq("id", id);
      if (error) throw new Error(error.message);
      await createAuditLog({ userId: ctx.user.id, userType: "admin", action: "update_branch", entityType: "branch", entityId: id });
      return { success: true };
    }),

  // Users belonging to a branch
  users: adminQuery
    .input(z.object({ branchId: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, contactPerson, email, branchRole, isActive")
        .eq("branchId", input.branchId)
        .eq("role", "branch")
        .order("contactPerson", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map((u) => ({
        id: u.id,
        username: u.username,
        contactPerson: u.contactPerson,
        email: u.email,
        branchRole: u.branchRole,
        isActive: u.isActive,
      }));
    }),

  delete: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin();
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("branchId", input.id)
        .eq("role", "branch");
      if ((count ?? 0) > 0) throw new Error("Cannot delete branch with linked users. Reassign or remove them first.");
      const { error } = await supabase.from("branches").delete().eq("id", input.id);
      if (error) throw new Error(error.message);
      await createAuditLog({ userId: ctx.user.id, userType: "admin", action: "delete_branch", entityType: "branch", entityId: input.id });
      return { success: true };
    }),

  // Which branch is the current user linked to (for the portal)
  myBranch: authedQuery.query(async ({ ctx }) => {
    const supabase = getSupabaseAdmin();
    const branchId = (ctx.user as { branchId?: string | null }).branchId;
    if (ctx.user.role !== "branch" || !branchId) return null;
    const { data, error } = await supabase.from("branches").select("id, name, code").eq("id", branchId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? { id: data.id, name: data.name, code: data.code } : null;
  }),
});
