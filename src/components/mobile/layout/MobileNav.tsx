"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sheet } from "@/components/mobile/ui/Sheet";
import { Wordmark } from "@/components/mobile/ui/primitives";
import {
  ChevronRightIcon,
  CrosshairIcon,
  HomeIcon,
  LogoutIcon,
  RulesIcon,
  ShieldIcon,
  TrophyIcon,
} from "@/components/mobile/ui/icons";

const tabs = [
  { href: "/", label: "Home", Icon: HomeIcon, match: (p: string) => p === "/" },
  {
    href: "/tournaments",
    label: "Tournaments",
    Icon: CrosshairIcon,
    match: (p: string) => ["/tournaments", "/register", "/my-registration"].some((s) => p.startsWith(s)),
  },
  { href: "/hall-of-fame", label: "Results", Icon: TrophyIcon, match: (p: string) => p.startsWith("/hall-of-fame") },
  { href: "/rules", label: "Rules", Icon: RulesIcon, match: (p: string) => p.startsWith("/rules") },
];

/** Phone chrome: a slim top bar with the account, and a bottom tab bar for the four sections. */
export function MobileNav() {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const closeAccount = useCallback(() => setAccountOpen(false), []);

  const initial = (user?.displayName?.[0] ?? user?.email?.[0] ?? "?").toUpperCase();

  return (
    <>
      <header className="md:hidden m-app sticky top-0 z-40 bg-m-bg/85 backdrop-blur-xl border-b border-m-line">
        <div className="flex items-center justify-between h-14 pl-4 pr-3">
          <Link href="/" aria-label="NexStarBD home" className="flex items-center h-11">
            <Wordmark />
          </Link>

          {user ? (
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              className="flex items-center justify-center w-11 h-11"
              aria-label="Account"
              aria-haspopup="dialog"
            >
              <span className="w-8 h-8 rounded-full bg-m-red text-white text-[14px] font-semibold flex items-center justify-center">
                {initial}
              </span>
            </button>
          ) : (
            <Link href="/login" className="inline-flex items-center h-11 px-1">
              <span className="inline-flex items-center h-9 px-4 rounded-full bg-m-red active:bg-m-red-press text-white text-[14px] font-semibold">
                Sign in
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* Floating glass bar, lifted off the screen edge; the active tab gets a
          filled red pill behind its icon */}
      <nav
        className="md:hidden m-tabbar fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom))] z-40 h-16 rounded-[26px] bg-white/85 backdrop-blur-xl backdrop-saturate-150 border border-white/70 ring-1 ring-black/5 shadow-[0_12px_32px_-12px_rgba(16,24,40,0.35)]"
        aria-label="Main"
      >
        <ul className="grid grid-cols-4 h-full px-1">
          {tabs.map(({ href, label, Icon, match }) => {
            const active = match(pathname ?? "");
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 h-full text-[11px] transition-colors ${
                    active ? "text-m-text font-semibold" : "text-m-faint font-medium active:text-m-dim"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center h-8 w-14 rounded-full transition-all duration-300 ${
                      active ? "bg-m-red text-white shadow-[0_4px_12px_-2px_rgba(225,29,46,0.45)]" : ""
                    }`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.1 : 1.8} />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Sheet open={accountOpen} onClose={closeAccount}>
        {user && (
          <div className="pt-2">
            <div className="flex items-center gap-3 pb-4 border-b border-m-line">
              <span className="w-12 h-12 rounded-full bg-m-red text-white text-[18px] font-semibold flex items-center justify-center shrink-0">
                {initial}
              </span>
              <div className="min-w-0">
                {user.displayName && (
                  <p className="text-[16px] font-semibold text-m-text truncate">{user.displayName}</p>
                )}
                <p className="text-[13px] text-m-dim truncate">{user.email}</p>
              </div>
            </div>
            <ul className="py-2">
              {isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    onClick={closeAccount}
                    className="flex items-center gap-3 h-14 text-[15px] font-medium text-m-text"
                  >
                    <span className="w-9 h-9 rounded-xl bg-m-raised flex items-center justify-center text-m-dim">
                      <ShieldIcon size={18} />
                    </span>
                    Admin dashboard
                    <ChevronRightIcon size={18} className="ml-auto text-m-faint" />
                  </Link>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={async () => {
                    closeAccount();
                    await signOut();
                  }}
                  className="flex items-center gap-3 w-full h-14 text-[15px] font-medium text-m-red-text"
                >
                  <span className="w-9 h-9 rounded-xl bg-m-red/12 flex items-center justify-center">
                    <LogoutIcon size={18} />
                  </span>
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        )}
      </Sheet>
    </>
  );
}
