"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { Tournament } from "@/lib/types";

type AnnouncementType = "info" | "warning" | "roomInfo" | "result";

export function AnnouncementComposer({ tournaments }: { tournaments: Tournament[] }) {
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
      showToast("Announcement posted!", "success");
      setForm({ title: "", body: "", type: "info", tournamentId: "", isPinned: false });
      router.refresh();
    } catch {
      showToast("Failed to post announcement", "error");
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
      <div>
        <label className="block text-sm font-semibold mb-1">Title (optional)</label>
        <input
          value={form.title}
          onChange={set("title")}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          placeholder="Announcement title..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Message *</label>
        <textarea
          required
          value={form.body}
          onChange={set("body")}
          rows={3}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
          placeholder="Write your announcement..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Type</label>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: t.value }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors ${
                  form.type === t.value
                    ? "border-primary bg-primary text-white"
                    : "border-border text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Tournament (optional)</label>
          <select
            value={form.tournamentId}
            onChange={set("tournamentId")}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">Site-wide</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-semibold">Pin to top</span>
          </label>
        </div>
      </div>

      <Button type="submit" loading={loading}>
        Post Announcement
      </Button>
    </form>
  );
}
