"use client";

import { useUiText } from "@/components/i18n/ui-text";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton, Badge, Card, Checkbox, EmptyState, Field, PageHeader, RowAction, fieldClass } from "./ui";
import { PlusIcon } from "./icons";
import { useToast } from "@/context/ToastContext";
import type { Sponsor } from "@/lib/types";

type EditForm = { name: string; logoUrl: string; websiteUrl: string; slotType: string; displayOrder: string; isActive: boolean };

export function SponsorsAdminPanel({ sponsors }: { sponsors: Sponsor[] }) {
  const ui = useUiText();

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
      showToast(ui("Sponsor added!"), "success");
      setForm({ name: "", logoUrl: "", websiteUrl: "", slotType: "banner", displayOrder: "0" });
      router.refresh();
    } catch { showToast(ui("Failed"), "error"); } finally { setLoading(false); }
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sponsors/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (!res.ok) throw new Error();
      showToast(ui("Sponsor updated!"), "success"); setEditingId(null); router.refresh();
    } catch { showToast(ui("Failed"), "error"); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/admin/sponsors", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  };

  const startEdit = (s: Sponsor) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, logoUrl: s.logoUrl, websiteUrl: s.websiteUrl || "", slotType: s.slotType, displayOrder: String(s.displayOrder), isActive: s.isActive });
  };

  const slotName: Record<string, string> = { hero: "Hero banner", banner: "Standard banner", sidebar: "Sidebar" };

  return (
    <div className="space-y-6">
      <PageHeader title={ui("Sponsors & partners")} description="Logos shown on the public site, in display order." />
      <Card title={ui("Add sponsor")}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={ui("Name *")}><input required value={form.name} onChange={set("name")} className={fieldClass} placeholder={ui("Gaming Brand")} /></Field>
            <Field label={ui("Logo URL *")}><input required value={form.logoUrl} onChange={set("logoUrl")} className={fieldClass} placeholder={ui("https://...")} /></Field>
            <Field label={ui("Website URL")}><input value={form.websiteUrl} onChange={set("websiteUrl")} className={fieldClass} placeholder={ui("https://...")} /></Field>
            <Field label={ui("Slot type")}>
              <select value={form.slotType} onChange={set("slotType")} className={fieldClass}><option value="hero">{ui("Hero Banner")}</option><option value="banner">{ui("Standard Banner")}</option><option value="sidebar">{ui("Sidebar")}</option></select>
            </Field>
            <Field label={ui("Display order")}><input type="number" value={form.displayOrder} onChange={set("displayOrder")} className={fieldClass} /></Field>
          </div>
          <AdminButton type="submit" loading={loading}>
            {!loading && <PlusIcon size={18} />}{ui("Add sponsor")}</AdminButton>
        </form>
      </Card>

      <Card title={ui(`All sponsors (${sponsors.length})`)} flush>
        {ui(sponsors.length === 0 ? <EmptyState title={ui("No sponsors yet")} /> : (
          <ul className="divide-y divide-(--ad-line)">
            {sponsors.map(s => (
              <li key={s.id} className="px-5 sm:px-6 py-4">
                {ui(editingId === s.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label={ui("Name")}><input value={editForm.name} onChange={setEdit("name")} className={fieldClass} /></Field>
                      <Field label={ui("Logo URL")}><input value={editForm.logoUrl} onChange={setEdit("logoUrl")} className={fieldClass} /></Field>
                      <Field label={ui("Website URL")}><input value={editForm.websiteUrl} onChange={setEdit("websiteUrl")} className={fieldClass} /></Field>
                      <Field label={ui("Slot type")}>
                        <select value={editForm.slotType} onChange={setEdit("slotType")} className={fieldClass}><option value="hero">{ui("Hero")}</option><option value="banner">{ui("Banner")}</option><option value="sidebar">{ui("Sidebar")}</option></select>
                      </Field>
                      <Field label={ui("Display order")}><input type="number" value={editForm.displayOrder} onChange={setEdit("displayOrder")} className={fieldClass} /></Field>
                      <div className="flex items-end pb-3">
                        <Checkbox checked={editForm.isActive} onChange={(v) => setEditForm(p => ({ ...p, isActive: v }))} label={ui("Active")} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <AdminButton size="sm" loading={loading} onClick={() => handleSaveEdit(s.id)}>{ui("Save")}</AdminButton>
                      <AdminButton size="sm" variant="ghost" onClick={() => setEditingId(null)}>{ui("Cancel")}</AdminButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-12 bg-(--ad-raised) border border-(--ad-line) rounded-xl overflow-hidden shrink-0">
                      <Image src={s.logoUrl} alt={ui(s.name)} fill className="object-contain p-1.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-(--ad-text) truncate">{s.name}</span>
                        {ui(s.isActive ? <Badge tone="success" dot>{ui("Active")}</Badge> : <Badge>{ui("Inactive")}</Badge>)}
                      </div>
                      <p className="text-xs text-(--ad-dim) mt-0.5">{slotName[s.slotType] ?? s.slotType}{ui("· order")}{s.displayOrder}</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <RowAction tone="accent" onClick={() => startEdit(s)}>{ui("Edit")}</RowAction>
                      <RowAction tone="danger" onClick={() => handleDelete(s.id)}>{ui("Delete")}</RowAction>
                    </div>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        ))}
      </Card>
    </div>
  );
}
