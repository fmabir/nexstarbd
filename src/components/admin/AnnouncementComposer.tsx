"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton, Checkbox, Field, Segmented, fieldClass, textareaClass } from "./ui";
import { useToast } from "@/context/ToastContext";
import type { Tournament } from "@/lib/types";

type AnnouncementType = "info" | "warning" | "roomInfo" | "result";

export function AnnouncementComposer({ tournaments }: { tournaments: Tournament[] }) {
  const ui = useUiText();

  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "info" as AnnouncementType,
    tournamentId: "",
    isPinned: false,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tournamentId: form.tournamentId || null,
        }),
      });
      if (!res.ok) throw new Error();
      showToast(ui("Announcement posted!"), "success");
      setForm({ title: "", body: "", type: "info", tournamentId: "", isPinned: false });
      router.refresh();
    } catch {
      showToast(ui("Failed to post announcement"), "error");
    } finally {
      setLoading(false);
    }
  };

  const types: { value: AnnouncementType; label: string }[] = [
    { value: "info", label: "Info" },
    { value: "warning", label: "Warning" },
    { value: "roomInfo", label: "Room Info" },
    { value: "result", label: "Result" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={ui("Title (optional)")}>
        <input value={form.title} onChange={set("title")} className={fieldClass} placeholder={ui("Announcement title...")} />
      </Field>

      <Field label={ui("Message *")}>
        <textarea
          required
          value={form.body}
          onChange={set("body")}
          rows={3}
          className={`${textareaClass} resize-none`}
          placeholder={ui("Write your announcement...")}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="block text-[13px] font-semibold text-(--ad-text) mb-1.5">{ui("Type")}</span>
          <Segmented value={form.type} options={types} onChange={(v) => setForm((prev) => ({ ...prev, type: v }))} />
        </div>

        <Field label={ui("Tournament (optional)")}>
          <select value={form.tournamentId} onChange={set("tournamentId")} className={fieldClass}>
            <option value="">{ui("Site-wide")}</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Checkbox
          checked={form.isPinned}
          onChange={(v) => setForm((prev) => ({ ...prev, isPinned: v }))}
          label={ui(<span className="font-semibold">{ui("Pin to top")}</span>)}
        />
        <AdminButton type="submit" loading={loading}>{ui("Post announcement")}</AdminButton>
      </div>
    </form>
  );
}
