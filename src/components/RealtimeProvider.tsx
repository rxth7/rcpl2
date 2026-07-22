import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/providers/trpc";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TicketRow = { ticketId?: string | null };

/**
 * Subscribes to Supabase Realtime changes on the ticket-related tables and
 * invalidates the matching react-query caches. This keeps every connected
 * browser in sync without a manual refresh: when one user inserts a comment,
 * timeline entry, status change, etc., all other viewers of that ticket
 * automatically refetch.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const utils = trpc.useUtils();

  useEffect(() => {
    const channel = supabase
      .channel("app-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_comments" },
        (e: RealtimePostgresChangesPayload<TicketRow>) => {
          const row = e.new as TicketRow;
          if (row.ticketId) {
            utils.ticketComment.list.invalidate({ ticketId: row.ticketId });
            utils.ticketTimeline.list.invalidate({ ticketId: row.ticketId });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_timeline" },
        (e: RealtimePostgresChangesPayload<TicketRow>) => {
          const row = e.new as TicketRow;
          if (row.ticketId) {
            utils.ticketTimeline.list.invalidate({ ticketId: row.ticketId });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        (e: RealtimePostgresChangesPayload<TicketRow>) => {
          const row = e.new as TicketRow;
          utils.ticket.list.invalidate();
          if (row.ticketId) {
            utils.ticket.byId.invalidate({ id: row.ticketId });
            utils.ticketTimeline.list.invalidate({ ticketId: row.ticketId });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket_statuses" },
        () => {
          utils.ticketStatus.list.invalidate();
          utils.ticketStatus.listEnabled.invalidate();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          utils.notification.unreadCount.invalidate();
          utils.notification.list.invalidate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <>{children}</>;
}
