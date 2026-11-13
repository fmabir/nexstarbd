"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { LanguageToggle } from "@/components/layout/LanguageToggle";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ClipboardIcon,
  DashboardIcon,
  FlagIcon,
  HandshakeIcon,
  LogoutIcon,
  MedalIcon,
  MegaphoneIcon,
  StarIcon,
  TrophyIcon,
} from "./icons";

export const navItems = [
  { href: "/admin", label: "Dashboard", short: "Dashboard", Icon: DashboardIcon, exact: true },
  { href: "/admin/tournaments", label: "Tournaments", short: "Tournaments", Icon: TrophyIcon, exact: false },
  { href: "/admin/registrations", label: "Registrations", short: "Registrations", Icon: ClipboardIcon, exact: false },
  { href: "/admin/announcements", label: "Announcements", short: "Announce", Icon: MegaphoneIcon, exact: false },
  { href: "/admin/results", label: "Results", short: "Results", Icon: FlagIcon, exact: false },
  { href: "/admin/winners", label: "Winners", short: "Winners", Icon: MedalIcon, exact: false },
  { href: "/admin/mvp", label: "MVP Players", short: "MVP", Icon: StarIcon, exact: false },
  { href: "/admin/sponsors", label: "Sponsors", short: "Sponsors", Icon: HandshakeIcon, exact: false },
];

export function isActive(pathname: string, item: (typeof navItems)[number]) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function AdminBrand({ size = 28 }: { size?: number }) {
  const ui = useUiText();

  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/banners/lnsbd.png" alt="" aria-hidden="true" style={{ height: size, width: "auto" }} className="block" />
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-tight text-(--ad-text)">{ui("NexStarBD")}</span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-(--ad-accent)">{ui("Admin")}</span>
      </span>
    </span>
  );
}

/** Desktop navigation: a white column with the sections, account at the bottom. */
export function AdminSidebar() {
  const ui = useUiText();

  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col sticky top-0 h-screen bg-(--ad-surface) border-r border-(--ad-line)">
      <div className="px-5 h-16 flex items-center border-b border-(--ad-line)">
        <Link href="/" aria-label={ui("NexStarBD home")}>
          <AdminBrand />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={ui("Admin")}>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-(--ad-accent-soft) text-(--ad-accent) font-semibold"
                      : "text-(--ad-dim) hover:bg-(--ad-raised) hover:text-(--ad-text)"
                  }`}
                >
                  <item.Icon size={18} />
                  {ui(item.label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-(--ad-line)">
        <div className="px-3 mb-3"><LanguageToggle /></div>
        {user && <p className="text-xs text-(--ad-faint) px-3 mb-2 truncate">{user.email}</p>}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full h-10 px-3 rounded-xl text-sm font-medium text-(--ad-dim) hover:bg-(--ad-raised) hover:text-(--ad-text) transition-colors"
        >
          <LogoutIcon size={18} />{ui("Sign out")}</button>
      </div>
    </aside>
  );
}
