"use client";

import type { Registration } from "@/lib/types";

const statusConfig = {
  approved: { label: "Approved", classes: "bg-secondary/10 text-secondary border-secondary/30" },
  pending:  { label: "Pending Approval", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  rejected: { label: "Rejected", classes: "bg-red-50 text-red-700 border-red-200" },
};

export function MySquadCard({ registration: reg }: { registration: Registration }) {
  const badge = statusConfig[reg.approvalStatus];

  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-xl text-foreground tracking-wide leading-tight">{reg.squadName}</p>
          <span className={`inline-block mt-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badge.classes}`}>
            {badge.label}
          </span>
        </div>
        {reg.slotNumber && !reg.isWaitlisted ? (
          <span className="shrink-0 text-xs font-bold bg-secondary text-white px-2.5 py-1.5 rounded-full">
            Slot #{reg.slotNumber}
          </span>
        ) : reg.isWaitlisted ? (
          <span className="shrink-0 text-xs font-bold bg-amber-400 text-white px-2.5 py-1.5 rounded-full">
            Waitlisted
          </span>
        ) : null}
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Leader</span>
          <span className="font-semibold text-foreground text-right">{reg.leaderName}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Leader UID</span>
          <span className="font-mono text-foreground text-right break-all">{reg.leaderUid}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">WhatsApp</span>
          <span className="text-foreground text-right">{reg.whatsapp}</span>
        </div>
        {reg.bkash && (
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground shrink-0">bKash</span>
            <span className="text-foreground text-right">{reg.bkash}</span>
          </div>
        )}
      </div>
    </div>
  );
}
