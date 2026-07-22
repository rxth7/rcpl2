import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Plus, Pencil, Trash2, X, ChevronRight } from "lucide-react";

export default function CategoryManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [subForm, setSubForm] = useState({ name: "", description: "" });

  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.ticketCategory.listAll.useQuery();

  const createCat = trpc.ticketCategory.create.useMutation({ onSuccess: () => { utils.ticketCategory.listAll.invalidate(); setShowCatModal(false); setCatForm({ name: "", description: "" }); } });
  const updateCat = trpc.ticketCategory.update.useMutation({ onSuccess: () => { utils.ticketCategory.listAll.invalidate(); setShowCatModal(false); setEditingCat(null); } });
  const deleteCat = trpc.ticketCategory.delete.useMutation({ onSuccess: () => { utils.ticketCategory.listAll.invalidate(); setSelectedCategory(null); } });
  const createSub = trpc.ticketCategory.createSubcategory.useMutation({ onSuccess: () => { utils.ticketCategory.listAll.invalidate(); setShowSubModal(false); setSubForm({ name: "", description: "" }); } });
  const updateSub = trpc.ticketCategory.updateSubcategory.useMutation({ onSuccess: () => utils.ticketCategory.listAll.invalidate() });
  const deleteSub = trpc.ticketCategory.deleteSubcategory.useMutation({ onSuccess: () => utils.ticketCategory.listAll.invalidate() });

  const selectedCat = categories?.find(c => c.id === selectedCategory);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <p className="text-sm text-gray-500 mt-1">Manage ticket categories and subcategories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Categories <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-2">{categories?.length || 0}</span></h3>
            <button onClick={() => { setEditingCat(null); setCatForm({ name: "", description: "" }); setShowCatModal(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700"><Plus className="w-3 h-3" /> Add</button>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></div>
            )) : categories?.map(cat => (
              <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${selectedCategory === cat.id ? "bg-red-50 border-l-[3px] border-red-600" : "hover:bg-gray-50"}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat.subcategories?.length || 0} subcategories</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setEditingCat(cat.id); setCatForm({ name: cat.name, description: cat.description || "" }); setShowCatModal(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete?")) deleteCat.mutate({ id: cat.id }); }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategories Panel */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">{selectedCat ? `Subcategories for ${selectedCat.name}` : "Subcategories"}</h3>
            {selectedCategory && (
              <button onClick={() => { setEditingSub(null); setSubForm({ name: "", description: "" }); setShowSubModal(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700"><Plus className="w-3 h-3" /> Add</button>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {!selectedCategory ? (
              <div className="p-8 text-center text-gray-400 text-sm">Select a category to view subcategories</div>
            ) : selectedCat?.subcategories?.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No subcategories. Click Add to create one.</div>
            ) : (
              selectedCat?.subcategories?.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm text-gray-800">{sub.name}</p>
                    {sub.description && <p className="text-xs text-gray-500">{sub.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingSub(sub.id); setSubForm({ name: sub.name, description: sub.description || "" }); setShowSubModal(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteSub.mutate({ id: sub.id }); }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCatModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{editingCat ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setShowCatModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (editingCat) { updateCat.mutate({ id: editingCat, name: catForm.name, description: catForm.description }); } else { createCat.mutate({ name: catForm.name, description: catForm.description }); } }} className="space-y-3">
              <input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Category name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none" />
              <textarea value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} placeholder="Description (optional)" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none resize-none" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSubModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{editingSub ? "Edit Subcategory" : "Add Subcategory"}</h3>
              <button onClick={() => setShowSubModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (editingSub) { updateSub.mutate({ id: editingSub, name: subForm.name, description: subForm.description }); setShowSubModal(false); } else { createSub.mutate({ categoryId: selectedCategory!, name: subForm.name, description: subForm.description }); setShowSubModal(false); } }} className="space-y-3">
              <input value={subForm.name} onChange={e => setSubForm({...subForm, name: e.target.value})} placeholder="Subcategory name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none" />
              <textarea value={subForm.description} onChange={e => setSubForm({...subForm, description: e.target.value})} placeholder="Description (optional)" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none resize-none" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowSubModal(false)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
