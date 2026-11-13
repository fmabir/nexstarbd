"use client";

import Link from "next/link";
import { useMyRegistrations } from "@/lib/hooks/useMyRegistrations";
import type { Tournament } from "@/lib/types";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { useUiText } from "@/components/i18n/ui-text";
import { Chip, Skeleton, mCard } from "@/components/mobile/ui/primitives";
import { ChevronRightIcon } from "@/components/mobile/ui/icons";
import { selectNextTournament } from "./nextTournament";

export function MyNextTournament({ tournaments, tournamentsLoading }: { tournaments: Tournament[]; tournamentsLoading: boolean }) {
  const ui = useUiText();
  const { registrations, loading, error } = useMyRegistrations();
  if (loading || tournamentsLoading) return <Skeleton className="h-24 mb-4" />;
  const next = selectNextTournament(registrations, tournaments);

  if (error || !next) return (
    <section className={`${mCard} p-3 mb-4 flex items-center justify-between gap-3`}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{ui("My next tournament")}</h2>
        <p className="text-xs text-m-dim mt-1">{ui(error ? "Couldn’t load your registrations" : "No upcoming registered tournament")}</p>
      </div>
      <Link href={error ? "/account#registrations" : "/tournaments"} className="shrink-0 min-h-11 inline-flex items-center text-sm font-semibold text-primary">
        {ui(error ? "My Matches" : "Tournaments")}<ChevronRightIcon size={16} />
      </Link>
    </section>
  );

  const { tournament, registration } = next;
  const waiting = registration.isWaitlisted;
  return (
    <section className={`${mCard} p-3 mb-4 border-primary/20`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{ui("My next tournament")}</h2>
        <Chip tone={waiting || registration.approvalStatus !== "approved" ? "amber" : "green"}>
          {ui(waiting ? "Waitlisted" : registration.approvalStatus === "approved" ? "Approved" : "Pending approval")}
        </Chip>
      </div>
      <Link href={`/my-registration/${registration.id}`} className="flex items-center justify-between gap-3 min-h-11 mt-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{tournament.name}</p>
          <p className="text-xs text-m-dim mt-0.5">
            {ui(formatDateOnly(tournament.startsAt))} · {ui(formatTimeOnly(tournament.startsAt))}
            {registration.slotNumber != null && !waiting && <> · {ui("Slot #")}{registration.slotNumber}</>}
          </p>
        </div>
        <ChevronRightIcon size={18} className="shrink-0 text-primary" />
      </Link>
    </section>
  );
}
