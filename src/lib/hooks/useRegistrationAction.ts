"use client";

import { useAuth } from "@/context/AuthContext";
import { useMyRegistration } from "@/lib/hooks/useMyRegistration";
import type { ApprovalStatus } from "@/lib/types";

export type RegistrationAction =
  | { kind: "loading" }
  | { kind: "registered"; registrationId: string; status: ApprovalStatus }
  | { kind: "register"; href: string; isFull: boolean }
  | { kind: "none" };

interface Params {
  tournamentId: string;
  canRegister: boolean;
  isFull: boolean;
  isOngoing: boolean;
}

/**
 * What the current player can do about a tournament: see their own
 * registration, register (or join the waitlist), or nothing. Shared by the
 * desktop status button and the phone layout so both follow one rule.
 */
export function useRegistrationAction({ tournamentId, canRegister, isFull, isOngoing }: Params): RegistrationAction {
  const { user } = useAuth();
  const { myReg, loading } = useMyRegistration(tournamentId);

  if (loading) return { kind: "loading" };

  if (myReg) return { kind: "registered", registrationId: myReg.id, status: myReg.approvalStatus };

  // Not registered — only ongoing tournaments accept new registrations
  if (!isOngoing || !canRegister) return { kind: "none" };

  const href = user ? `/register/${tournamentId}` : `/login?next=/register/${tournamentId}`;
  return { kind: "register", href, isFull };
}
