"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import type { Tournament, Registration, ApprovalStatus } from "@/lib/types";

const statusConfig: Record<ApprovalStatus, { label: string; color: string; icon: string }> = {
  pending:  { label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200", icon: "⏳" },
  approved: { label: "Approved", color: "text-secondary bg-secondary-light border-secondary", icon: "✅" },
  rejected: { label: "Rejected", color: "text-primary bg-primary-light border-primary", icon: "❌" },
};

function exportToCSV(tournaments: Tournament[], registrations: Registration[], filtered: Registration[]) {
  const tournamentMap = new Map(tournaments.map((t) => [t.id, t]));
  const headers = ["Squad Name", "Leader Name", "Tournament", "Status", "Payment Status", "Registered At"];

  const rows = filtered.map((r) => {
    const t = tournamentMap.get(r.tournamentId);
    const paymentStatus = t?.isFree ? "N/A" : r.transactionId ? "Verified" : "Pending";
    const regAt = r.registeredAt ? new Date(typeof (r.registeredAt as { seconds?: number }).seconds === "number" ? (r.registeredAt as { seconds: number }).seconds * 1000 : r.registeredAt as unknown as number).toLocaleString() : "";
    return [r.squadName, r.leaderName, t?.name || "Unknown", r.approvalStatus, paymentStatus, regAt];
  });

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `registrations_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function RegistrationsTable({ tournaments, registrations }: { tournaments: Tournament[]; registrations: Registration[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "all">("all");
  const [tournamentFilter, setTournamentFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "verified" | "pending">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const tournamentMap = useMemo(() => new Map(tournaments.map((t) => [t.id, t])), [tournaments]);

  const filtered = useMemo(() => {
    let result = registrations;

    // Tournament filter
    if (tournamentFilter !== "all") {
      result = result.filter((r) => r.tournamentId === tournamentFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.approvalStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      const t = tournamentMap.get(result[0]?.tournamentId || "");
      result = result.filter((r) => {
        const tournament = tournamentMap.get(r.tournamentId);
        if (tournament?.isFree) return paymentFilter === "pending";
        return paymentFilter === "verified" ? !!r.transactionId : !r.transactionId;
      });
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.squadName.toLowerCase().includes(q) ||
        r.leaderName.toLowerCase().includes(q) ||
        r.leaderUid.toLowerCase().includes(q)
      );
    }

    return result;
  }, [registrations, tournamentFilter, statusFilter, paymentFilter, search, tournamentMap]);

  const setApproval = async (regId: string, approvalStatus: ApprovalStatus) => {
    setLoading(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus }),
      });
      if (!res.ok) throw new Error();
      showToast(approvalStatus === "approved" ? "Squad approved!" : approvalStatus === "rejected" ? "Squad rejected" : "Status updated", "success");
      router.refresh();
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          fetch(`/api/admin/registrations/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approvalStatus: "approved" }),
          })
        )
      );
      showToast(`${selectedIds.size} squad${selectedIds.size > 1 ? "s" : ""} approved!`, "success");
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      showToast("Bulk approve failed", "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const n = new Set(selectedIds);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelectedIds(n);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const hasPaidTournaments = filtered.some((r) => {
    const t = tournamentMap.get(r.tournamentId);
    return !t?.isFree;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="px-6 py-4 border-b border-border space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by squad name, leader name, or UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-64 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Tournaments</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApprovalStatus | "all")}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {hasPaidTournaments && (
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as "all" | "verified" | "pending")}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="all">All Payments</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
              <button
                disabled={bulkLoading}
                onClick={handleBulkApprove}
                className="px-3 py-1.5 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/80 disabled:opacity-50 transition-colors"
              >
                {bulkLoading ? "…" : "✓ Approve Selected"}
              </button>
            </>
          )}
          <button
            onClick={() => exportToCSV(tournaments, registrations, filtered)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors ml-auto"
          >
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="px-6 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No registrations found</p>
            <p className="text-sm">Try adjusting your filters or search</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
              <input
                type="checkbox"
                checked={selectedIds.size === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="text-xs font-semibold">Select All ({filtered.length})</span>
            </div>

            {filtered.map((reg) => {
              const tournament = tournamentMap.get(reg.tournamentId);
              const cfg = statusConfig[reg.approvalStatus];
              const paymentStatus = tournament?.isFree ? "N/A" : reg.transactionId ? "✓ Verified" : "⚠ Pending";
              const regAt = reg.registeredAt
                ? new Date(typeof (reg.registeredAt as { seconds?: number }).seconds === "number" ? (reg.registeredAt as { seconds: number }).seconds * 1000 : reg.registeredAt as unknown as number).toLocaleString("en-BD", { dateStyle: "short", timeStyle: "short" })
                : "";

              return (
                <div key={reg.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3 flex-wrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(reg.id)}
                      onChange={() => toggleSelect(reg.id)}
                      className="w-4 h-4 accent-primary cursor-pointer mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-foreground">{reg.squadName}</span>
                        <span className="text-xs text-muted-foreground">by {reg.leaderName}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        {!tournament?.isFree && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reg.transactionId ? "bg-secondary/10 text-secondary border border-secondary" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                            {paymentStatus}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs mb-2">
                        <div className="text-muted-foreground">
                          <span className="font-semibold">Tournament:</span> {tournament?.name || "Unknown"}
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-semibold">UID:</span> <span className="font-mono">{reg.leaderUid}</span>
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-semibold">WhatsApp:</span> {reg.whatsapp}
                        </div>
                        <div className="text-muted-foreground text-right sm:text-left">
                          <span className="font-semibold">Registered:</span> {regAt}
                        </div>
                      </div>

                      {reg.transactionId && (
                        <div className="text-xs mb-2 p-2 bg-secondary/5 rounded border border-secondary/20">
                          <span className="font-semibold">Transaction ID:</span> {reg.transactionId}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {reg.approvalStatus !== "approved" && (
                        <button
                          disabled={loading === reg.id}
                          onClick={() => setApproval(reg.id, "approved")}
                          className="text-xs font-bold px-2 py-1 rounded bg-secondary text-white hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                        >
                          {loading === reg.id ? "…" : "✓"}
                        </button>
                      )}
                      {reg.approvalStatus !== "rejected" && (
                        <button
                          disabled={loading === reg.id}
                          onClick={() => setApproval(reg.id, "rejected")}
                          className="text-xs font-bold px-2 py-1 rounded bg-primary text-white hover:bg-primary/80 disabled:opacity-50 transition-colors"
                        >
                          {loading === reg.id ? "…" : "✗"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
