import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "./CountdownTimer";
import { SlotProgressBar } from "./SlotProgressBar";
import type { Tournament, TournamentStatus } from "@/lib/types";
import { formatTournamentDate } from "@/lib/utils/formatDate";

const statusBadge: Record<
  TournamentStatus,
  { label: string; variant: "info" | "danger" | "neutral" | "warning" }
> = {
  upcoming: { label: "Upcoming", variant: "info" },
  ongoing: { label: "LIVE", variant: "danger" },
  completed: { label: "Completed", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "warning" },
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const s = statusBadge[tournament.status];
  const isFull = tournament.registeredCount >= tournament.maxSlots;
  const canRegister =
    tournament.isRegistrationOpen &&
    tournament.status === "upcoming";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Banner */}
      <div className="relative h-36 -mx-5 -mt-5 mb-4 bg-gradient-to-br from-gray-900 to-gray-700">
        {tournament.bannerUrl ? (
          <Image
            src={tournament.bannerUrl}
            alt={tournament.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl text-white/20 tracking-wider">
              FREE FIRE
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <h3 className="font-display text-xl text-white tracking-wide leading-tight line-clamp-2">
            {tournament.name}
          </h3>
          <Badge variant={s.variant} className="shrink-0 ml-2">
            {s.label === "LIVE" && (
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse mr-1" />
            )}
            {s.label}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold block">
            Prize Pool
          </span>
          <span className="font-bold text-secondary text-base">
            {tournament.prizePool}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold block">
            Mode
          </span>
          <span className="font-semibold">{tournament.mode}</span>
        </div>
        <div className="col-span-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold block">
            Date
          </span>
          <span className="font-semibold">
            {formatTournamentDate(tournament.startsAt)}
          </span>
        </div>
      </div>

      {/* Slots */}
      <div className="mb-4">
        <SlotProgressBar
          filled={tournament.registeredCount}
          max={tournament.maxSlots}
          waitlisted={tournament.waitlistCount}
        />
      </div>

      {/* Countdown */}
      {tournament.status === "upcoming" && (
        <div className="mb-4">
          <CountdownTimer targetDate={tournament.startsAt.toDate()} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {canRegister ? (
          <Button
            href={`/register/${tournament.id}`}
            variant={isFull ? "outline" : "primary"}
            size="sm"
            className="flex-1"
          >
            {isFull ? "Join Waitlist" : "Register Squad"}
          </Button>
        ) : (
          <span className="flex-1 text-center text-sm text-muted-foreground py-2 font-medium">
            {tournament.status === "completed"
              ? "Tournament Ended"
              : tournament.status === "cancelled"
              ? "Cancelled"
              : "Registration Closed"}
          </span>
        )}
        <Button
          href={`/tournaments/${tournament.id}`}
          variant="ghost"
          size="sm"
        >
          Dashboard
        </Button>
      </div>
    </Card>
  );
}
