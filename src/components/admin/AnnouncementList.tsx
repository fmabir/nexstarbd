"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { timeAgo } from "@/lib/utils/formatDate";
import type { Announcement, Tournament } from "@/lib/types";
import { Button } from "@/components/ui/Button";

type AnnouncementType = "info" | "warning" | "roomInfo" | "result";
const types: { value: AnnouncementType; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "roomInfo", label: "Room Info" },
  { value: "result", label: "Result" },
];

export function AnnouncementList({ announcements, tournaments }: { announcements: Announcement[]; tournaments: Tournament[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; body: string; type: AnnouncementType; tournamentId: string; isPinned: boolean }>({
    title: "", body: "", type: "info", tournamentId: "", isPinned: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const startEdit = (a: Announcement) => {
    setEditingId(a.id);
    setEditForm({
      title: a.title || "",
      body: a.body,
      type: a.type as AnnouncementType,
      tournamentId: a.tournamentId || "",
      isPinned: a.isPinned,
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, tournamentId: editForm.tournamentId || null }),
      });
      if (!res.ok) throw new Error();
      showToast("Announcement updated!", "success");
      setEditingId(null);
      router.refresh();
    } catch { showToast("Update failed", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } catch { showToast("Delete failed", "error"); }
    finally { setDeleting(null); }
  };

  if (announcements.length === 0) {
    return <div className="text-center py-8 text-muted-foreground text-sm">No announcements yet.</div>;
  }

  return (
    <div className="divide-y divide-border">
      {announcements.map((a) => (
        <div key={a.id} className="px-6 py-4">
          {editingId === a.id ? (
            <div className="space-y-3">
              <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Title (optional)" />
              <textarea value={editForm.body} onChange={e => setEditForm(p => ({ ...p, body: e.target.value }))}
                rows={2} className="w-full border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="Message *" required />
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex gap-1.5">
                  {types.map(t => (
                    <button key={t.value} type="button" onClick={() => setEditForm(p => ({ ...p, type: t.value }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border-2 transition-colors ${editForm.type === t.value ? "border-primary bg-primary text-white" : "border-border text-muted-foreground"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <select value={editForm.tournamentId} onChange={e => setEditForm(p => ({ ...p, tournamentId: e.target.value }))}
                  className="border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary">
                  <option value="">Site-wide</option>
                  {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={editForm.isPinned} onChange={e => setEditForm(p => ({ ...p, isPinned: e.target.checked }))} className="rounded" />
                  Pin to top
                </label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" loading={saving} onClick={() => handleSave(a.id)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">{a.type}</span>
                  {a.isPinned && <span className="text-xs">📌</span>}
                  <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                </div>
                {a.title && <p className="font-semibold text-sm">{a.title}</p>}
                <p className="text-sm text-muted-foreground line-clamp-2">{a.body}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(a)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id}
                  className="text-xs text-primary hover:underline font-medium disabled:opacity-50">
                  {deleting === a.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
