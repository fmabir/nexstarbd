
import { createUiText } from "@/components/i18n/ui-text";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import type { Tournament } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/formatDate";
import { CreateTournamentForm } from "@/components/admin/CreateTournamentForm";
import { Card, EmptyState, PageHeader, TournamentStatusBadge } from "@/components/admin/ui";
import { ChevronRightIcon } from "@/components/admin/icons";

async function getTournaments(): Promise<Tournament[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb
    .collection("tournaments")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Tournament));
}

export default async function AdminTournamentsPage() {
  const ui = createUiText(await getLocale());

  const tournaments = await getTournaments();

  return (
    <div className="space-y-6">
      <PageHeader title={ui("Tournaments")} description="Create a tournament, then open it to manage squads, room info and schedule." />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
        <Card title={ui("Create tournament")} description="Fields marked * are required.">
          <CreateTournamentForm />
        </Card>

        <Card title={ui(`All tournaments (${tournaments.length})`)} flush>
          {ui(tournaments.length === 0 ? (
            <EmptyState title={ui("No tournaments yet")} text={ui("Create one with the form.")} />
          ) : (
            <ul className="divide-y divide-(--ad-line)">
              {tournaments.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/admin/tournaments/${t.id}`}
                    className="flex items-center gap-3 px-5 sm:px-6 py-3.5 hover:bg-(--ad-raised) transition-colors"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-(--ad-text) truncate">{t.name}</span>
                      <span className="block text-xs text-(--ad-dim) mt-0.5">
                        {ui(formatShortDate(t.startsAt))} · {t.mode} · {t.registeredCount}/{t.maxSlots}{ui("squads")}{ui(t.isFree ? " · Free" : t.registrationFee ? ` · ${t.registrationFee}` : "")}
                      </span>
                    </span>
                    <TournamentStatusBadge status={t.status} />
                    <span className="hidden sm:inline text-[13px] font-semibold text-(--ad-accent)">{ui("Manage")}</span>
                    <ChevronRightIcon size={16} className="text-(--ad-faint) shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </Card>
      </div>
    </div>
  );
}
