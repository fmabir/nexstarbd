"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { Tournament, Registration } from "@/lib/types";
import { formatTournamentDate } from "@/lib/utils/formatDate";

export function ManageTournamentPanel({
  tournament,
  registrations,
}: {
  tournament: Tournament;
  registrations: Registration[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [roomId, setRoomId] = useState(tournament.roomId || "");
  const [roomPassword, setRoomPassword] = useState(tournament.roomPassword || "");

  const patch = async (body: Record<string, unknown>, key: string) => {
    setLoading(key);
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      showToast("Updated!", "success");
      router.refresh();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setLoading(null);
    }
  };

  const confirmed = registrations.filter((r) => !r.isWaitlisted);
  const waitlisted = registrations.filter((r) => r.isWaitlisted);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button href="/admin/tournaments" variant="ghost" size="sm">← Back</Button>
        <h1 className="font-display text-3xl text-foreground tracking-wide">{tournament.name}</h1>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
            Registration
          </h3>
          <p className="font-bold text-lg mb-3">
            {tournament.isRegistrationOpen ? (
              <span className="text-secondary">Open ✓</span>
            ) : (
              <span className="text-primary">Closed</span>
            )}
          </p>
          <Button
            size="sm"
            variant={tournament.isRegistrationOpen ? "outline" : "secondary"}
            loading={loading === "reg"}
            onClick={() => patch({ isRegistrationOpen: !tournament.isRegistrationOpen }, "reg")}
          >
            {tournament.isRegistrationOpen ? "Close Registration" : "Open Registration"}
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
            Status
          </h3>
          <p className="font-bold text-lg mb-3 capitalize">{tournament.status}</p>
          <select
            className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-2"
            value={tournament.status}
            onChange={(e) => patch({ status: e.target.value }, "status")}
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing (LIVE)</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
            Slots
          </h3>
          <p className="font-bold text-lg">{tournament.registeredCount}/{tournament.maxSlots}</p>
          <p className="text-sm text-muted-foreground">{tournament.waitlistCount} waitlisted</p>
        </div>
      </div>

      {/* Room Info */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Room Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Room ID</label>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              placeholder="e.g. 123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Room Password</label>
            <input
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              placeholder="e.g. ff2024"
            />
          </div>
        </div>
        <Button
          size="sm"
          loading={loading === "room"}
          onClick={() => patch({ roomId: roomId || null, roomPassword: roomPassword || null }, "room")}
        >
          Set Room Info
        </Button>
      </div>

      {/* Registrations */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Confirmed Squads ({confirmed.length})</h2>
        </div>
        {confirmed.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No confirmed squads yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {confirmed.map((reg) => (
              <div key={reg.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-secondary text-white text-xs font-bold flex items-center justify-center">
                        {reg.slotNumber}
                      </span>
                      <span className="font-semibold">{reg.squadName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {reg.players.map((p) => (
                        <span key={p.uid} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {p.ign} ({p.uid})
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">📱 {reg.contactNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {waitlisted.length > 0 && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Waitlisted Squads ({waitlisted.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {waitlisted.map((reg, i) => (
              <div key={reg.id} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center">
                    W{i + 1}
                  </span>
                  <span className="font-semibold">{reg.squadName}</span>
                </div>
                <p className="text-xs text-muted-foreground">📱 {reg.contactNumber}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
