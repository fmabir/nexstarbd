import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { CountdownTimer } from "./CountdownTimer";
import { SlotProgressBar } from "./SlotProgressBar";
import type { Tournament, TournamentStatus } from "@/lib/types";
import { formatTournamentDate } from "@/lib/utils/formatDate";
import { resolveBannerUrl } from "@/lib/utils/bannerUrl";

const statusBadge: Record<
  TournamentStatus,
  { label: string; variant: "info" | "danger" | "neutral" | "warning" }
> = {
  upcoming:  { label: "Upcoming",  variant: "info" },
  ongoing:   { label: "LIVE",      variant: "danger" },
  completed: { label: "Completed", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "warning" },
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const s = statusBadge[tournament.status];
  const isFull = tournament.registeredCount >= tournament.maxSlots;
  const canRegister = tournament.isRegistrationOpen;

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-white hover:shadow-md transition-shadow flex flex-col">
      {/* Banner */}
      <div
        className="relative w-full shrink-0 overflow-hidden"
        style={{
          height: "68px",
          backgroundImage: `url(${resolveBannerUrl(tournament.bannerUrl, tournament.id)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#1f2937",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="absolute top-1.5 right-1.5">
          <Badge variant={s.variant}>
            {s.label === "LIVE" && (
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse mr-1" />
            )}
            {s.label}
          </Badge>
        </div>
        <div className="absolute bottom-1.5 left-2 right-2">
          <h3 className="font-display text-xs text-white tracking-wide leading-tight line-clamp-2">
            {tournament.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-2 flex flex-col gap-1.5 flex-1">
        {/* Prize + mode row */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-bold text-primary leading-none">{tournament.prizePool}</span>
          <span style={{ fontSize: "10px" }} className="font-semibold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">{tournament.mode}</span>
        </div>

        {/* Date */}
        <p style={{ fontSize: "10px" }} className="text-muted-foreground">{formatTournamentDate(tournament.startsAt)}</p>

        {/* Slots */}
        <SlotProgressBar
          filled={tournament.registeredCount}
          max={tournament.maxSlots}
          waitlisted={tournament.waitlistCount}
        />

        {/* Countdown */}
        {tournament.status === "upcoming" && (
          <CountdownTimer targetDate={tournament.startsAt.toDate()} />
        )}

        {/* Actions */}
        <div className="flex gap-1.5 mt-auto pt-0.5">
          {canRegister ? (
            <Link
              href={`/register/${tournament.id}`}
              style={{ fontSize: "10px" }}
              className={`flex-1 text-center font-bold py-1 rounded-lg border transition-colors ${
                isFull
                  ? "border-border text-foreground hover:bg-muted"
                  : "bg-primary hover:bg-primary-dark text-white border-primary"
              }`}
            >
              {isFull ? "Join Waitlist" : "Register Squad"}
            </Link>
          ) : (
            <span style={{ fontSize: "10px" }} className="flex-1 text-center text-muted-foreground py-1 font-medium">
              {tournament.status === "completed" ? "Tournament Ended"
                : tournament.status === "cancelled" ? "Cancelled"
                : "Registration Closed"}
            </span>
          )}
          <Link
            href={`/tournaments/${tournament.id}`}
            style={{ fontSize: "10px" }}
            className="font-bold text-primary bg-primary/8 border border-primary/20 rounded-lg px-2 py-1 hover:bg-primary hover:text-white transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
