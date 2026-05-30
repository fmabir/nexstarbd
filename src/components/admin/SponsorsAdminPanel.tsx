"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { Sponsor } from "@/lib/types";

type EditForm = { name: string; logoUrl: string; websiteUrl: string; slotType: string; displayOrder: string; isActive: boolean };

export function SponsorsAdminPanel({ sponsors }: { sponsors: Sponsor[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", logoUrl: "", websiteUrl: "", slotType: "banner", displayOrder: "0", isActive: true });
  const [form, setForm] = useState({ name: "", logoUrl: "", websiteUrl: "", slotType: "banner", displayOrder: "0" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setEdit = (k: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setEditForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/admin/sponsors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      showToast("Sponsor added!", "success");
      setForm({ name: "", logoUrl: "", websiteUrl: "", slotType: "banner", displayOrder: "0" });
      router.refresh();
    } catch { showToast("Failed", "error"); } finally { setLoading(false); }
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sponsors/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (!res.ok) throw new Error();
      showToast("Sponsor updated!", "success"); setEditingId(null); router.refresh();
    } catch { showToast("Failed", "error"); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/admin/sponsors", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  };

  const startEdit = (s: Sponsor) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, logoUrl: s.logoUrl, websiteUrl: s.websiteUrl || "", slotType: s.slotType, displayOrder: String(s.displayOrder), isActive: s.isActive });
  };

  const inputClass = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wide">Sponsors & Partners</h1>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Add Sponsor</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold mb-1">Name *</label><input required value={form.name} onChange={set("name")} className={inputClass} placeholder="Gaming Brand" /></div>
          <div><label className="block text-sm font-semibold mb-1">Logo URL *</label><input required value={form.logoUrl} onChange={set("logoUrl")} className={inputClass} placeholder="https://..." /></div>
          <div><label className="block text-sm font-semibold mb-1">Website URL</label><input value={form.websiteUrl} onChange={set("websiteUrl")} className={inputClass} placeholder="https://..." /></div>
          <div><label className="block text-sm font-semibold mb-1">Slot Type</label>
            <select value={form.slotType} onChange={set("slotType")} className={inputClass}><option value="hero">Hero Banner</option><option value="banner">Standard Banner</option><option value="sidebar">Sidebar</option></select></div>
          <div><label className="block text-sm font-semibold mb-1">Display Order</label><input type="number" value={form.displayOrder} onChange={set("displayOrder")} className={inputClass} /></div>
          <div className="sm:col-span-2"><Button type="submit" loading={loading}>Add Sponsor</Button></div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border"><h2 className="font-semibold">All Sponsors ({sponsors.length})</h2></div>
        {sponsors.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">No sponsors yet.</div> : (
          <div className="divide-y divide-border">
            {sponsors.map(s => (
              <div key={s.id} className="px-6 py-4">
                {editingId === s.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className="block text-xs font-semibold mb-1">Name</label><input value={editForm.name} onChange={setEdit("name")} className={inputClass} /></div>
                      <div><label className="block text-xs font-semibold mb-1">Logo URL</label><input value={editForm.logoUrl} onChange={setEdit("logoUrl")} className={inputClass} /></div>
                      <div><label className="block text-xs font-semibold mb-1">Website URL</label><input value={editForm.websiteUrl} onChange={setEdit("websiteUrl")} className={inputClass} /></div>
                      <div><label className="block text-xs font-semibold mb-1">Slot Type</label>
                        <select value={editForm.slotType} onChange={setEdit("slotType")} className={inputClass}><option value="hero">Hero</option><option value="banner">Banner</option><option value="sidebar">Sidebar</option></select></div>
                      <div><label className="block text-xs font-semibold mb-1">Display Order</label><input type="number" value={editForm.displayOrder} onChange={setEdit("displayOrder")} className={inputClass} /></div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" />
                          Active
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" loading={loading} onClick={() => handleSaveEdit(s.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-10 bg-muted rounded-lg overflow-hidden shrink-0">
                      <Image src={s.logoUrl} alt={s.name} fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{s.name} {!s.isActive && <span className="text-xs text-muted-foreground">(inactive)</span>}</p>
                      <p className="text-sm text-muted-foreground">{s.slotType} · order {s.displayOrder}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(s)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-xs text-primary hover:underline font-medium">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
