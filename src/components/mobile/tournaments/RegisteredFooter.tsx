"use client";

import Link from "next/link";
import { useMyRegistration } from "@/lib/hooks/useMyRegistration";
import { CheckIcon, ChevronRightIcon } from "@/components/mobile/ui/icons";

/** Strip under a tournament row when the player has already registered for it. */
export function RegisteredFooter({ tournamentId }: { tournamentId: string }) {
  const { myReg } = useMyRegistration(tournamentId);
  if (!myReg) return null;

  return (
    <Link
      href={`/my-registration/${myReg.id}`}
      className="flex items-center gap-2 h-11 px-3 border-t border-m-line text-[13px] font-medium text-m-green-text active:bg-m-raised"
    >
      <CheckIcon size={16} />
      You&apos;re registered
      <span className="ml-auto inline-flex items-center gap-0.5 text-m-dim">
        Squad &amp; announcements
        <ChevronRightIcon size={16} />
      </span>
    </Link>
  );
}
