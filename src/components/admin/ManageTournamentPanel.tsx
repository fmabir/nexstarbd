"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminButton,
  ApprovalBadge,
  Badge,
  Card,
  Checkbox,
  DetailRow,
  EmptyState,
  Field,
  PageHeader,
  RowAction,
  Segmented,
  Stat,
  TournamentStatusBadge,
  fieldClass,
  textareaClass,
} from "./ui";
import { CheckIcon, ClockIcon, DownloadIcon, EditIcon, KeyIcon, PinIcon, ResetIcon, TrashIcon, XIcon } from "./icons";
import { useToast } from "@/context/ToastContext";
import type { Tournament, Registration, ApprovalStatus, Announcement, AnnouncementType } from "@/lib/types";
import { formatTournamentDate, timeAgo, toDate } from "@/lib/utils/formatDate";

function tsToDatetimeLocal(ts: unknown): string {
  try {
    const date = toDate(ts as Parameters<typeof toDate>[0]);
    // Format in local browser time — matches how new Date(val) interprets datetime-local values
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch { return ""; }
}

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
  const ui = useUiText();

  const slotLabel = waitIndex !== null ? `W${waitIndex}` : reg.slotNumber ? `#${reg.slotNumber}` : "—";
  const registeredAt = reg.registeredAt
    ? new Date(typeof (reg.registeredAt as { seconds?: number }).seconds === "number" ? (reg.registeredAt as { seconds: number }).seconds * 1000 : reg.registeredAt as unknown as number).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })
    : null;
  const busy = loading === reg.id;

  return (
    <div className={`px-5 sm:px-6 py-4 ${selected ? "bg-(--ad-accent-soft)/60" : ""}`}>
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <span className="pt-0.5">
            <Checkbox checked={selected} onChange={() => onSelect(reg.id)} />
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-semibold text-(--ad-text)">{reg.squadName}</span>
            <Badge>{ui("Slot")}{slotLabel}</Badge>
            <ApprovalBadge status={reg.approvalStatus} />
            {registeredAt && <span className="text-xs text-(--ad-faint) ml-auto">{registeredAt}</span>}
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-2">
            <DetailRow label={ui("Leader")} value={reg.leaderName} />
            <DetailRow label={ui("Leader UID")} value={reg.leaderUid} mono />
            <DetailRow label={ui("WhatsApp")} value={reg.whatsapp} />
            <DetailRow label={ui("bKash")} value={reg.bkash || "not provided"} />
            {reg.transactionId && (
              <>
                <DetailRow label={ui("Transaction ID")} value={reg.transactionId} mono />
                <div className="flex items-center py-1">
                  <Badge tone="success">
                    <CheckIcon size={13} />{ui("Payment verified")}</Badge>
                </div>
              </>
            )}
          </dl>

          <div className="flex gap-2 flex-wrap mt-3">
            {reg.approvalStatus !== "approved" && (
              <AdminButton size="sm" variant="success" loading={busy} onClick={() => onApprove(reg.id, "approved")}>
                {!busy && <CheckIcon size={15} />}{ui("Approve")}</AdminButton>
            )}
            {reg.approvalStatus !== "rejected" && (
              <AdminButton size="sm" variant="dangerSoft" disabled={busy} onClick={() => onApprove(reg.id, "rejected")}>
                <XIcon size={15} />{ui("Reject")}</AdminButton>
            )}
            {reg.approvalStatus !== "pending" && (
              <AdminButton size="sm" variant="ghost" disabled={busy} onClick={() => onApprove(reg.id, "pending")}>
                <ResetIcon size={15} />{ui("Reset to pending")}</AdminButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManageTournamentPanel({ tournament, registrations, announcements }: { tournament: Tournament; registrations: Registration[]; announcements: Announcement[] }) {
  const ui = useUiText();

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
    startsAt: tsToDatetimeLocal(tournament.startsAt),
    registrationDeadline: tsToDatetimeLocal(tournament.registrationDeadline),
  });
  const [scheduleForm, setScheduleForm] = useState({
    startsAt: tsToDatetimeLocal(tournament.startsAt),
    deadline: tsToDatetimeLocal(tournament.registrationDeadline),
  });

  const patch = async (body: Record<string, unknown>, key: string) => {
    setLoading(key);
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      showToast(ui("Updated!"), "success");
      router.refresh();
    } catch { showToast(ui("Update failed"), "error"); }
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
      showToast(ui(approvalStatus === "approved" ? "Squad approved!" : approvalStatus === "rejected" ? "Squad rejected" : "Status updated"), "success");
      router.refresh();
    } catch { showToast(ui("Failed to update"), "error"); }
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
      showToast(ui(`${selectedIds.size} squad${selectedIds.size > 1 ? "s" : ""} approved!`), "success");
      setSelectedIds(new Set());
      router.refresh();
    } catch { showToast(ui("Bulk approve failed"), "error"); }
    finally { setBulkLoading(false); }
  };

  const handleDelete = async () => {
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast(ui("Tournament deleted"), "success");
      router.push("/admin/tournaments");
    } catch { showToast(ui("Delete failed"), "error"); setLoading(null); }
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
      ...(editForm.startsAt ? { startsAt: new Date(editForm.startsAt).toISOString() } : {}),
      ...(editForm.registrationDeadline ? { registrationDeadline: new Date(editForm.registrationDeadline).toISOString() } : {}),
    }, "details");
    setShowEditDetails(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const [annForm, setAnnForm] = useState({ title: "", body: "", type: "info" as AnnouncementType, isPinned: false });
  const [annLoading, setAnnLoading] = useState(false);
  const [deletingAnn, setDeletingAnn] = useState<string | null>(null);

  const handlePostAnnouncement = async () => {
    if (!annForm.body.trim()) return;
    setAnnLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...annForm, tournamentId: tournament.id }),
      });
      if (!res.ok) throw new Error();
      showToast(ui("Announcement posted!"), "success");
      setAnnForm({ title: "", body: "", type: "info", isPinned: false });
      router.refresh();
    } catch { showToast(ui("Failed to post"), "error"); }
    finally { setAnnLoading(false); }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setDeletingAnn(id);
    try {
      await fetch("/api/admin/announcements", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      showToast(ui("Deleted"), "success");
      router.refresh();
    } catch { showToast(ui("Delete failed"), "error"); }
    finally { setDeletingAnn(null); }
  };

  const pendingRegs = registrations.filter(r => r.approvalStatus === "pending");
  const confirmed = registrations.filter(r => !r.isWaitlisted);
  const waitlisted = registrations.filter(r => r.isWaitlisted);
  const approved = registrations.filter(r => r.approvalStatus === "approved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/admin/tournaments", label: "All tournaments" }}
        title={ui(tournament.name)}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <TournamentStatusBadge status={tournament.status} />
            <span>{ui(formatTournamentDate(tournament.startsAt))}</span>
            <span>· {tournament.mode}</span>
            <span>· {ui(tournament.isFree ? "Free entry" : `Entry ${tournament.registrationFee ?? ""}`)}</span>
          </span>
        }
        actions={
          <>
            <AdminButton size="sm" variant="secondary" onClick={() => exportToCSV(tournament, registrations)}>
              <DownloadIcon size={15} />{ui("Export CSV")}</AdminButton>
            <AdminButton size="sm" variant="secondary" onClick={() => setShowEditDetails(v => !v)}>
              <EditIcon size={15} />{ui("Edit details")}</AdminButton>
            <AdminButton size="sm" variant="dangerSoft" onClick={() => setShowDeleteConfirm(true)}>
              <TrashIcon size={15} />{ui("Delete")}</AdminButton>
          </>
        }
      />

      {/* Edit details */}
      {showEditDetails && (
        <Card title={ui("Edit tournament details")} className="border-(--ad-accent)/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={ui("Tournament name")} wide>
              <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className={fieldClass} />
            </Field>
            <Field label={ui("Description")} wide>
              <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                rows={2} className={`${textareaClass} resize-none`} />
            </Field>
            <Field label={ui("Prize pool")}>
              <input value={editForm.prizePool} onChange={e => setEditForm(p => ({ ...p, prizePool: e.target.value }))} className={fieldClass} placeholder="৳5,000" />
            </Field>
            <Field label={ui("Max slots")}>
              <input type="number" value={editForm.maxSlots} onChange={e => setEditForm(p => ({ ...p, maxSlots: e.target.value }))} className={fieldClass} />
            </Field>
            <Field label={ui("1st prize")}>
              <input value={editForm.firstPrize} onChange={e => setEditForm(p => ({ ...p, firstPrize: e.target.value }))} className={fieldClass} placeholder="৳3,000" />
            </Field>
            <Field label={ui("2nd prize")}>
              <input value={editForm.secondPrize} onChange={e => setEditForm(p => ({ ...p, secondPrize: e.target.value }))} className={fieldClass} placeholder="৳1,500" />
            </Field>
            {!tournament.isFree && (
              <Field label={ui("bKash Send Money number")} hint={ui("Players will send payments to this number during registration.")} wide>
                <input type="tel" value={editForm.bkashNumber} onChange={e => setEditForm(p => ({ ...p, bkashNumber: e.target.value }))} className={fieldClass} placeholder={ui("+880 1XXX-XXXXXX")} />
              </Field>
            )}
            <Field label={ui("Start date & time (BD time)")}>
              <input type="datetime-local" value={editForm.startsAt} onChange={e => setEditForm(p => ({ ...p, startsAt: e.target.value }))} className={fieldClass} />
            </Field>
            <Field label={ui("Registration deadline (BD time)")}>
              <input type="datetime-local" value={editForm.registrationDeadline} onChange={e => setEditForm(p => ({ ...p, registrationDeadline: e.target.value }))} className={fieldClass} />
            </Field>
          </div>
          <div className="flex gap-2 mt-5">
            <AdminButton loading={loading === "details"} onClick={handleSaveDetails}>{ui("Save changes")}</AdminButton>
            <AdminButton variant="ghost" onClick={() => setShowEditDetails(false)}>{ui("Cancel")}</AdminButton>
          </div>
        </Card>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="rounded-2xl bg-(--ad-danger-soft) border border-(--ad-danger)/30 px-5 py-4">
          <p className="text-sm font-semibold text-(--ad-danger)">{ui("Delete this tournament?")}</p>
          <p className="text-[13px] text-(--ad-dim) mt-0.5 mb-4">{ui("This cannot be undone. All registration data will remain in the database.")}</p>
          <div className="flex gap-2">
            <AdminButton size="sm" variant="danger" loading={loading === "delete"} onClick={handleDelete}>{ui("Yes, delete")}</AdminButton>
            <AdminButton size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>{ui("Cancel")}</AdminButton>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label={ui("Registered")} value={`${tournament.registeredCount}/${tournament.maxSlots}`} />
        <Stat label={ui("Approved")} value={approved} tone="success" />
        <Stat label={ui("Waitlisted")} value={tournament.waitlistCount} tone={tournament.waitlistCount > 0 ? "warn" : "neutral"} />
        <Stat label={ui("Pending")} value={pendingRegs.length} tone={pendingRegs.length > 0 ? "warn" : "neutral"} />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title={ui("Registration")}>
          <div className="flex items-center justify-between gap-2 mb-1">
            {ui(tournament.isRegistrationOpen ? <Badge tone="success" dot>{ui("Open")}</Badge> : <Badge tone="danger" dot>{ui("Closed")}</Badge>)}
          </div>
          <p className="text-xs text-(--ad-dim) mb-4">{ui("Deadline:")}<span className="font-semibold text-(--ad-text)">{ui(formatTournamentDate(tournament.registrationDeadline))}</span>
          </p>
          <AdminButton size="sm" variant={tournament.isRegistrationOpen ? "secondary" : "primary"}
            loading={loading === "reg"}
            onClick={() => patch({ isRegistrationOpen: !tournament.isRegistrationOpen }, "reg")}>
            {ui(tournament.isRegistrationOpen ? "Close registration" : "Open registration")}
          </AdminButton>
        </Card>

        <Card title={ui("Status")}>
          <div className="mb-3"><TournamentStatusBadge status={tournament.status} /></div>
          <select className={fieldClass} aria-label={ui("Tournament status")}
            value={tournament.status} onChange={(e) => patch({ status: e.target.value }, "status")}>
            <option value="upcoming">{ui("Upcoming")}</option>
            <option value="ongoing">{ui("Ongoing (LIVE)")}</option>
            <option value="completed">{ui("Completed")}</option>
            <option value="cancelled">{ui("Cancelled")}</option>
          </select>
          <p className="text-xs text-(--ad-faint) mt-2">{ui("Changes save as soon as you pick.")}</p>
        </Card>

        <Card title={ui(<span className="inline-flex items-center gap-2"><KeyIcon size={16} />{ui("Room info")}</span>)}>
          <div className="space-y-2 mb-3">
            <input value={roomId} onChange={(e) => setRoomId(e.target.value)} className={fieldClass} placeholder={ui("Room ID")} aria-label={ui("Room ID")} />
            <input value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} className={fieldClass} placeholder={ui("Room password")} aria-label={ui("Room password")} />
          </div>
          <AdminButton size="sm" loading={loading === "room"}
            onClick={() => patch({ roomId: roomId || null, roomPassword: roomPassword || null }, "room")}>{ui("Save room info")}</AdminButton>
        </Card>
      </div>

      {/* Schedule */}
      <Card title={ui(<span className="inline-flex items-center gap-2"><ClockIcon size={16} />{ui("Schedule")}</span>)} description="Times are in your browser's local time.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={ui("Match start time")} hint={ui(`Saved: ${formatTournamentDate(tournament.startsAt)}`)}>
            <input type="datetime-local" value={scheduleForm.startsAt}
              onChange={(e) => setScheduleForm(p => ({ ...p, startsAt: e.target.value }))} className={fieldClass} />
          </Field>
          <Field label={ui("Registration deadline")} hint={ui(`Saved: ${formatTournamentDate(tournament.registrationDeadline)}`)}>
            <input type="datetime-local" value={scheduleForm.deadline}
              onChange={(e) => setScheduleForm(p => ({ ...p, deadline: e.target.value }))} className={fieldClass} />
          </Field>
        </div>
        <AdminButton
          size="sm"
          className="mt-4"
          loading={loading === "schedule"}
          onClick={() => patch({
            ...(scheduleForm.startsAt ? { startsAt: new Date(scheduleForm.startsAt).toISOString() } : {}),
            ...(scheduleForm.deadline ? { registrationDeadline: new Date(scheduleForm.deadline).toISOString() } : {}),
          }, "schedule")}
        >{ui("Save schedule")}</AdminButton>
      </Card>

      {/* Bulk approve bar */}
      {pendingRegs.length > 0 && (
        <div className="sticky top-28 lg:top-3 z-20 rounded-2xl bg-(--ad-warn-soft) border border-(--ad-warn)/25 px-5 py-3 flex items-center justify-between flex-wrap gap-3 shadow-sm">
          <Checkbox
            checked={selectedIds.size === pendingRegs.length && pendingRegs.length > 0}
            onChange={() => {
              if (selectedIds.size === pendingRegs.length) setSelectedIds(new Set());
              else setSelectedIds(new Set(pendingRegs.map(r => r.id)));
            }}
            label={
              ui(<span className="font-semibold text-(--ad-warn)">
                {ui(selectedIds.size > 0 ? `${selectedIds.size} selected` : `${pendingRegs.length} pending approval — select all`)}
              </span>)
            }
          />
          {selectedIds.size > 0 && (
            <AdminButton size="sm" variant="success" loading={bulkLoading} onClick={handleBulkApprove}>
              {!bulkLoading && <CheckIcon size={15} />}{ui("Approve selected (")}{selectedIds.size})
            </AdminButton>
          )}
        </div>
      )}

      {/* Registrations */}
      <Card title={ui(`Squad applications (${confirmed.length})`)} description={`${approved} approved`} flush>
        {ui(confirmed.length === 0 ? (
          <EmptyState title={ui("No registrations yet")} />
        ) : (
          <div className="divide-y divide-(--ad-line)">
            {confirmed.map((reg) => (
              <RegistrationCard key={reg.id} reg={reg} loading={loading}
                onApprove={setApproval} waitIndex={null}
                selected={selectedIds.has(reg.id)} onSelect={toggleSelect}
                showCheckbox={reg.approvalStatus === "pending"} />
            ))}
          </div>
        ))}
      </Card>

      {/* Waitlist */}
      {waitlisted.length > 0 && (
        <Card title={ui(`Waiting list (${waitlisted.length})`)} flush>
          <div className="divide-y divide-(--ad-line)">
            {waitlisted.map((reg, i) => (
              <RegistrationCard key={reg.id} reg={reg} loading={loading}
                onApprove={setApproval} waitIndex={i + 1}
                selected={selectedIds.has(reg.id)} onSelect={toggleSelect}
                showCheckbox={reg.approvalStatus === "pending"} />
            ))}
          </div>
        </Card>
      )}

      {/* Announcements */}
      <Card title={ui("Announcements to registered players")} description="Visible only to squads registered for this tournament" flush>
        <div className="px-5 sm:px-6 py-5 border-b border-(--ad-line) space-y-3">
          <input
            value={annForm.title}
            onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))}
            className={fieldClass}
            placeholder={ui("Title (optional)")}
            aria-label={ui("Announcement title")}
          />
          <textarea
            value={annForm.body}
            onChange={e => setAnnForm(p => ({ ...p, body: e.target.value }))}
            rows={3}
            className={`${textareaClass} resize-none`}
            placeholder={ui("Write your announcement...")}
            aria-label={ui("Announcement message")}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              value={annForm.type}
              onChange={(t) => setAnnForm(p => ({ ...p, type: t }))}
              options={(["info", "warning", "roomInfo", "result"] as AnnouncementType[]).map(t => ({
                value: t,
                label: t === "roomInfo" ? "Room Info" : t.charAt(0).toUpperCase() + t.slice(1),
              }))}
            />
            <Checkbox checked={annForm.isPinned} onChange={(v) => setAnnForm(p => ({ ...p, isPinned: v }))} label={ui("Pin to top")} />
            <AdminButton size="sm" loading={annLoading} onClick={handlePostAnnouncement} className="ml-auto">{ui("Post announcement")}</AdminButton>
          </div>
        </div>

        {ui(announcements.length === 0 ? (
          <EmptyState title={ui("No announcements yet")} />
        ) : (
          <ul className="divide-y divide-(--ad-line)">
            {announcements.map(a => (
              <li key={a.id} className="px-5 sm:px-6 py-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge>{ui(a.type === "roomInfo" ? "Room Info" : a.type.charAt(0).toUpperCase() + a.type.slice(1))}</Badge>
                    {a.isPinned && <Badge tone="accent"><PinIcon size={12} />{ui("Pinned")}</Badge>}
                    <span className="text-xs text-(--ad-faint)">{timeAgo(a.createdAt)}</span>
                  </div>
                  {a.title && <p className="text-sm font-semibold text-(--ad-text)">{ui(a.title)}</p>}
                  <p className="text-sm text-(--ad-dim) whitespace-pre-line">{a.body}</p>
                </div>
                <RowAction tone="danger" onClick={() => handleDeleteAnnouncement(a.id)} disabled={deletingAnn === a.id}>
                  {ui(deletingAnn === a.id ? "…" : "Delete")}
                </RowAction>
              </li>
            ))}
          </ul>
        ))}
      </Card>
    </div>
  );
}
