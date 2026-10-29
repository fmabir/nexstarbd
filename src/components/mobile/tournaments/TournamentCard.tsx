import Link from "next/link";
import type { Tournament } from "@/lib/types";
import { formatDateOnly, formatTimeOnly, toDate } from "@/lib/utils/formatDate";
import { resolveBanner } from "@/lib/utils/bannerUrl";
import { EntryChip, PlacePrize, SlotMeter, StatGrid, StatusChip, mBtn, mCard, onImage } from "@/components/mobile/ui/primitives";
import { Countdown } from "@/components/mobile/ui/Countdown";
import { RegisterButton } from "./RegisterButton";

/** Full card for a live / open tournament — everything needed to decide and register. */
export function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const banner = resolveBanner(t.bannerUrl, t.id);
  const isOngoing = t.status === "ongoing";
  const isFull = t.registeredCount >= t.maxSlots;
  const href = `/tournaments/${t.id}`;

  return (
    <article className={`${mCard} overflow-hidden`}>
      <Link href={href} className="block relative aspect-[16/7] bg-m-raised" aria-label={t.name}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.src}
          style={{ objectPosition: banner.position }}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={onImage}>
            <StatusChip status={t.status} />
          </span>
          <span className={onImage}>
            <EntryChip isFree={t.isFree} fee={t.registrationFee} />
          </span>
        </div>
      </Link>

      <div className="p-4 space-y-3.5">
        <Link href={href} className="block">
          <h3 className="font-m-display font-bold text-[24px] leading-[1.1] text-m-text line-clamp-2">{t.name}</h3>
        </Link>

        <div className="space-y-2">
          <StatGrid
            items={[
              { label: "Prize pool", value: t.prizePool, accent: "gold" },
              { label: "Mode", value: t.mode, text: true },
              { label: "Starts", value: formatTimeOnly(t.startsAt), sub: formatDateOnly(t.startsAt) },
            ]}
          />
          {(t.firstPrize || t.secondPrize) && (
            <div className="flex flex-wrap gap-2">
              {t.firstPrize && <PlacePrize place={1} value={t.firstPrize} />}
              {t.secondPrize && <PlacePrize place={2} value={t.secondPrize} />}
            </div>
          )}
        </div>

        <SlotMeter filled={t.registeredCount} max={t.maxSlots} waitlisted={t.waitlistCount} />

        {t.registrationDeadline && (
          <Countdown
            targetMs={toDate(t.registrationDeadline).getTime()}
            label="Registration closes in"
            expiredLabel="Registration closed"
          />
        )}

        <div className="flex gap-2">
          <RegisterButton
            className="flex-[2] min-w-0"
            tournamentId={t.id}
            canRegister={t.isRegistrationOpen}
            isFull={isFull}
            isOngoing={isOngoing}
          />
          <Link href={href} className={`${mBtn.secondary} flex-1`}>
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
