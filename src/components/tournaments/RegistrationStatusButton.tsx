"use client";

import Link from "next/link";
import { useMyRegistration } from "@/lib/hooks/useMyRegistration";
import { useAuth } from "@/context/AuthContext";
import type { ApprovalStatus } from "@/lib/types";

const statusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  pending:  { label: "⏳ Awaiting Approval",  className: "bg-amber-100 text-amber-700 border border-amber-300 cursor-default" },
  approved: { label: "✓ Registered",          className: "bg-secondary/10 text-secondary border border-secondary/30 cursor-default" },
  rejected: { label: "✗ Not Allowed",         className: "bg-gray-100 text-gray-500 border border-gray-300 cursor-default" },
};

interface Props {
  tournamentId: string;
  canRegister: boolean;
  isFull: boolean;
  isOngoing: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function RegistrationStatusButton({ tournamentId, canRegister, isFull, isOngoing, className = "", size = "md" }: Props) {
  const { user } = useAuth();
  const { myReg, loading } = useMyRegistration(tournamentId);

  const base = size === "sm"
    ? "flex-1 text-center font-bold px-2 py-1.5 rounded-lg text-[10px] transition-colors"
    : "block w-full sm:w-auto sm:inline-block text-center font-bold px-5 py-3 rounded-xl text-sm transition-colors";

  if (loading) {
    return <div className={`${base} bg-muted animate-pulse ${className}`} />;
  }

  // Registered — show status
  if (myReg) {
    const cfg = statusConfig[myReg.approvalStatus];
    return (
      <span className={`${base} ${cfg.className} ${className}`}>
        {cfg.label}
      </span>
    );
  }

  // Not registered — only ongoing tournaments accept new registrations
  if (!isOngoing || !canRegister) return null;

  const href = user ? `/register/${tournamentId}` : `/login?next=/register/${tournamentId}`;
  const label = isFull ? "Join Waitlist" : "Register Squad →";
  const btnClass = isFull
    ? "bg-amber-500 hover:bg-amber-600 text-white"
    : "bg-primary hover:bg-primary-dark text-white";

  return (
    <Link href={href} className={`${base} ${btnClass} ${className}`}>
      {label}
    </Link>
  );
}
