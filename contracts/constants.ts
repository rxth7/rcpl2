export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
} as const;

export const BRANCH_ROLES = ["IT", "Branch Admin", "Manager"] as const;
export type BranchRole = (typeof BRANCH_ROLES)[number];
