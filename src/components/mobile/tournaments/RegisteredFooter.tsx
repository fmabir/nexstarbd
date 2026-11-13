"use client";

import { useUiText } from "@/components/i18n/ui-text";

import Link from "next/link";
import { useMyRegistration } from "@/lib/hooks/useMyRegistration";
import { BanIcon, CheckIcon, ChevronRightIcon, HourglassIcon } from "@/components/mobile/ui/icons";

/** Strip under a tournament row when the player has already registered for it. */
export function RegisteredFooter({ tournamentId }: { tournamentId: string }) {
  const ui = useUiText();

  const { myReg } = useMyRegistration(tournamentId);
  if (!myReg) return null;

  const status = myReg.approvalStatus;
  const Icon = status === "approved" ? CheckIcon : status === "rejected" ? BanIcon : HourglassIcon;
  const colour = status === "approved" ? "text-m-green-text" : status === "rejected" ? "text-m-red-text" : "text-m-amber-text";
  const label = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending approval";

  return (
    <Link
      href={`/my-registration/${myReg.id}`}
      className={`flex items-center gap-2 min-h-11 px-3 py-2 border-t border-m-line text-[13px] font-medium ${colour} active:bg-m-raised`}
    >
      <Icon size={16} className="shrink-0" />
      {ui(label)}
      <span className="ml-auto inline-flex items-center gap-0.5 text-m-dim">{ui("My squad")}<ChevronRightIcon size={16} />
      </span>
    </Link>
  );
}
