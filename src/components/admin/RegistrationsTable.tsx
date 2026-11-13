"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import type { Tournament, Registration, ApprovalStatus } from "@/lib/types";
import { AdminButton, ApprovalBadge, Badge, Checkbox, EmptyState, fieldClass } from "./ui";
import { CheckIcon, DownloadIcon, SearchIcon, XIcon } from "./icons";

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
  const ui = useUiText();

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
      showToast(ui(approvalStatus === "approved" ? "Squad approved!" : approvalStatus === "rejected" ? "Squad rejected" : "Status updated"), "success");
      router.refresh();
    } catch {
      showToast(ui("Failed to update"), "error");
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
      showToast(ui(`${selectedIds.size} squad${selectedIds.size > 1 ? "s" : ""} approved!`), "success");
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      showToast(ui("Bulk approve failed"), "error");
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
    <div>
      {/* Filters */}
      <div className="px-5 sm:px-6 py-4 border-b border-(--ad-line) space-y-3">
        <div className="relative">
          <SearchIcon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--ad-faint) pointer-events-none" />
          <input
            type="text"
            placeholder={ui("Search by squad name, leader name, or UID...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${fieldClass} pl-10`}
            aria-label={ui("Search registrations")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={tournamentFilter} onChange={(e) => setTournamentFilter(e.target.value)} className={fieldClass} aria-label={ui("Tournament")}>
            <option value="all">{ui("All tournaments")}</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApprovalStatus | "all")}
            className={fieldClass}
            aria-label={ui("Approval status")}
          >
            <option value="all">{ui("All statuses")}</option>
            <option value="pending">{ui("Pending")}</option>
            <option value="approved">{ui("Approved")}</option>
            <option value="rejected">{ui("Rejected")}</option>
          </select>

          {hasPaidTournaments && (
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as "all" | "verified" | "pending")}
              className={fieldClass}
              aria-label={ui("Payment")}
            >
              <option value="all">{ui("All payments")}</option>
              <option value="verified">{ui("Verified")}</option>
              <option value="pending">{ui("Pending")}</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Checkbox
            checked={selectedIds.size === filtered.length && filtered.length > 0}
            onChange={toggleSelectAll}
            label={ui(<span className="text-[13px] font-semibold text-(--ad-dim)">{ui("Select all (")}{filtered.length})</span>)}
          />
          {selectedIds.size > 0 && (
            <AdminButton size="sm" variant="success" loading={bulkLoading} onClick={handleBulkApprove}>
              {!bulkLoading && <CheckIcon size={15} />}{ui("Approve selected (")}{selectedIds.size})
            </AdminButton>
          )}
          <AdminButton size="sm" variant="secondary" className="ml-auto" onClick={() => exportToCSV(tournaments, registrations, filtered)}>
            <DownloadIcon size={15} />{ui("Export CSV")}</AdminButton>
        </div>
      </div>

      {/* Results */}
      {ui(filtered.length === 0 ? (
        <EmptyState title={ui("No registrations found")} text={ui("Try adjusting your filters or search.")} />
      ) : (
        <ul className="divide-y divide-(--ad-line)">
          {filtered.map((reg) => {
            const tournament = tournamentMap.get(reg.tournamentId);
            const regAt = reg.registeredAt
              ? new Date(typeof (reg.registeredAt as { seconds?: number }).seconds === "number" ? (reg.registeredAt as { seconds: number }).seconds * 1000 : reg.registeredAt as unknown as number).toLocaleString("en-BD", { dateStyle: "short", timeStyle: "short" })
              : "";
            const busy = loading === reg.id;

            return (
              <li key={reg.id} className={`px-5 sm:px-6 py-4 ${selectedIds.has(reg.id) ? "bg-(--ad-accent-soft)/60" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className="pt-0.5">
                    <Checkbox checked={selectedIds.has(reg.id)} onChange={() => toggleSelect(reg.id)} />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] font-semibold text-(--ad-text)">{reg.squadName}</span>
                      <span className="text-xs text-(--ad-dim)">{ui("by")}{reg.leaderName}</span>
                      <ApprovalBadge status={reg.approvalStatus} />
                      {!tournament?.isFree && (
                        reg.transactionId
                          ? <Badge tone="success"><CheckIcon size={13} />{ui("Payment verified")}</Badge>
                          : <Badge tone="warn">{ui("Payment pending")}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1.2fr_1.2fr] gap-x-6 gap-y-0.5 text-xs text-(--ad-dim) mt-2">
                      <span className="truncate"><span className="font-semibold text-(--ad-text)">{ui("Tournament:")}</span> {tournament?.name || "Unknown"}</span>
                      <span><span className="font-semibold text-(--ad-text)">{ui("UID:")}</span> <span className="font-mono">{reg.leaderUid}</span></span>
                      <span><span className="font-semibold text-(--ad-text)">{ui("WhatsApp:")}</span> {reg.whatsapp}</span>
                      <span><span className="font-semibold text-(--ad-text)">{ui("Registered:")}</span> {regAt}</span>
                    </div>

                    {reg.transactionId && (
                      <p className="text-xs mt-2 inline-flex items-center gap-1.5 rounded-lg bg-(--ad-raised) px-2.5 py-1.5">
                        <span className="font-semibold text-(--ad-text)">{ui("Transaction ID:")}</span>
                        <span className="font-mono text-(--ad-text)">{reg.transactionId}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    {reg.approvalStatus !== "approved" && (
                      <AdminButton size="sm" variant="success" loading={busy} onClick={() => setApproval(reg.id, "approved")} aria-label={ui(`Approve ${reg.squadName}`)}>
                        {!busy && <CheckIcon size={15} />}
                        <span className="hidden sm:inline">{ui("Approve")}</span>
                      </AdminButton>
                    )}
                    {reg.approvalStatus !== "rejected" && (
                      <AdminButton size="sm" variant="dangerSoft" disabled={busy} onClick={() => setApproval(reg.id, "rejected")} aria-label={ui(`Reject ${reg.squadName}`)}>
                        <XIcon size={15} />
                        <span className="hidden sm:inline">{ui("Reject")}</span>
                      </AdminButton>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}
