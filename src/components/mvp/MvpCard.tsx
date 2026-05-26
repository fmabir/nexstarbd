import Image from "next/image";
import type { MvpPlayer } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/formatDate";

export function MvpCard({ mvp }: { mvp: MvpPlayer }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 hover:shadow-md transition-shadow min-w-[220px] max-w-[260px]">
      {/* Avatar */}
      <div className="relative w-16 h-16 mx-auto mb-3">
        {mvp.photoUrl ? (
          <Image
            src={mvp.photoUrl}
            alt={mvp.playerName}
            fill
            className="object-cover rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-display text-2xl">
            {mvp.playerName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 bg-secondary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          MVP
        </div>
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className="font-display text-lg text-foreground tracking-wide">
          {mvp.playerName}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{mvp.achievement}</p>

        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="font-display text-2xl text-primary">{mvp.kills}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Kills</div>
          </div>
          {mvp.damage && (
            <div className="text-center">
              <div className="font-display text-2xl text-secondary">{mvp.damage}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">DMG</div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          {mvp.tournamentName} · {formatShortDate(mvp.tournamentDate)}
        </div>
      </div>
    </div>
  );
}
