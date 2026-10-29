import Image from "next/image";
import type { Winner } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/formatDate";
import { EmptyState, PageHeader, PlaceBadge, art, mCard } from "@/components/mobile/ui/primitives";

const placeName = { 1: "Champion", 2: "Runner-up", 3: "3rd place" } as const;
const placeText = { 1: "text-m-gold-text", 2: "text-m-silver-text", 3: "text-m-bronze-text" } as const;

interface Podium {
  tournamentId: string;
  name: string;
  date: Winner["tournamentDate"];
  winners: Winner[];
}

/** Winners grouped into one podium card per tournament, newest first. */
export function MobileHallOfFame({
  title,
  subtitle,
  emptyText,
  winners,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  winners: Winner[];
}) {
  const podiums: Podium[] = [];
  const byId = new Map<string, Podium>();
  for (const w of winners) {
    let p = byId.get(w.tournamentId);
    if (!p) {
      p = { tournamentId: w.tournamentId, name: w.tournamentName, date: w.tournamentDate, winners: [] };
      byId.set(w.tournamentId, p);
      podiums.push(p);
    }
    p.winners.push(w);
  }
  podiums.forEach((p) => p.winners.sort((a, b) => a.position - b.position));

  return (
    <div className="md:hidden m-app">
      <PageHeader title={title} subtitle={subtitle} art={art.trophy} />

      {podiums.length === 0 ? (
        <div className="px-4">
          <EmptyState art={art.trophy} title={emptyText} />
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {podiums.map((p) => {
            const photo = p.winners.find((w) => w.position === 1)?.photoUrl;
            return (
              <article key={p.tournamentId} className={`${mCard} overflow-hidden`}>
                {photo && (
                  <div className="relative h-40 bg-m-raised">
                    <Image src={photo} alt={p.winners[0].squadName} fill sizes="100vw" className="object-cover" />
                  </div>
                )}
                <header className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-1">
                  <h2 className="font-m-display font-semibold text-[19px] leading-tight text-m-text truncate">{p.name}</h2>
                  <span className="shrink-0 text-[12px] text-m-faint">{formatShortDate(p.date)}</span>
                </header>
                <ol className="px-4 divide-y divide-m-line">
                  {p.winners.map((w) => (
                    <li key={w.id} className="flex items-center gap-3 py-3.5">
                      <PlaceBadge place={w.position} />
                      <div className="flex-1 min-w-0">
                        <span className={`block text-[11px] font-semibold uppercase tracking-[0.08em] ${placeText[w.position]}`}>
                          {placeName[w.position]}
                        </span>
                        <p className="font-m-display font-bold text-[20px] leading-tight text-m-text truncate">{w.squadName}</p>
                        <p className="text-[12px] text-m-dim line-clamp-2">{w.players.join(" · ")}</p>
                      </div>
                      <span className="shrink-0 font-m-display font-semibold text-[17px] text-m-gold-text">{w.prize}</span>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
