import type { Registration, Tournament } from "@/lib/types";
import { formatDateOnly, formatTimeOnly, toDate } from "@/lib/utils/formatDate";
import { resolveBanner } from "@/lib/utils/bannerUrl";
import {
  BackLink,
  Caption,
  EntryChip,
  PlacePrize,
  SlotMeter,
  StatGrid,
  StatusChip,
  mCard,
  onImage,
} from "@/components/mobile/ui/primitives";
import { Countdown } from "@/components/mobile/ui/Countdown";
import { WalletIcon } from "@/components/mobile/ui/icons";
import { RegisterBar } from "./RegisterButton";
import { MobileTournamentDashboard } from "./MobileTournamentDashboard";

export function MobileTournamentDetail({
  tournament: t,
  myRegistration,
}: {
  tournament: Tournament;
  myRegistration: Registration | null;
}) {
  const banner = resolveBanner(t.bannerUrl, t.id, "hero");
  return (
    <div className="md:hidden m-app">
      <div className="px-4 pt-2">
        <BackLink href="/" label="Home" />
      </div>

      <div className="px-4">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-m-raised border border-m-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.src}
            style={{ objectPosition: banner.position }}
            alt={t.name}
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
        </div>

        <h1 className="mt-4 font-m-display font-bold text-[30px] leading-[1.05] text-m-text">{t.name}</h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
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

        <div className={`${mCard} p-4 space-y-4`}>
          <SlotMeter filled={t.registeredCount} max={t.maxSlots} waitlisted={t.waitlistCount} />
          {t.registrationDeadline && (
            <Countdown
              variant="boxes"
              targetMs={toDate(t.registrationDeadline).getTime()}
              label="Registration closes in"
              expiredLabel="Registration closed"
            />
          )}
        </div>

        {/* bKash Send Money info — only for paid tournaments */}
        {!t.isFree && t.bkashNumber && (
          <div className="flex items-center gap-3 rounded-2xl border border-m-amber/35 bg-m-amber/10 p-4">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-m-amber/15 text-m-amber-text flex items-center justify-center">
              <WalletIcon size={20} />
            </span>
            <div className="min-w-0">
              <Caption color="text-m-amber-text">bKash Send Money (Personal)</Caption>
              <p className="font-mono text-[20px] font-bold tracking-widest text-m-text">{t.bkashNumber}</p>
            </div>
          </div>
        )}
      </div>

      <MobileTournamentDashboard tournament={t} myRegistration={myRegistration} />

      <RegisterBar
        tournamentId={t.id}
        canRegister={t.isRegistrationOpen}
        isFull={t.registeredCount >= t.maxSlots}
        isOngoing={t.status === "ongoing"}
      />
    </div>
  );
}
