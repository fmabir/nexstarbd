"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { timeAgo } from "@/lib/utils/formatDate";
import type { Announcement, Tournament } from "@/lib/types";
import { AdminButton, Badge, Checkbox, EmptyState, RowAction, Segmented, fieldClass, textareaClass } from "./ui";
import { PinIcon } from "./icons";

type AnnouncementType = "info" | "warning" | "roomInfo" | "result";
const types: { value: AnnouncementType; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "roomInfo", label: "Room Info" },
  { value: "result", label: "Result" },
];

export function AnnouncementList({ announcements, tournaments }: { announcements: Announcement[]; tournaments: Tournament[] }) {
  const ui = useUiText();

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
      showToast(ui("Announcement updated!"), "success");
      setEditingId(null);
      router.refresh();
    } catch { showToast(ui("Update failed"), "error"); }
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
    } catch { showToast(ui("Delete failed"), "error"); }
    finally { setDeleting(null); }
  };

  if (announcements.length === 0) {
    return <EmptyState title={ui("No announcements yet")} />;
  }

  return (
    <ul className="divide-y divide-(--ad-line)">
      {announcements.map((a) => (
        <li key={a.id} className="px-5 sm:px-6 py-4">
          {ui(editingId === a.id ? (
            <div className="space-y-3">
              <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                className={fieldClass} placeholder={ui("Title (optional)")} aria-label={ui("Title")} />
              <textarea value={editForm.body} onChange={e => setEditForm(p => ({ ...p, body: e.target.value }))}
                rows={2} className={`${textareaClass} resize-none`} placeholder={ui("Message *")} required aria-label={ui("Message")} />
              <div className="flex flex-wrap gap-3 items-center">
                <Segmented value={editForm.type} options={types} onChange={(v) => setEditForm(p => ({ ...p, type: v }))} />
                <select value={editForm.tournamentId} onChange={e => setEditForm(p => ({ ...p, tournamentId: e.target.value }))}
                  className={`${fieldClass} h-10 w-auto`} aria-label={ui("Tournament")}>
                  <option value="">{ui("Site-wide")}</option>
                  {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <Checkbox checked={editForm.isPinned} onChange={(v) => setEditForm(p => ({ ...p, isPinned: v }))} label={ui("Pin to top")} />
              </div>
              <div className="flex gap-2">
                <AdminButton size="sm" loading={saving} onClick={() => handleSave(a.id)}>{ui("Save")}</AdminButton>
                <AdminButton size="sm" variant="ghost" onClick={() => setEditingId(null)}>{ui("Cancel")}</AdminButton>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge tone={a.type === "warning" ? "warn" : a.type === "result" ? "gold" : a.type === "roomInfo" ? "info" : "neutral"}>
                    {types.find((t) => t.value === a.type)?.label ?? a.type}
                  </Badge>
                  {a.isPinned && <Badge tone="accent"><PinIcon size={12} />{ui("Pinned")}</Badge>}
                  {a.tournamentId && (
                    <span className="text-xs text-(--ad-dim)">{tournaments.find((t) => t.id === a.tournamentId)?.name ?? "Tournament"}</span>
                  )}
                  <span className="text-xs text-(--ad-faint)">{timeAgo(a.createdAt)}</span>
                </div>
                {a.title && <p className="text-sm font-semibold text-(--ad-text)">{ui(a.title)}</p>}
                <p className="text-sm text-(--ad-dim) line-clamp-2">{a.body}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <RowAction tone="accent" onClick={() => startEdit(a)}>{ui("Edit")}</RowAction>
                <RowAction tone="danger" onClick={() => handleDelete(a.id)} disabled={deleting === a.id}>
                  {ui(deleting === a.id ? "…" : "Delete")}
                </RowAction>
              </div>
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
}
