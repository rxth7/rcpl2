import { authRouter } from "./auth-router";
import { branchUserRouter } from "./branch-user-router";
import { branchRouter } from "./branch-router";
import { clusterRouter } from "./cluster-router";
import { ticketRouter } from "./ticket-router";
import { ticketCommentRouter } from "./ticket-comment-router";
import { ticketTimelineRouter } from "./ticket-timeline-router";
import { ticketStatusRouter } from "./ticket-status-router";
import { ticketCategoryRouter } from "./ticket-category-router";
import { ticketPriorityRouter } from "./ticket-priority-router";
import { notificationRouter } from "./notification-router";
import { auditLogRouter } from "./audit-log-router";
import { settingsRouter } from "./settings-router";
import { dashboardRouter } from "./dashboard-router";
import { reportRouter } from "./report-router";
import { stationaryRouter } from "./stationary-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  branchUser: branchUserRouter,
  branch: branchRouter,
  cluster: clusterRouter,
  ticket: ticketRouter,
  ticketComment: ticketCommentRouter,
  ticketTimeline: ticketTimelineRouter,
  ticketStatus: ticketStatusRouter,
  ticketCategory: ticketCategoryRouter,
  ticketPriority: ticketPriorityRouter,
  notification: notificationRouter,
  auditLog: auditLogRouter,
  settings: settingsRouter,
  dashboard: dashboardRouter,
  report: reportRouter,
  stationary: stationaryRouter,
});

export type AppRouter = typeof appRouter;
