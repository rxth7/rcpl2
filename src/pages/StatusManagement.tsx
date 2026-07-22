import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Plus, Pencil, Trash2, X, Loader2, GripVertical, ToggleLeft, ToggleRight } from "lucide-react";

export default function StatusManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", color: "#3B82F6", isOpen: true, description: "" });
  const [formError, setFormError] = useState("");

  const utils = trpc.useUtils();
  const { data: statuses, isLoading } = trpc.ticketStatus.list.useQuery();

  const createStatus = trpc.ticketStatus.create.useMutation({
    onSuccess: () => { reset(); utils.ticketStatus.list.invalidate(); },
    onError: (e) => setFormError(e.message),
  });
  const updateStatus = trpc.ticketStatus.update.useMutation({
    onSuccess: () => { reset(); utils.ticketStatus.list.invalidate(); },
  });
  const deleteStatus = trpc.ticketStatus.delete.useMutation({
    onSuccess: () => utils.ticketStatus.list.invalidate(),
  });

  const reset = () => { setForm({ name: "", color: "#3B82F6", isOpen: true, description: "" }); setEditingId(null); setShowModal(false); setFormError(""); };

  const openEdit = (s: NonNullable<typeof statuses>[0]) => {
    setForm({ name: s.name, color: s.color, isOpen: s.isOpen, description: s.description || "" });
    setEditingId(s.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { setFormError("Name is required"); return; }
    if (editingId) {
      updateStatus.mutate({ id: editingId, name: form.name, color: form.color, isOpen: form.isOpen, description: form.description });
    } else {
      createStatus.mutate({ name: form.name, color: form.color, isOpen: form.isOpen, description: form.description || undefined });
    }
  };

  const presetColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#6B7280", "#7C2D12", "#DC2626"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Status Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure ticket statuses, colors, and workflow states</p>
        </div>
        <button onClick={() => { reset(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors self-start">
          <Plus className="w-4 h-4" /> Add Status
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-amber-600 text-lg mt-0.5">i</span>
        <p className="text-sm text-amber-700">Changes to status colors and names are applied immediately. Disabling a status hides it from new assignments but preserves existing tickets.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 w-8"></th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Color</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">State</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Enabled</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                statuses?.map((s, idx) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2"><GripVertical className="w-4 h-4 text-gray-300" /></td>
                    <td className="py-3 px-4 text-sm text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${s.color}20`, color: s.color }}>{s.name}</span>
                        {s.isDefault && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Default</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4"><div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: s.color }} /></td>
                    <td className="py-3 px-4"><span className={`text-xs font-medium ${s.isOpen ? "text-green-600" : "text-gray-500"}`}>{s.isOpen ? "Open" : "Closed"}</span></td>
                    <td className="py-3 px-4">
                      <button onClick={() => updateStatus.mutate({ id: s.id, isEnabled: !s.isEnabled })} className="transition-colors">
                        {s.isEnabled ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                        {!s.isDefault && (
                          <button onClick={() => { if (confirm("Delete this status?")) deleteStatus.mutate({ id: s.id }); }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={reset} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">{editingId ? "Edit Status" : "Add Status"}</h2>
              <button onClick={reset} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {presetColors.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})} className={`w-8 h-8 rounded-lg border-2 transition-colors ${form.color === c ? "border-gray-800 scale-110" : "border-transparent hover:scale-105"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isOpen" checked={form.isOpen} onChange={e => setForm({...form, isOpen: e.target.checked})} className="w-4 h-4 text-red-600 rounded" />
                <label htmlFor="isOpen" className="text-sm text-gray-700">This status represents an open/active ticket</label>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none resize-none" />
              </div>
              {/* Preview */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Preview:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${form.color}20`, color: form.color }}>{form.name || "Status"}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={reset} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createStatus.isPending || updateStatus.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                  {(createStatus.isPending || updateStatus.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
