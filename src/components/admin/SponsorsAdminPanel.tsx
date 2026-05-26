"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { Sponsor } from "@/lib/types";

export function SponsorsAdminPanel({ sponsors }: { sponsors: Sponsor[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", logoUrl: "", websiteUrl: "", slotType: "banner", displayOrder: "0" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast("Sponsor added!", "success");
      setForm({ name: "", logoUrl: "", websiteUrl: "", slotType: "banner", displayOrder: "0" });
      router.refresh();
    } catch {
      showToast("Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/admin/sponsors", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wide">Sponsors & Partners</h1>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Add Sponsor</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Sponsor Name *</label>
            <input required value={form.name} onChange={set("name")} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="Gaming Brand" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Logo URL *</label>
            <input required value={form.logoUrl} onChange={set("logoUrl")} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Website URL (optional)</label>
            <input value={form.websiteUrl} onChange={set("websiteUrl")} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Slot Type</label>
            <select value={form.slotType} onChange={set("slotType")} className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="hero">Hero Banner</option>
              <option value="banner">Standard Banner</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Display Order</label>
            <input type="number" value={form.displayOrder} onChange={set("displayOrder")} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="0" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={loading}>Add Sponsor</Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border"><h2 className="font-semibold">All Sponsors ({sponsors.length})</h2></div>
        {sponsors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No sponsors yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {sponsors.map((s) => (
              <div key={s.id} className="px-6 py-4 flex items-center gap-4">
                <div className="relative w-16 h-10 bg-muted rounded-lg overflow-hidden shrink-0">
                  <Image src={s.logoUrl} alt={s.name} fill className="object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.slotType} · order {s.displayOrder} · {s.isActive ? "Active" : "Inactive"}</p>
                </div>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-primary hover:underline shrink-0">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
