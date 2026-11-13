
import { useUiText } from "@/components/i18n/ui-text";
import Link from "next/link";
import type { Tournament } from "@/lib/types";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { resolveBanner } from "@/lib/utils/bannerUrl";
import { EntryChip, SlotMeter, StatusChip, mCard } from "@/components/mobile/ui/primitives";
import { ChevronRightIcon } from "@/components/mobile/ui/icons";
import { RegisterButton } from "./RegisterButton";

/** The same decision card on phones and desktop; full details live one tap away. */
export function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const ui = useUiText();

  const banner = resolveBanner(t.bannerUrl, t.id);
  const href = `/tournaments/${t.id}`;
  return (
    <article className={`${mCard} overflow-hidden h-full flex flex-col`}>
      <Link href={href} className="block relative h-20 bg-m-raised" aria-label={ui(`View ${t.name}`)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner.src} style={{ objectPosition: banner.position }} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-2 left-2 rounded-full bg-white">
          <StatusChip status={t.status} />
        </div>
      </Link>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-m-faint">{t.mode}</span>
          <EntryChip isFree={t.isFree} fee={t.registrationFee} />
        </div>
        <div>
          <Link href={href}>
            <h3 className="text-base font-bold leading-snug text-m-text line-clamp-2 hover:text-primary">{t.name}</h3>
          </Link>
          <p className="mt-1 text-xs text-m-dim">{ui(formatDateOnly(t.startsAt))} · {ui(formatTimeOnly(t.startsAt))}</p>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-m-faint">{ui("Prize pool")}</span>
          <span className="text-lg font-bold text-gold">{t.prizePool}</span>
        </div>
        <SlotMeter filled={t.registeredCount} max={t.maxSlots} waitlisted={t.waitlistCount} />
        <div className="mt-auto pt-1 space-y-1">
          <RegisterButton className="w-full" tournamentId={t.id} canRegister={t.isRegistrationOpen} isFull={t.registeredCount >= t.maxSlots} isOngoing={t.status === "ongoing"} />
          <Link href={href} className="inline-flex items-center justify-center gap-1 w-full min-h-10 text-sm font-semibold text-primary hover:bg-primary-light rounded-lg">{ui("View tournament")}<ChevronRightIcon size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
