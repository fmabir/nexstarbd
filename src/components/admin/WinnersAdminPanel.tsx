"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { Winner, Tournament } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/formatDate";

type EditForm = { tournamentId: string; squadName: string; players: string; prize: string; position: string; photoUrl: string; tournamentDate: string };

export function WinnersAdminPanel({ winners, tournaments }: { winners: Winner[]; tournaments: Tournament[] }) {
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
      showToast("Winner added!", "success");
      setForm({ tournamentId: "", squadName: "", players: "", prize: "", position: "1", photoUrl: "", tournamentDate: "" });
      router.refresh();
    } catch { showToast("Failed", "error"); }
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
      showToast("Winner updated!", "success");
      setEditingId(null);
      router.refresh();
    } catch { showToast("Failed", "error"); }
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

  const inputClass = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wide">Hall of Fame — Winners</h1>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Add Winner</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold mb-1">Tournament</label>
            <select value={form.tournamentId} onChange={set("tournamentId", "form")} className={inputClass}><option value="">Select...</option>{tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div><label className="block text-sm font-semibold mb-1">Position *</label>
            <select required value={form.position} onChange={set("position", "form")} className={inputClass}><option value="1">🥇 1st</option><option value="2">🥈 2nd</option><option value="3">🥉 3rd</option></select></div>
          <div><label className="block text-sm font-semibold mb-1">Squad Name *</label>
            <input required value={form.squadName} onChange={set("squadName", "form")} className={inputClass} placeholder="Fire Dragons" /></div>
          <div><label className="block text-sm font-semibold mb-1">Prize *</label>
            <input required value={form.prize} onChange={set("prize", "form")} className={inputClass} placeholder="৳5,000" /></div>
          <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Player IGNs (comma-separated) *</label>
            <input required value={form.players} onChange={set("players", "form")} className={inputClass} placeholder="Player1, Player2, Player3, Player4" /></div>
          <div><label className="block text-sm font-semibold mb-1">Tournament Date</label>
            <input type="date" value={form.tournamentDate} onChange={set("tournamentDate", "form")} className={inputClass} /></div>
          <div><label className="block text-sm font-semibold mb-1">Photo URL (optional)</label>
            <input value={form.photoUrl} onChange={set("photoUrl", "form")} className={inputClass} placeholder="https://..." /></div>
          <div className="sm:col-span-2"><Button type="submit" loading={loading}>Add Winner</Button></div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border"><h2 className="font-semibold">All Winners ({winners.length})</h2></div>
        {winners.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">No winners yet.</div> : (
          <div className="divide-y divide-border">
            {winners.map(w => (
              <div key={w.id} className="px-4 sm:px-6 py-4">
                {editingId === w.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className="block text-xs font-semibold mb-1">Tournament</label>
                        <select value={editForm.tournamentId} onChange={set("tournamentId", "edit")} className={inputClass}><option value="">Select...</option>{tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                      <div><label className="block text-xs font-semibold mb-1">Position</label>
                        <select value={editForm.position} onChange={set("position", "edit")} className={inputClass}><option value="1">🥇 1st</option><option value="2">🥈 2nd</option><option value="3">🥉 3rd</option></select></div>
                      <div><label className="block text-xs font-semibold mb-1">Squad Name</label>
                        <input value={editForm.squadName} onChange={set("squadName", "edit")} className={inputClass} /></div>
                      <div><label className="block text-xs font-semibold mb-1">Prize</label>
                        <input value={editForm.prize} onChange={set("prize", "edit")} className={inputClass} /></div>
                      <div className="sm:col-span-2"><label className="block text-xs font-semibold mb-1">Player IGNs</label>
                        <input value={editForm.players} onChange={set("players", "edit")} className={inputClass} /></div>
                      <div><label className="block text-xs font-semibold mb-1">Date</label>
                        <input type="date" value={editForm.tournamentDate} onChange={set("tournamentDate", "edit")} className={inputClass} /></div>
                      <div><label className="block text-xs font-semibold mb-1">Photo URL</label>
                        <input value={editForm.photoUrl} onChange={set("photoUrl", "edit")} className={inputClass} /></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" loading={loading} onClick={() => handleSaveEdit(w.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{w.squadName} <span className="text-muted-foreground font-normal">— {w.position === 1 ? "🥇" : w.position === 2 ? "🥈" : "🥉"}</span></p>
                      <p className="text-xs text-muted-foreground truncate">{w.tournamentName} · {formatShortDate(w.tournamentDate)} · {w.prize}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(w)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(w.id)} className="text-xs text-primary hover:underline font-medium">Delete</button>
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
