"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton, Badge, Card, EmptyState, Field, PageHeader, RowAction, fieldClass } from "./ui";
import { PlusIcon } from "./icons";
import { useToast } from "@/context/ToastContext";
import type { Winner, Tournament } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/formatDate";

type EditForm = { tournamentId: string; squadName: string; players: string; prize: string; position: string; photoUrl: string; tournamentDate: string };

export function WinnersAdminPanel({ winners, tournaments }: { winners: Winner[]; tournaments: Tournament[] }) {
  const ui = useUiText();

  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ tournamentId: "", squadName: "", players: "", prize: "", position: "1", photoUrl: "", tournamentDate: "" });
  const [form, setForm] = useState<EditForm>({ tournamentId: "", squadName: "", players: "", prize: "", position: "1", photoUrl: "", tournamentDate: "" });

  const set = (k: keyof EditForm, target: "form" | "edit") => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (target === "form") setForm(p => ({ ...p, [k]: e.target.value }));
    else setEditForm(p => ({ ...p, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tournament = tournaments.find(t => t.id === form.tournamentId);
    try {
      const res = await fetch("/api/admin/winners", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, position: Number(form.position), tournamentName: tournament?.name || "", players: form.players.split(",").map(p => p.trim()).filter(Boolean) }),
      });
      if (!res.ok) throw new Error();
      showToast(ui("Winner added!"), "success");
      setForm({ tournamentId: "", squadName: "", players: "", prize: "", position: "1", photoUrl: "", tournamentDate: "" });
      router.refresh();
    } catch { showToast(ui("Failed"), "error"); }
    finally { setLoading(false); }
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    const tournament = tournaments.find(t => t.id === editForm.tournamentId);
    try {
      const res = await fetch(`/api/admin/winners/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, position: Number(editForm.position), tournamentName: tournament?.name || "", players: editForm.players.split(",").map(p => p.trim()).filter(Boolean) }),
      });
      if (!res.ok) throw new Error();
      showToast(ui("Winner updated!"), "success");
      setEditingId(null);
      router.refresh();
    } catch { showToast(ui("Failed"), "error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/admin/winners", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  };

  const startEdit = (w: Winner) => {
    setEditingId(w.id);
    const dateStr = w.tournamentDate ? new Date(typeof (w.tournamentDate as { seconds?: number }).seconds === "number" ? (w.tournamentDate as { seconds: number }).seconds * 1000 : w.tournamentDate as unknown as number).toISOString().split("T")[0] : "";
    setEditForm({ tournamentId: w.tournamentId, squadName: w.squadName, players: w.players.join(", "), prize: w.prize, position: String(w.position), photoUrl: w.photoUrl || "", tournamentDate: dateStr });
  };

  const placeLabel = { 1: "1st place", 2: "2nd place", 3: "3rd place" } as const;
  const placeTone = { 1: "gold", 2: "neutral", 3: "warn" } as const;

  // Called as a function, not rendered as <Fields/>, so inputs keep focus while typing
  const fields = (vals: EditForm, target: "form" | "edit", required: boolean) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label={ui("Tournament")}>
        <select value={vals.tournamentId} onChange={set("tournamentId", target)} className={fieldClass}>
          <option value="">{ui("Select...")}</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Field>
      <Field label={ui(required ? "Position *" : "Position")}>
        <select required={required} value={vals.position} onChange={set("position", target)} className={fieldClass}>
          <option value="1">{ui("1st place")}</option><option value="2">{ui("2nd place")}</option><option value="3">{ui("3rd place")}</option>
        </select>
      </Field>
      <Field label={ui(required ? "Squad name *" : "Squad name")}>
        <input required={required} value={vals.squadName} onChange={set("squadName", target)} className={fieldClass} placeholder={ui(required ? "Fire Dragons" : undefined)} />
      </Field>
      <Field label={ui(required ? "Prize *" : "Prize")}>
        <input required={required} value={vals.prize} onChange={set("prize", target)} className={fieldClass} placeholder={ui(required ? "৳5,000" : undefined)} />
      </Field>
      <Field label={ui(required ? "Player IGNs (comma-separated) *" : "Player IGNs")} wide>
        <input required={required} value={vals.players} onChange={set("players", target)} className={fieldClass} placeholder={ui(required ? "Player1, Player2, Player3, Player4" : undefined)} />
      </Field>
      <Field label={ui(required ? "Tournament date" : "Date")}>
        <input type="date" value={vals.tournamentDate} onChange={set("tournamentDate", target)} className={fieldClass} />
      </Field>
      <Field label={ui(required ? "Photo URL (optional)" : "Photo URL")}>
        <input value={vals.photoUrl} onChange={set("photoUrl", target)} className={fieldClass} placeholder={ui(required ? "https://..." : undefined)} />
      </Field>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={ui("Winners")} description="Podium finishes shown in the Hall of Fame. Only completed tournaments can be picked." />

      <Card title={ui("Add winner")}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields(form, "form", true)}
          <AdminButton type="submit" loading={loading}>
            {!loading && <PlusIcon size={18} />}{ui("Add winner")}</AdminButton>
        </form>
      </Card>

      <Card title={ui(`All winners (${winners.length})`)} flush>
        {ui(winners.length === 0 ? <EmptyState title={ui("No winners yet")} /> : (
          <ul className="divide-y divide-(--ad-line)">
            {winners.map(w => (
              <li key={w.id} className="px-5 sm:px-6 py-4">
                {ui(editingId === w.id ? (
                  <div className="space-y-4">
                    {fields(editForm, "edit", false)}
                    <div className="flex gap-2">
                      <AdminButton size="sm" loading={loading} onClick={() => handleSaveEdit(w.id)}>{ui("Save")}</AdminButton>
                      <AdminButton size="sm" variant="ghost" onClick={() => setEditingId(null)}>{ui("Cancel")}</AdminButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-(--ad-text) truncate">{w.squadName}</span>
                        <Badge tone={placeTone[w.position] ?? "neutral"}>{placeLabel[w.position] ?? w.position}</Badge>
                      </div>
                      <p className="text-xs text-(--ad-dim) truncate mt-0.5">
                        {w.tournamentName} · {ui(formatShortDate(w.tournamentDate))} · <span className="font-semibold text-(--ad-gold)">{w.prize}</span>
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <RowAction tone="accent" onClick={() => startEdit(w)}>{ui("Edit")}</RowAction>
                      <RowAction tone="danger" onClick={() => handleDelete(w.id)}>{ui("Delete")}</RowAction>
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
