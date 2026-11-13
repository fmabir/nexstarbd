"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton, Badge, Card, EmptyState, Field, PageHeader, RowAction, fieldClass } from "./ui";
import { PlusIcon } from "./icons";
import { useToast } from "@/context/ToastContext";
import type { MvpPlayer, Tournament } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/formatDate";

type EditForm = { tournamentId: string; playerName: string; uid: string; kills: string; damage: string; achievement: string; photoUrl: string; tournamentDate: string };

export function MvpAdminPanel({ mvpPlayers, tournaments }: { mvpPlayers: MvpPlayer[]; tournaments: Tournament[] }) {
  const ui = useUiText();

  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ tournamentId: "", playerName: "", uid: "", kills: "", damage: "", achievement: "Most Kills", photoUrl: "", tournamentDate: "" });
  const [form, setForm] = useState<EditForm>({ tournamentId: "", playerName: "", uid: "", kills: "", damage: "", achievement: "Most Kills", photoUrl: "", tournamentDate: "" });

  const set = (k: keyof EditForm, target: "form" | "edit") => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (target === "form") setForm(p => ({ ...p, [k]: e.target.value }));
    else setEditForm(p => ({ ...p, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const tournament = tournaments.find(t => t.id === form.tournamentId);
    try {
      const res = await fetch("/api/admin/mvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, tournamentName: tournament?.name || "" }) });
      if (!res.ok) throw new Error();
      showToast(ui("MVP added!"), "success");
      setForm({ tournamentId: "", playerName: "", uid: "", kills: "", damage: "", achievement: "Most Kills", photoUrl: "", tournamentDate: "" });
      router.refresh();
    } catch { showToast(ui("Failed"), "error"); } finally { setLoading(false); }
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    const tournament = tournaments.find(t => t.id === editForm.tournamentId);
    try {
      const res = await fetch(`/api/admin/mvp/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editForm, tournamentName: tournament?.name || "" }) });
      if (!res.ok) throw new Error();
      showToast(ui("MVP updated!"), "success"); setEditingId(null); router.refresh();
    } catch { showToast(ui("Failed"), "error"); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/admin/mvp", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  };

  const startEdit = (m: MvpPlayer) => {
    setEditingId(m.id);
    const dateStr = m.tournamentDate ? new Date(typeof (m.tournamentDate as { seconds?: number }).seconds === "number" ? (m.tournamentDate as { seconds: number }).seconds * 1000 : m.tournamentDate as unknown as number).toISOString().split("T")[0] : "";
    setEditForm({ tournamentId: m.tournamentId, playerName: m.playerName, uid: m.uid, kills: String(m.kills), damage: m.damage ? String(m.damage) : "", achievement: m.achievement, photoUrl: m.photoUrl || "", tournamentDate: dateStr });
  };

  // Called as a function, not rendered as <FormFields/>: a component defined
  // inside this one would remount on every keystroke and drop input focus
  const formFields = (vals: EditForm, target: "form" | "edit") => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label={ui("Player IGN *")}><input required value={vals.playerName} onChange={set("playerName", target)} className={fieldClass} placeholder={ui("Player IGN")} /></Field>
      <Field label={ui("Free Fire UID *")}><input required value={vals.uid} onChange={set("uid", target)} className={fieldClass} placeholder="123456789" /></Field>
      <Field label={ui("Kills *")}><input required type="number" min="0" value={vals.kills} onChange={set("kills", target)} className={fieldClass} placeholder="15" /></Field>
      <Field label={ui("Damage")}><input type="number" min="0" value={vals.damage} onChange={set("damage", target)} className={fieldClass} placeholder="3500" /></Field>
      <Field label={ui("Achievement")}>
        <select value={vals.achievement} onChange={set("achievement", target)} className={fieldClass}>
          <option value="Most Kills">{ui("Most Kills")}</option><option value="Booyah MVP">{ui("Booyah MVP")}</option><option value="Highest Damage">{ui("Highest Damage")}</option><option value="Best Support">{ui("Best Support")}</option>
        </select>
      </Field>
      <Field label={ui("Tournament")}>
        <select value={vals.tournamentId} onChange={set("tournamentId", target)} className={fieldClass}><option value="">{ui("Select...")}</option>{tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      </Field>
      <Field label={ui("Date")}><input type="date" value={vals.tournamentDate} onChange={set("tournamentDate", target)} className={fieldClass} /></Field>
      <Field label={ui("Photo URL")}><input value={vals.photoUrl} onChange={set("photoUrl", target)} className={fieldClass} placeholder={ui("https://...")} /></Field>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={ui("MVP players")} description="Standout players and their stats from each tournament." />
      <Card title={ui("Add MVP player")}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {formFields(form, "form")}
          <AdminButton type="submit" loading={loading}>
            {!loading && <PlusIcon size={18} />}{ui("Add MVP")}</AdminButton>
        </form>
      </Card>
      <Card title={ui(`All MVPs (${mvpPlayers.length})`)} flush>
        {ui(mvpPlayers.length === 0 ? <EmptyState title={ui("No MVP players yet")} /> : (
          <ul className="divide-y divide-(--ad-line)">
            {mvpPlayers.map(m => (
              <li key={m.id} className="px-5 sm:px-6 py-4">
                {ui(editingId === m.id ? (
                  <div className="space-y-4">
                    {formFields(editForm, "edit")}
                    <div className="flex gap-2">
                      <AdminButton size="sm" loading={loading} onClick={() => handleSaveEdit(m.id)}>{ui("Save")}</AdminButton>
                      <AdminButton size="sm" variant="ghost" onClick={() => setEditingId(null)}>{ui("Cancel")}</AdminButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-(--ad-text) truncate">{m.playerName}</span>
                        <span className="text-xs font-mono text-(--ad-faint)">{m.uid}</span>
                        <Badge tone="gold">{ui(m.achievement)}</Badge>
                      </div>
                      <p className="text-xs text-(--ad-dim) truncate mt-0.5">
                        <span className="font-semibold text-(--ad-text)">{m.kills}{ui("kills")}</span>
                        {ui(m.damage ? ` · ${m.damage} damage` : "")} · {m.tournamentName} · {ui(formatShortDate(m.tournamentDate))}
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <RowAction tone="accent" onClick={() => startEdit(m)}>{ui("Edit")}</RowAction>
                      <RowAction tone="danger" onClick={() => handleDelete(m.id)}>{ui("Delete")}</RowAction>
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
