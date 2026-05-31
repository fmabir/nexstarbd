"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { Tournament, Registration, ApprovalStatus } from "@/lib/types";

const statusConfig: Record<ApprovalStatus, { label: string; color: string; icon: string }> = {
  pending:  { label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200", icon: "⏳" },
  approved: { label: "Approved", color: "text-secondary bg-secondary-light border-secondary", icon: "✅" },
  rejected: { label: "Rejected", color: "text-primary bg-primary-light border-primary", icon: "❌" },
};

function exportToCSV(tournament: Tournament, registrations: Registration[]) {
  const headers = tournament.isFree
    ? ["Slot", "Squad Name", "Leader Name", "Leader UID", "WhatsApp", "Status", "Waitlisted", "Registered At"]
    : ["Slot", "Squad Name", "Leader Name", "Leader UID", "WhatsApp", "Transaction ID", "Payment Status", "Status", "Waitlisted", "Registered At"];

  const rows = registrations.map((r) => {
    const slotLabel = r.isWaitlisted ? `W${registrations.filter(x => x.isWaitlisted).indexOf(r) + 1}` : r.slotNumber ? `#${r.slotNumber}` : "—";
    const regAt = r.registeredAt ? new Date(typeof (r.registeredAt as { seconds?: number }).seconds === "number" ? (r.registeredAt as { seconds: number }).seconds * 1000 : r.registeredAt as unknown as number).toLocaleString() : "";
    const paymentStatus = r.transactionId ? "Verified" : "Pending";

    return tournament.isFree
      ? [slotLabel, r.squadName, r.leaderName, r.leaderUid, r.whatsapp, r.approvalStatus, r.isWaitlisted ? "Yes" : "No", regAt]
      : [slotLabel, r.squadName, r.leaderName, r.leaderUid, r.whatsapp, r.transactionId || "", paymentStatus, r.approvalStatus, r.isWaitlisted ? "Yes" : "No", regAt];
  });

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tournament.name.replace(/\s+/g, "_")}_registrations.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function RegistrationCard({
  reg, loading, onApprove, waitIndex, selected, onSelect, showCheckbox,
}: {
  reg: Registration; loading: string | null;
  onApprove: (id: string, status: ApprovalStatus) => void;
  waitIndex: number | null; selected: boolean;
  onSelect: (id: string) => void; showCheckbox: boolean;
}) {
  const cfg = statusConfig[reg.approvalStatus];
  const slotLabel = waitIndex !== null ? `W${waitIndex}` : reg.slotNumber ? `#${reg.slotNumber}` : "—";
  const registeredAt = reg.registeredAt
    ? new Date(typeof (reg.registeredAt as { seconds?: number }).seconds === "number" ? (reg.registeredAt as { seconds: number }).seconds * 1000 : reg.registeredAt as unknown as number).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className={`p-5 space-y-4 ${selected ? "bg-primary/5" : ""}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {showCheckbox && (
            <input type="checkbox" checked={selected} onChange={() => onSelect(reg.id)}
              className="w-4 h-4 accent-primary cursor-pointer" />
          )}
          <span className="font-display text-lg text-foreground">{reg.squadName}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Slot {slotLabel}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
        </div>
        {registeredAt && <span className="text-xs text-muted-foreground shrink-0">{registeredAt}</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {[
          ["Leader Name", reg.leaderName],
          ["Leader UID", reg.leaderUid],
          ["WhatsApp", reg.whatsapp],
          ["bKash", reg.bkash || "not provided"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2 border-b border-border pb-1">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className={`font-semibold text-right break-all ${label?.includes("UID") ? "font-mono" : ""}`}>{value}</span>
          </div>
        ))}
      </div>
      {reg.transactionId && (
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-sm">Transaction ID</span>
            <span className="font-mono text-sm font-semibold">{reg.transactionId}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-secondary rounded-full" />
            <span className="text-xs text-secondary font-semibold">✓ Payment Verified</span>
          </div>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {reg.approvalStatus !== "approved" && (
          <button disabled={loading === reg.id} onClick={() => onApprove(reg.id, "approved")}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary text-white hover:bg-secondary/80 disabled:opacity-50 transition-colors">
            {loading === reg.id ? "…" : "✓ Approve"}
          </button>
        )}
        {reg.approvalStatus !== "rejected" && (
          <button disabled={loading === reg.id} onClick={() => onApprove(reg.id, "rejected")}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-50 transition-colors">
            {loading === reg.id ? "…" : "✗ Reject"}
          </button>
        )}
        {reg.approvalStatus !== "pending" && (
          <button disabled={loading === reg.id} onClick={() => onApprove(reg.id, "pending")}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors">
            {loading === reg.id ? "…" : "↺ Reset"}
          </button>
        )}
      </div>
    </div>
  );
}

export function ManageTournamentPanel({ tournament, registrations }: { tournament: Tournament; registrations: Registration[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [roomId, setRoomId] = useState(tournament.roomId || "");
  const [roomPassword, setRoomPassword] = useState(tournament.roomPassword || "");
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: tournament.name,
    description: tournament.description || "",
    prizePool: tournament.prizePool,
    maxSlots: String(tournament.maxSlots),
    firstPrize: tournament.firstPrize || "",
    secondPrize: tournament.secondPrize || "",
    bkashNumber: tournament.bkashNumber || "",
  });

  const patch = async (body: Record<string, unknown>, key: string) => {
    setLoading(key);
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      showToast("Updated!", "success");
      router.refresh();
    } catch { showToast("Update failed", "error"); }
    finally { setLoading(null); }
  };

  const setApproval = async (regId: string, approvalStatus: ApprovalStatus) => {
    setLoading(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus }),
      });
      if (!res.ok) throw new Error();
      showToast(approvalStatus === "approved" ? "Squad approved!" : approvalStatus === "rejected" ? "Squad rejected" : "Status updated", "success");
      router.refresh();
    } catch { showToast("Failed to update", "error"); }
    finally { setLoading(null); }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selectedIds].map(id =>
        fetch(`/api/admin/registrations/${id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approvalStatus: "approved" }),
        })
      ));
      showToast(`${selectedIds.size} squad${selectedIds.size > 1 ? "s" : ""} approved!`, "success");
      setSelectedIds(new Set());
      router.refresh();
    } catch { showToast("Bulk approve failed", "error"); }
    finally { setBulkLoading(false); }
  };

  const handleDelete = async () => {
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Tournament deleted", "success");
      router.push("/admin/tournaments");
    } catch { showToast("Delete failed", "error"); setLoading(null); }
  };

  const handleSaveDetails = async () => {
    await patch({
      name: editForm.name,
      description: editForm.description,
      prizePool: editForm.prizePool,
      maxSlots: Number(editForm.maxSlots),
      firstPrize: editForm.firstPrize || null,
      secondPrize: editForm.secondPrize || null,
      bkashNumber: editForm.bkashNumber || null,
    }, "details");
    setShowEditDetails(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const pendingRegs = registrations.filter(r => r.approvalStatus === "pending");
  const confirmed = registrations.filter(r => !r.isWaitlisted);
  const waitlisted = registrations.filter(r => r.isWaitlisted);
  const approved = registrations.filter(r => r.approvalStatus === "approved").length;
  const inputClass = "w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 flex-1">
          <Button href="/admin/tournaments" variant="ghost" size="sm" className="shrink-0 mt-1">← Back</Button>
          <h1 className="font-display text-xl sm:text-3xl text-foreground tracking-wide leading-tight">{tournament.name}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => exportToCSV(tournament, registrations)}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            ⬇ Export CSV
          </button>
          <button onClick={() => setShowEditDetails(v => !v)}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors">
            ✏ Edit Details
          </button>
          <button onClick={() => setShowDeleteConfirm(true)}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-primary-light hover:bg-primary/20 text-primary transition-colors">
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Edit Details panel */}
      {showEditDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-blue-800">Edit Tournament Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-blue-700">Tournament Name</label>
              <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-blue-700">Description</label>
              <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-blue-700">Prize Pool</label>
              <input value={editForm.prizePool} onChange={e => setEditForm(p => ({ ...p, prizePool: e.target.value }))} className={inputClass} placeholder="৳5,000" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-blue-700">Max Slots</label>
              <input type="number" value={editForm.maxSlots} onChange={e => setEditForm(p => ({ ...p, maxSlots: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-blue-700">1st Prize</label>
              <input value={editForm.firstPrize} onChange={e => setEditForm(p => ({ ...p, firstPrize: e.target.value }))} className={inputClass} placeholder="৳3,000" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-blue-700">2nd Prize</label>
              <input value={editForm.secondPrize} onChange={e => setEditForm(p => ({ ...p, secondPrize: e.target.value }))} className={inputClass} placeholder="৳1,500" />
            </div>
            {!tournament.isFree && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-blue-700">bKash Send Money Number</label>
                <input type="tel" value={editForm.bkashNumber} onChange={e => setEditForm(p => ({ ...p, bkashNumber: e.target.value }))} className={inputClass} placeholder="+880 1XXX-XXXXXX" />
                <p className="text-xs text-blue-600 mt-1">Players will send payments to this number during registration.</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" loading={loading === "details"} onClick={handleSaveDetails}>Save Changes</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowEditDetails(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="bg-primary-light border border-primary rounded-2xl p-5">
          <p className="font-semibold text-primary mb-1">Delete this tournament?</p>
          <p className="text-sm text-muted-foreground mb-4">This cannot be undone. All registration data will remain in the database.</p>
          <div className="flex gap-2">
            <Button size="sm" loading={loading === "delete"} onClick={handleDelete}
              className="bg-primary hover:bg-primary-dark text-white">Yes, Delete</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Registered", value: `${tournament.registeredCount}/${tournament.maxSlots}`, color: "text-foreground" },
          { label: "Approved", value: approved, color: "text-secondary" },
          { label: "Waitlisted", value: tournament.waitlistCount, color: "text-amber-600" },
          { label: "Pending", value: registrations.filter(r => r.approvalStatus === "pending").length, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-4 text-center">
            <div className={`font-display text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Registration</h3>
          <p className="font-bold text-lg mb-3">
            {tournament.isRegistrationOpen ? <span className="text-secondary">Open ✓</span> : <span className="text-primary">Closed</span>}
          </p>
          <Button size="sm" variant={tournament.isRegistrationOpen ? "outline" : "secondary"}
            loading={loading === "reg"}
            onClick={() => patch({ isRegistrationOpen: !tournament.isRegistrationOpen }, "reg")}>
            {tournament.isRegistrationOpen ? "Close Registration" : "Open Registration"}
          </Button>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Status</h3>
          <p className="font-bold text-lg mb-3 capitalize">{tournament.status}</p>
          <select className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            value={tournament.status} onChange={(e) => patch({ status: e.target.value }, "status")}>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing (LIVE)</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Room Info</h3>
          <div className="space-y-2 mb-3">
            <input value={roomId} onChange={(e) => setRoomId(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Room ID" />
            <input value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Room Password" />
          </div>
          <Button size="sm" loading={loading === "room"}
            onClick={() => patch({ roomId: roomId || null, roomPassword: roomPassword || null }, "room")}>
            Save Room Info
          </Button>
        </div>
      </div>

      {/* Bulk approve bar */}
      {pendingRegs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <input type="checkbox"
              checked={selectedIds.size === pendingRegs.length && pendingRegs.length > 0}
              onChange={() => {
                if (selectedIds.size === pendingRegs.length) setSelectedIds(new Set());
                else setSelectedIds(new Set(pendingRegs.map(r => r.id)));
              }}
              className="w-4 h-4 accent-primary cursor-pointer" />
            <span className="text-sm font-medium text-amber-800">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${pendingRegs.length} pending approval`}
            </span>
          </div>
          {selectedIds.size > 0 && (
            <Button size="sm" loading={bulkLoading} onClick={handleBulkApprove}
              className="bg-secondary hover:bg-secondary-dark text-white">
              ✓ Approve Selected ({selectedIds.size})
            </Button>
          )}
        </div>
      )}

      {/* Registrations */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Squad Applications ({confirmed.length})</h2>
          <span className="text-xs text-muted-foreground">{approved} approved</span>
        </div>
        {confirmed.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No registrations yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {confirmed.map((reg) => (
              <RegistrationCard key={reg.id} reg={reg} loading={loading}
                onApprove={setApproval} waitIndex={null}
                selected={selectedIds.has(reg.id)} onSelect={toggleSelect}
                showCheckbox={reg.approvalStatus === "pending"} />
            ))}
          </div>
        )}
      </div>

      {/* Waitlist */}
      {waitlisted.length > 0 && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Waiting List ({waitlisted.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {waitlisted.map((reg, i) => (
              <RegistrationCard key={reg.id} reg={reg} loading={loading}
                onApprove={setApproval} waitIndex={i + 1}
                selected={selectedIds.has(reg.id)} onSelect={toggleSelect}
                showCheckbox={reg.approvalStatus === "pending"} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
