import { createRouter, authedQuery } from "./middleware";
import type { UnifiedUser } from "./lib/db-types";

export const authRouter = createRouter({
  me: authedQuery.query((opts): UnifiedUser => {
    if (!opts.ctx.user) {
      throw new Error("Not authenticated");
    }
    return opts.ctx.user;
  }),
  logout: authedQuery.mutation(() => {
    return { success: true };
  }),
});
