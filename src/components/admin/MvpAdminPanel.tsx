"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { MvpPlayer, Tournament } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/formatDate";

type EditForm = { tournamentId: string; playerName: string; uid: string; kills: string; damage: string; achievement: string; photoUrl: string; tournamentDate: string };

export function MvpAdminPanel({ mvpPlayers, tournaments }: { mvpPlayers: MvpPlayer[]; tournaments: Tournament[] }) {
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
      showToast("MVP added!", "success");
      setForm({ tournamentId: "", playerName: "", uid: "", kills: "", damage: "", achievement: "Most Kills", photoUrl: "", tournamentDate: "" });
      router.refresh();
    } catch { showToast("Failed", "error"); } finally { setLoading(false); }
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    const tournament = tournaments.find(t => t.id === editForm.tournamentId);
    try {
      const res = await fetch(`/api/admin/mvp/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editForm, tournamentName: tournament?.name || "" }) });
      if (!res.ok) throw new Error();
      showToast("MVP updated!", "success"); setEditingId(null); router.refresh();
    } catch { showToast("Failed", "error"); } finally { setLoading(false); }
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

  const inputClass = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary";

  const FormFields = ({ vals, target }: { vals: EditForm; target: "form" | "edit" }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div><label className="block text-sm font-semibold mb-1">Player IGN *</label><input required value={vals.playerName} onChange={set("playerName", target)} className={inputClass} placeholder="Player IGN" /></div>
      <div><label className="block text-sm font-semibold mb-1">Free Fire UID *</label><input required value={vals.uid} onChange={set("uid", target)} className={inputClass} placeholder="123456789" /></div>
      <div><label className="block text-sm font-semibold mb-1">Kills *</label><input required type="number" min="0" value={vals.kills} onChange={set("kills", target)} className={inputClass} placeholder="15" /></div>
      <div><label className="block text-sm font-semibold mb-1">Damage</label><input type="number" min="0" value={vals.damage} onChange={set("damage", target)} className={inputClass} placeholder="3500" /></div>
      <div><label className="block text-sm font-semibold mb-1">Achievement</label>
        <select value={vals.achievement} onChange={set("achievement", target)} className={inputClass}>
          <option>Most Kills</option><option>Booyah MVP</option><option>Highest Damage</option><option>Best Support</option>
        </select></div>
      <div><label className="block text-sm font-semibold mb-1">Tournament</label>
        <select value={vals.tournamentId} onChange={set("tournamentId", target)} className={inputClass}><option value="">Select...</option>{tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      <div><label className="block text-sm font-semibold mb-1">Date</label><input type="date" value={vals.tournamentDate} onChange={set("tournamentDate", target)} className={inputClass} /></div>
      <div><label className="block text-sm font-semibold mb-1">Photo URL</label><input value={vals.photoUrl} onChange={set("photoUrl", target)} className={inputClass} placeholder="https://..." /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wide">MVP Players</h1>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Add MVP Player</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields vals={form} target="form" />
          <Button type="submit" loading={loading}>Add MVP</Button>
        </form>
      </div>
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border"><h2 className="font-semibold">All MVPs ({mvpPlayers.length})</h2></div>
        {mvpPlayers.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">No MVP players yet.</div> : (
          <div className="divide-y divide-border">
            {mvpPlayers.map(m => (
              <div key={m.id} className="px-4 sm:px-6 py-4">
                {editingId === m.id ? (
                  <div className="space-y-3">
                    <FormFields vals={editForm} target="edit" />
                    <div className="flex gap-2">
                      <Button size="sm" loading={loading} onClick={() => handleSaveEdit(m.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{m.playerName} <span className="text-muted-foreground font-normal text-sm">({m.uid})</span></p>
                      <p className="text-xs text-muted-foreground truncate">{m.kills} kills · {m.achievement} · {m.tournamentName} · {formatShortDate(m.tournamentDate)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(m)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(m.id)} className="text-xs text-primary hover:underline font-medium">Delete</button>
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
