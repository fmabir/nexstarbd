"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useMyRegistrations } from "@/lib/hooks/useMyRegistrations";
import { useTournaments } from "@/lib/hooks/useTournaments";
import type { Registration } from "@/lib/types";
import { Chip, EmptyState, Skeleton, mBtn, mCard } from "@/components/mobile/ui/primitives";
import { ChevronRightIcon, LogoutIcon, RulesIcon, ShieldIcon, UsersIcon } from "@/components/mobile/ui/icons";
import { toDate, formatTournamentDate } from "@/lib/utils/formatDate";

/** Presentation for the signed-in player registrations returned by Claude's hook. */
export function PlayerRegistrationList({ registrations, loading, error }: { registrations: Registration[]; loading: boolean; error?: string | null }) {
  const ui = useUiText();

  const { tournaments } = useTournaments();
  const ordered = [...registrations].sort((a, b) => toDate(b.registeredAt).getTime() - toDate(a.registeredAt).getTime());
  if (loading) return <Skeleton className="h-36" />;
  if (error) return <EmptyState icon={<UsersIcon />} title={ui("Couldn’t load your registrations")} text={ui("Refresh the page to try again.")} />;
  if (!registrations.length) return <div className={`${mCard} p-6 text-center`}>
    <UsersIcon className="mx-auto text-m-faint" size={28} />
    <h3 className="font-semibold mt-3">{ui("Your next match is waiting")}</h3>
    <p className="text-sm text-m-dim mt-1">{ui("Your squad registrations will appear here.")}</p>
    <Link href="/tournaments" className={`${mBtn.primary} mt-5`}>{ui("Browse tournaments")}</Link>
  </div>;

  return <div className="space-y-3">{ordered.map(reg => {
    const tournament = tournaments.find(t => t.id === reg.tournamentId);
    const label = reg.approvalStatus === "approved" ? "Approved" : reg.approvalStatus === "rejected" ? "Rejected" : "Pending approval";
    return <Link href={`/my-registration/${reg.id}`} key={reg.id} className={`${mCard} flex items-center gap-3 p-4 hover:border-primary/40`}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Chip tone={reg.approvalStatus === "approved" ? "green" : reg.approvalStatus === "rejected" ? "red" : "amber"}>{ui(label)}</Chip>{reg.isWaitlisted && <Chip tone="amber">{ui("Waitlisted")}</Chip>}{reg.slotNumber && <span className="text-xs text-m-faint">{ui("Slot #")}{reg.slotNumber}</span>}</div>
        <p className="font-semibold text-sm">{tournament?.name || "Tournament registration"}</p>
        <p className="mt-1 text-xs text-m-dim">{reg.squadName}{ui(tournament ? ` · ${formatTournamentDate(tournament.startsAt)}` : "")}</p>
      </div>
      <ChevronRightIcon size={18} className="shrink-0 text-m-faint" />
    </Link>;
  })}</div>;
}

function MyRegistrations() {
  const data = useMyRegistrations();
  return <PlayerRegistrationList registrations={data.registrations} loading={data.loading} error={data.error} />;
}

export function PlayerAccount() {
  const ui = useUiText();

  const { user, loading, isAdmin, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  if (loading) return <div className="player-narrow px-4">
    <Skeleton className="h-64" />
  </div>;
  if (!user) return <div className="player-narrow px-4">
    <div className={`${mCard} p-5 text-center mt-6`}>
      <UsersIcon size={32} className="mx-auto text-primary" />
      <h1 className="text-2xl font-bold mt-4">{ui("Your player account")}</h1>
      <p className="text-sm text-m-dim mt-2">{ui("Sign in with your email to find your registrations and squad details.")}</p>
      <Link href="/login?next=/account" className={`${mBtn.primary} mt-6 w-full`}>{ui("Sign in")}</Link>
    </div>
  </div>;
  return <div className="player-narrow px-4">
    <h1 className="text-2xl font-bold mb-4">{ui("My account")}</h1>
    <div className={`${mCard} p-4 flex items-center gap-4`}>
      <span className="w-12 h-12 shrink-0 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-xl font-bold">{(user.displayName?.[0] || user.email?.[0] || "P").toUpperCase()}</span>
      <div className="min-w-0">
        <h2 className="font-semibold">{user.displayName || "Player"}</h2>
        <p className="text-sm text-m-dim break-all">{user.email}</p>
      </div>
    </div>
    <section id="registrations" className="mt-4 scroll-mt-24">
      <h2 className="text-lg font-bold mb-3">{ui("My registrations")}</h2>
      <MyRegistrations />
    </section>
    <div className={`${mCard} mt-4 divide-y divide-m-line`}>
      <Link href="/rules" className="flex items-center gap-3 p-4 text-sm font-medium">
        <RulesIcon />{ui("Tournament rules")}<ChevronRightIcon size={16} className="ml-auto" />
      </Link>{isAdmin && <Link href="/admin" className="flex items-center gap-3 p-4 text-sm font-medium">
        <ShieldIcon />{ui("Admin dashboard")}<ChevronRightIcon size={16} className="ml-auto" />
      </Link>}<button type="button" disabled={signingOut} onClick={async () => { setSigningOut(true); try { await signOut(); } catch { setError("Couldn’t sign out. Please try again."); } finally { setSigningOut(false); } }} className="w-full flex items-center gap-3 p-4 text-sm font-semibold text-primary">
        <LogoutIcon />{ui(signingOut ? "Signing out…" : "Sign out")}</button>
    </div>{error && <p className="mt-3 text-sm text-primary" role="alert">{ui(error)}</p>}</div>;
}
