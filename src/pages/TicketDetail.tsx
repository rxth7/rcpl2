import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, Send, Clock, User, Tag,
  Building2, Calendar, Loader2, RefreshCw,
  Download, X, ChevronLeft, ChevronRight,
} from "lucide-react";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const ticketId = id ?? "";

  const chatRef = useRef<HTMLDivElement>(null);

  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState<"conversation" | "timeline">("conversation");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: ticket, isLoading } = trpc.ticket.byId.useQuery({ id: ticketId });
  const { data: comments } = trpc.ticketComment.list.useQuery({ ticketId });
  const { data: timeline } = trpc.ticketTimeline.list.useQuery({ ticketId });
  const { data: statuses } = trpc.ticketStatus.listEnabled.useQuery();
  const { data: formConfig } = trpc.ticket.getFormConfig.useQuery(
    { role: ticket?.branchRole ?? undefined },
    { enabled: !!ticket?.branchRole }
  );
  const { data: settings } = trpc.settings.list.useQuery();
  const liveChatEnabled = settings?.live_chat_enabled !== "false";

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [comments, activeTab]);

  const addComment = trpc.ticketComment.create.useMutation({
    onSuccess: () => {
      utils.ticketComment.list.invalidate({ ticketId });
      utils.ticketTimeline.list.invalidate({ ticketId });
      setComment("");
    },
  });

  const changeStatus = trpc.ticket.changeStatus.useMutation({
    onSuccess: () => {
      utils.ticket.byId.invalidate({ id: ticketId });
      utils.ticketTimeline.list.invalidate({ ticketId });
      setStatusDropdown(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ticket not found</p>
        <button onClick={() => navigate("/tickets")} className="text-red-600 text-sm mt-2 hover:underline">
          Back to tickets
        </button>
      </div>
    );
  }

  const handleSendComment = () => {
    const text = comment.trim();
    if (!text || addComment.isPending) return;
    setComment("");
    addComment.mutate({ ticketId, content: text });
  };

  const handleStatusChange = (statusId: string) => {
    changeStatus.mutate({ ticketId, statusId });
  };

  const statusColor = ticket.status?.color || "#6B7280";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/tickets")}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-red-600 font-medium">{ticket.ticketNumber}</span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                >
                  {ticket.status?.name || "Unknown"}
                </span>
              </div>
              <h1 className="text-lg font-semibold text-gray-800 mt-1">{ticket.subject}</h1>
            </div>
          </div>

          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setStatusDropdown(!statusDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Change Status
              </button>
              {statusDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setStatusDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
                    {statuses?.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleStatusChange(s.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-gray-700">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("conversation")}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "conversation" ? "text-red-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Conversation
                {activeTab === "conversation" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "timeline" ? "text-red-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Timeline History
                {activeTab === "timeline" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
              </button>
            </div>

            <div className="p-4">
              {activeTab === "conversation" ? (
                <div className="space-y-4">
                  {/* Comments */}
                  <div ref={chatRef} className="space-y-4 max-h-[500px] overflow-auto">
                    {comments?.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No comments yet. Start the conversation below.
                      </div>
                    )}
                    {comments?.map((c) => (
                      <div
                        key={c.id}
                        className={`flex gap-3 ${c.authorType === user?.type ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          c.authorType === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div className={`max-w-[80%] ${c.authorType === user?.type ? "items-end" : "items-start"}`}>
                          <div className={`px-4 py-3 rounded-xl text-sm ${
                            c.authorType === user?.type
                              ? "bg-red-600 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            <p className="text-xs font-medium opacity-75 mb-1">{c.authorName}</p>
                            <p>{c.content}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                             {new Date(c.createdAt ?? new Date()).toLocaleDateString()} {new Date(c.createdAt ?? new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  {!liveChatEnabled ? (
                    <div className="relative pt-3 border-t border-gray-100">
                      <div className="blur-[4px] pointer-events-none">
                        <div className="flex gap-2">
                          <textarea
                            placeholder="Type your message..."
                            rows={2}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                            disabled
                          />
                          <button disabled className="px-4 py-2 bg-red-600 text-white rounded-lg opacity-30 self-end">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-white/90 px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
                          Live chat is currently off
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendComment();
                          }
                        }}
                      />
                      <button
                        onClick={handleSendComment}
                        disabled={!comment.trim() || addComment.isPending}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-30 self-end"
                      >
                        {addComment.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-0 max-h-[500px] overflow-auto">
                  {timeline?.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No timeline events yet.
                    </div>
                  )}
                  {timeline?.map((entry, idx) => (
                    <div key={entry.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className="relative flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        {idx < (timeline?.length || 0) - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-800">{entry.action.replace(/_/g, " ")}</span>
                          <span className="text-xs text-gray-400">
                             {new Date(entry.createdAt ?? new Date()).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-gray-600 mt-0.5">{entry.description}</p>
                        )}
                        {entry.previousValue && entry.newValue && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {entry.previousValue} &rarr; {entry.newValue}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">by {entry.actorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Ticket Details</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Status:</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium ml-auto"
                  style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                >
                  {ticket.status?.name || "-"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Branch:</span>
                <span className="ml-auto">{ticket.branch?.branchName || "-"}</span>
              </div>
              {ticket.branchRole && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-auto">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ticket.branchRole === "IT" ? "bg-blue-50 text-blue-700" :
                      ticket.branchRole === "Branch Admin" ? "bg-purple-50 text-purple-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>{ticket.branchRole}</span>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Created by:</span>
                <span className="ml-auto">{ticket.branch?.contactPerson || "-"}</span>
              </div>

              {ticket.assignee && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Assigned to:</span>
                  <span className="ml-auto">{ticket.assignee.name || "-"}</span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-auto">{new Date(ticket.createdAt ?? new Date()).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Updated:</span>
                  <span className="ml-auto">{new Date(ticket.updatedAt ?? new Date()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {(() => {
            const cfg = Array.isArray(formConfig) ? formConfig[0] : formConfig;
            const fields: any[] = cfg?.fields ?? [];
            const custom = (ticket as any)?.customFields ?? {};
            if (fields.length === 0) return null;
            return (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <h3 className="font-semibold text-gray-800 mb-1">Additional Details</h3>
                {fields.map((f) => {
                  const v = custom[f.id];
                  if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) return null;
                  const display = Array.isArray(v) ? v.join(", ") : String(v);
                  return (
                    <div key={f.id} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-xs font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">{f.label}</span>
                      <span className="text-sm text-gray-800">{display}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Attachments */}
          {(ticket as any).attachments?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Attachments ({((ticket as any).attachments ?? []).length})</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {((ticket as any).attachments ?? []).map((a: any, idx: number) => {
                  const { data: { publicUrl } } = supabase.storage.from("ticket-attachments").getPublicUrl(a.filePath);
                  const isImage = a.fileType?.startsWith("image/");
                  return (
                    <div key={a.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group bg-gray-50">
                      {isImage ? (
                        <button onClick={() => setLightboxIndex(idx)} className="w-full block">
                          <img src={publicUrl} alt={a.fileName} className="w-full h-20 object-cover" loading="lazy" />
                        </button>
                      ) : (
                        <div className="w-full h-20 flex items-center justify-center bg-gray-100 text-gray-400 text-[10px]">No preview</div>
                      )}
                      <div className="p-1.5 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-700 truncate">{a.fileName}</p>
                          <p className="text-[8px] text-gray-400">{(a.fileSize / 1024).toFixed(0)}KB</p>
                        </div>
                        <a href={publicUrl} download={a.fileName} className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lightbox */}
          {lightboxIndex !== null && (() => {
            const atts = (ticket as any).attachments ?? [];
            const current = atts[lightboxIndex];
            const { data: { publicUrl } } = supabase.storage.from("ticket-attachments").getPublicUrl(current.filePath);
            const prevIdx = lightboxIndex > 0 ? lightboxIndex - 1 : atts.length - 1;
            const nextIdx = lightboxIndex < atts.length - 1 ? lightboxIndex + 1 : 0;
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setLightboxIndex(null)}>
                <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"><X className="w-6 h-6" /></button>
                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prevIdx); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white z-10"><ChevronLeft className="w-8 h-8" /></button>
                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(nextIdx); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white z-10"><ChevronRight className="w-8 h-8" /></button>
                <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                  <img src={publicUrl} alt={current.fileName} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
                </div>
                <div className="absolute bottom-4 text-white/60 text-xs">{current.fileName} ({(current.fileSize / 1024).toFixed(0)}KB)</div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
