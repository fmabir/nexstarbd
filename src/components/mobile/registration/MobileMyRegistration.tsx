import Link from "next/link";
import type { Announcement, ApprovalStatus, Registration, Tournament } from "@/lib/types";
import { Caption, PageHeader, Section, art, mBtn, mCard } from "@/components/mobile/ui/primitives";
import { BanIcon, CheckIcon, HourglassIcon } from "@/components/mobile/ui/icons";
import { AnnouncementList } from "@/components/mobile/announcements/AnnouncementItem";

const statusLook: Record<
  ApprovalStatus,
  { label: string; desc: string; icon: React.ReactNode; box: string; badge: string; text: string }
> = {
  approved: {
    label: "Approved",
    desc: "Your squad has been approved. Get ready to play!",
    icon: <CheckIcon size={22} />,
    box: "border-m-green/35 bg-m-green/10",
    badge: "bg-m-green text-white",
    text: "text-m-green-text",
  },
  pending: {
    label: "Pending approval",
    desc: "Your registration is under review. The admin will approve or reject soon.",
    icon: <HourglassIcon size={22} />,
    box: "border-m-amber/35 bg-m-amber/10",
    badge: "bg-m-amber text-black",
    text: "text-m-amber-text",
  },
  rejected: {
    label: "Rejected",
    desc: "Unfortunately your squad was not approved for this tournament.",
    icon: <BanIcon size={22} />,
    box: "border-m-red/40 bg-m-red/10",
    badge: "bg-m-red text-white",
    text: "text-m-red-text",
  },
};

export function MobileMyRegistration({
  registration: reg,
  tournament,
  announcements,
}: {
  registration: Registration;
  tournament: Tournament | null;
  announcements: Announcement[];
}) {
  const s = statusLook[reg.approvalStatus || "pending"];
  const details = [
    { label: "Squad name", value: reg.squadName, strong: true },
    { label: "Leader", value: reg.leaderName },
    { label: "Leader UID", value: reg.leaderUid, mono: true },
    { label: "WhatsApp", value: reg.whatsapp },
  ];

  return (
    <div className="md:hidden m-app">
      <PageHeader
        title="My registration"
        subtitle={tournament?.name}
        back={{ href: `/tournaments/${reg.tournamentId}`, label: "Tournament" }}
        art={art.community}
      />

      <div>
        <div className="px-4 pb-7">
          <div className={`rounded-2xl border p-4 ${s.box}`}>
            <div className="flex items-start gap-3">
              <span className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${s.badge}`}>{s.icon}</span>
              <div className="min-w-0">
                <p className={`font-m-display font-bold text-[24px] leading-tight ${s.text}`}>{s.label}</p>
                <p className="mt-0.5 text-[14px] leading-snug text-m-dim">{s.desc}</p>
              </div>
            </div>

            {reg.slotNumber && reg.approvalStatus === "approved" && (
              <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                <Caption>Slot confirmed</Caption>
                <span className="font-m-display font-bold text-[26px] leading-none text-m-text">#{reg.slotNumber}</span>
              </div>
            )}

            {reg.isWaitlisted && (
              <p className={`mt-4 pt-3 border-t border-black/10 text-[14px] font-semibold ${s.text}`}>
                You are on the waiting list
              </p>
            )}
          </div>
        </div>

        <Section title="Squad details" tone="slate">
          <div className="px-4">
            <dl className={`${mCard} px-4 divide-y divide-m-line`}>
              {details.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-[14px] text-m-dim shrink-0">{d.label}</dt>
                  <dd
                    className={`text-right break-all ${d.strong ? "text-[15px] font-semibold" : "text-[14px]"} ${
                      d.mono ? "font-mono" : ""
                    } text-m-text`}
                  >
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        {announcements.length > 0 && (
          <Section title="Tournament announcements" live tone="blue">
            <div className="px-4">
              <AnnouncementList announcements={announcements} />
            </div>
          </Section>
        )}

        <div className="px-4 pt-7 flex flex-col gap-2.5">
          <Link href={`/tournaments/${reg.tournamentId}`} className={`${mBtn.primary} w-full`}>
            Go to tournament dashboard
          </Link>
          <Link href="/" className={`${mBtn.secondary} w-full`}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
