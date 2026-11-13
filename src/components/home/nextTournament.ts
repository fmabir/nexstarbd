import type { Registration, Tournament } from "@/lib/types";
import { toDate } from "@/lib/utils/formatDate";

/** Current matches first, then the earliest upcoming match; never imply a rejected squad can play. */
export function selectNextTournament(registrations: Registration[], tournaments: Tournament[]) {
  const byId = new Map(tournaments.map(tournament => [tournament.id, tournament]));
  return registrations
    .filter(registration => registration.approvalStatus !== "rejected")
    .flatMap(registration => {
      const tournament = byId.get(registration.tournamentId);
      return tournament && (tournament.status === "ongoing" || tournament.status === "upcoming")
        ? [{ registration, tournament }]
        : [];
    })
    .sort((a, b) => {
      // A waiting-list entry is a fallback when there is no allocated registration.
      const waiting = Number(Boolean(a.registration.isWaitlisted)) - Number(Boolean(b.registration.isWaitlisted));
      const live = Number(b.tournament.status === "ongoing") - Number(a.tournament.status === "ongoing");
      return waiting || live || toDate(a.tournament.startsAt).getTime() - toDate(b.tournament.startsAt).getTime();
    })[0] ?? null;
}
