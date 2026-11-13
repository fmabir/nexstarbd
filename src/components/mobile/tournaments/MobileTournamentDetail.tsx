
import { useUiText } from "@/components/i18n/ui-text";
import Link from "next/link";
import type { Registration, Tournament } from "@/lib/types";
import { formatDateOnly, formatTimeOnly, toDate } from "@/lib/utils/formatDate";
import { resolveBanner } from "@/lib/utils/bannerUrl";
import { BackLink, EntryChip, PlacePrize, SlotMeter, StatGrid, StatusChip, mCard } from "@/components/mobile/ui/primitives";
import { Countdown } from "@/components/mobile/ui/Countdown";
import { RegisterBar, RegisterButton } from "./RegisterButton";
import { MobileTournamentDashboard } from "./MobileTournamentDashboard";

/** Shared tournament layout: a single column on phones, summary beside details on desktop. */
export function MobileTournamentDetail({ tournament: t, myRegistration }: { tournament: Tournament; myRegistration: Registration | null }) {
  const ui = useUiText();

  const banner = resolveBanner(t.bannerUrl, t.id, "hero");
  const action = { tournamentId: t.id, canRegister: t.isRegistrationOpen, isFull: t.registeredCount >= t.maxSlots, isOngoing: t.status === "ongoing" };
  return (
    <div className="player-container">
      <BackLink href="/tournaments" label={ui("Tournaments")} />
      <div className="grid md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px] gap-4 mt-2 items-start">
        <div className="min-w-0">
          <div className="relative h-28 sm:h-36 lg:h-40 rounded-2xl overflow-hidden bg-m-raised border border-m-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.src} style={{ objectPosition: banner.position }} alt={ui(t.name)} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <StatusChip status={t.status} />
            <EntryChip isFree={t.isFree} fee={t.registrationFee} />
            <span className="text-xs text-m-faint">{t.mode}</span>
          </div>
          <h1 className="mt-3 text-[24px] md:text-[28px] font-bold leading-tight text-m-text">{t.name}</h1>
          <p className="mt-2 text-sm text-m-dim">{ui(formatDateOnly(t.startsAt))} · {ui(formatTimeOnly(t.startsAt))}{ui("(Bangladesh time)")}</p>
        </div>
        <aside className={`${mCard} p-4 space-y-3 md:sticky md:top-24`}>
          <div>
            <p className="text-xs text-m-faint mb-1">{ui("Prize pool")}</p>
            <p className="text-2xl font-bold text-gold">{t.prizePool}</p>{(t.firstPrize || t.secondPrize) && <div className="flex flex-wrap gap-2 mt-3">{t.firstPrize && <PlacePrize place={1} value={t.firstPrize} />}{t.secondPrize && <PlacePrize place={2} value={t.secondPrize} />}</div>}</div>
          <StatGrid items={[{ label: "Entry", value: t.isFree ? "Free" : t.registrationFee || "Fee applies", text: true }, { label: "Mode", value: t.mode, text: true }]} />
          <SlotMeter filled={t.registeredCount} max={t.maxSlots} waitlisted={t.waitlistCount} />
          {t.registrationDeadline && t.status !== "completed" && t.status !== "cancelled" && <Countdown targetMs={toDate(t.registrationDeadline).getTime()} label={ui("Registration closes in")} expiredLabel="Registration closed" />}
          {!t.isFree && t.bkashNumber && <div className="rounded-xl border border-m-line bg-m-raised p-3">
            <p className="text-xs text-m-dim">{ui("bKash Send Money (Personal)")}</p>
            <p className="mt-1 font-mono text-lg font-bold text-m-text break-all">{t.bkashNumber}</p>
            <p className="text-xs text-m-dim mt-1">{ui("Keep your transaction ID for registration.")}</p>
          </div>}
          <div className="hidden md:block">
            <RegisterButton {...action} className="w-full" />
          </div>
          <Link href="/rules" className="block text-center text-sm font-medium text-primary py-1">{ui("Read tournament rules")}</Link>
        </aside>
        <div className="min-w-0 md:col-start-1 md:row-start-2">
          {t.description && <section className={`${mCard} p-4 mb-3`}>
            <h2 className="font-bold text-lg mb-2">{ui("About this tournament")}</h2>
            <p className="text-sm leading-relaxed text-m-dim whitespace-pre-wrap break-words">{t.description}</p>
          </section>}
          <MobileTournamentDashboard tournament={t} myRegistration={myRegistration} />
        </div>
      </div>
      <RegisterBar {...action} />
    </div>
  );
}
