import Image from "next/image";
import type { Winner } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/formatDate";

const positionConfig = {
  1: { label: "🥇 Champion", bg: "from-yellow-400 to-amber-500", border: "border-yellow-400" },
  2: { label: "🥈 Runner-Up", bg: "from-gray-400 to-gray-500", border: "border-gray-400" },
  3: { label: "🥉 3rd Place", bg: "from-orange-400 to-amber-600", border: "border-orange-400" },
};

export function WinnerCard({ winner }: { winner: Winner }) {
  const config = positionConfig[winner.position];

  return (
    <div className={`bg-white rounded-2xl border-2 ${config.border} overflow-hidden hover:shadow-lg transition-shadow`}>
      {/* Position banner */}
      <div className={`bg-gradient-to-r ${config.bg} px-4 py-2.5 text-white font-display text-lg tracking-wide`}>
        {config.label}
      </div>

      {/* Photo */}
      {winner.photoUrl && (
        <div className="relative h-40 bg-gray-100">
          <Image
            src={winner.photoUrl}
            alt={winner.squadName}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="p-5">
        <h3 className="font-display text-2xl text-foreground tracking-wide mb-1">
          {winner.squadName}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {winner.tournamentName} · {formatShortDate(winner.tournamentDate)}
        </p>

        {/* Players */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {winner.players.map((p) => (
            <span
              key={p}
              className="text-xs font-semibold bg-muted px-2.5 py-1 rounded-full"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
            Prize
          </span>
          <span className="font-display text-xl text-secondary">
            {winner.prize}
          </span>
        </div>
      </div>
    </div>
  );
}
