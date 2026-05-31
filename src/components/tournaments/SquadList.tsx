"use client";

import { useRegistrations } from "@/lib/hooks/useRegistrations";
import { Spinner } from "@/components/ui/Spinner";

export function SquadList({ tournamentId, maxSlots }: { tournamentId: string; maxSlots: number }) {
  const { squads, loading } = useRegistrations(tournamentId);

  const confirmed = squads.filter((s) => !s.isWaitlisted);
  const waitlisted = squads.filter((s) => s.isWaitlisted);

  if (loading) {
    return <div className="flex justify-center py-8"><Spinner /></div>;
  }

  if (squads.length === 0) {
    return (
      <div className="text-center py-8 bg-muted rounded-2xl">
        <p className="text-3xl mb-2">👥</p>
        <p className="text-sm text-muted-foreground">No squads registered yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Confirmed slots */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Squads ({confirmed.length}/{maxSlots})
        </p>
        <div className="space-y-1.5">
          {confirmed.map((s) => (
            <div key={s.id} className="flex items-center gap-3 bg-white border border-border rounded-xl px-3 py-2.5">
              <span className="w-7 h-7 rounded-full bg-primary text-white font-display text-sm flex items-center justify-center shrink-0">
                {s.slotNumber ?? "—"}
              </span>
              <span className="font-semibold text-sm text-foreground flex-1 min-w-0 truncate">{s.squadName}</span>
              {s.approvalStatus === "approved" && (
                <span className="text-xs font-bold text-secondary shrink-0">✅</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist */}
      {waitlisted.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Waitlist ({waitlisted.length})
          </p>
          <div className="space-y-1.5">
            {waitlisted.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <span className="w-7 h-7 rounded-full bg-amber-400 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  W{i + 1}
                </span>
                <span className="font-semibold text-sm text-foreground flex-1 min-w-0 truncate">{s.squadName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
