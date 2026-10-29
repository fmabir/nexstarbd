"use client";

import Link from "next/link";
import { useRegistrationAction, type RegistrationAction } from "@/lib/hooks/useRegistrationAction";
import type { ApprovalStatus } from "@/lib/types";
import { mBtn } from "@/components/mobile/ui/primitives";
import { ArrowRightIcon, BanIcon, CheckIcon, ChevronRightIcon, HourglassIcon } from "@/components/mobile/ui/icons";

interface Props {
  tournamentId: string;
  canRegister: boolean;
  isFull: boolean;
  isOngoing: boolean;
}

const statusLook: Record<ApprovalStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: "Awaiting approval",
    icon: <HourglassIcon size={18} />,
    className: "bg-m-amber/12 border-m-amber/35 text-m-amber-text",
  },
  approved: {
    label: "Registered",
    icon: <CheckIcon size={18} />,
    className: "bg-m-green/12 border-m-green/35 text-m-green-text",
  },
  rejected: {
    label: "Not allowed",
    icon: <BanIcon size={18} />,
    className: "bg-m-raised border-m-line text-m-dim",
  },
};

function ActionView({ action, className }: { action: RegistrationAction; className: string }) {
  if (action.kind === "loading") {
    return <div className={`h-12 rounded-xl bg-m-raised animate-pulse ${className}`} />;
  }
  if (action.kind === "none") return null;

  if (action.kind === "registered") {
    const s = statusLook[action.status];
    return (
      <Link
        href={`/my-registration/${action.registrationId}`}
        className={`inline-flex items-center gap-2 h-12 px-4 rounded-xl border text-[15px] font-semibold ${s.className} ${className}`}
      >
        {s.icon}
        <span className="flex-1 text-left">{s.label}</span>
        <span className="text-[13px] font-medium opacity-80">My squad</span>
        <ChevronRightIcon size={16} className="-mr-1 opacity-80" />
      </Link>
    );
  }

  return (
    <Link href={action.href} className={`${action.isFull ? mBtn.warning : mBtn.primary} ${className}`}>
      {action.isFull ? "Join waitlist" : "Register squad"}
      <ArrowRightIcon size={18} />
    </Link>
  );
}

/** Register / waitlist / my-status button, sized for a row of actions. */
export function RegisterButton({ className = "", ...params }: Props & { className?: string }) {
  const action = useRegistrationAction(params);
  return <ActionView action={action} className={className} />;
}

/**
 * The same action pinned above the tab bar on the tournament page, so the
 * main thing a player came to do never scrolls away. Renders nothing (not
 * even the bar) when there is no action.
 */
export function RegisterBar(params: Props) {
  const action = useRegistrationAction(params);
  if (action.kind === "none") return null;

  return (
    <>
      {/* Reserves the button's height so it never covers the end of the page */}
      <div className="h-16" aria-hidden="true" />
      {/* Floats just above the tab bar; the white backing keeps the tinted
          status pill opaque over scrolling content */}
      <div className="md:hidden fixed inset-x-3 z-30 bottom-[calc(var(--m-tabbar-h)+env(safe-area-inset-bottom))] rounded-xl bg-white shadow-[0_10px_28px_-10px_rgba(16,24,40,0.4)]">
        <ActionView action={action} className="w-full" />
      </div>
    </>
  );
}
