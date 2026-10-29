import Link from "next/link";
import type { Tournament } from "@/lib/types";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { resolveBanner } from "@/lib/utils/bannerUrl";
import { EntryChip, StatusChip, mCard } from "@/components/mobile/ui/primitives";
import { ChevronRightIcon } from "@/components/mobile/ui/icons";

/** Compact list row: thumbnail, name, when, prize. The whole row opens the tournament. */
export function TournamentRow({
  tournament: t,
  footer,
}: {
  tournament: Tournament;
  /** Optional strip under the row, e.g. the player's own registration */
  footer?: React.ReactNode;
}) {
  const banner = resolveBanner(t.bannerUrl, t.id);
  return (
    <div className={`${mCard} overflow-hidden`}>
      <Link href={`/tournaments/${t.id}`} className="flex items-center gap-3 p-3 active:bg-m-raised transition-colors">
        <div className="relative w-[84px] h-[84px] shrink-0 rounded-xl overflow-hidden bg-m-raised">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.src}
            style={{ objectPosition: banner.position }}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <StatusChip status={t.status} />
            <EntryChip isFree={t.isFree} fee={t.registrationFee} />
          </div>
          <h3 className="text-[16px] font-semibold leading-snug text-m-text line-clamp-2">{t.name}</h3>
          <p className="text-[13px] text-m-dim truncate">
            {formatDateOnly(t.startsAt)} · {formatTimeOnly(t.startsAt)}
          </p>
          <p className="mt-0.5 text-[13px] truncate">
            <span className="font-semibold text-m-gold-text">{t.prizePool}</span>
            <span className="text-m-faint">
              {" "}· {t.mode} · {t.registeredCount}/{t.maxSlots} slots
            </span>
          </p>
        </div>
        <ChevronRightIcon size={18} className="shrink-0 text-m-faint" />
      </Link>
      {footer}
    </div>
  );
}
