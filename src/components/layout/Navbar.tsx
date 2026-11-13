"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { LanguageToggle } from "./LanguageToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Wordmark } from "@/components/mobile/ui/primitives";
import { CrosshairIcon, HomeIcon, TrophyIcon, UserIcon } from "@/components/mobile/ui/icons";

const links = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/tournaments", label: "Tournaments", Icon: CrosshairIcon },
  { href: "/results", label: "Results", Icon: TrophyIcon },
  { href: "/account", label: "Account", Icon: UserIcon },
];

export function Navbar({ locale }: { locale: string }) {
  const ui = useUiText();

  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const active = (href: string) => href === "/" ? pathname === "/" :
    href === "/tournaments" ? ["/tournaments", "/register", "/my-registration"].some(p => pathname.startsWith(p)) :
      href === "/results" ? ["/results", "/hall-of-fame"].some(p => pathname.startsWith(p)) : pathname.startsWith(href);
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-white p-3 rounded-lg">{ui("Skip to content")}</a>
      <header lang={locale} className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-[1168px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" aria-label={ui("NexStarBD home")}>
            <Wordmark size={30} />
          </Link>
          <nav aria-label={ui("Main navigation")} className="hidden md:flex items-center gap-1">
            {links.slice(0, 3).map(({ href, label }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={`px-4 py-2.5 rounded-lg text-sm font-medium ${active(href) ? "bg-primary-light text-primary" : "text-muted-foreground hover:bg-muted"}`}>{ui(label)}</Link>)}
            <Link href="/rules" aria-current={active("/rules") ? "page" : undefined} className={`px-4 py-2.5 rounded-lg text-sm font-medium ${active("/rules") ? "text-primary bg-primary-light" : "text-muted-foreground hover:bg-muted"}`}>{ui("Rules")}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle currentLocale={locale} />
            {isAdmin && <Link href="/admin" className="hidden lg:block text-sm font-medium text-muted-foreground">{ui("Admin")}</Link>}
            <Link href={user ? "/account" : "/login"} className={user ? "flex items-center gap-2 text-sm font-semibold min-h-11" : "rounded-xl bg-primary hover:bg-primary-dark text-white p-2.5 md:px-4 text-sm font-semibold"}>
              {ui(user ? <>
                <span className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center">{(user.displayName?.[0] ?? user.email?.[0] ?? "P").toUpperCase()}</span>
                <span className="hidden lg:block max-w-32 truncate">{user.displayName || ui("My account")}</span>
              </> : <><UserIcon size={20} className="md:hidden" /><span className="sr-only md:not-sr-only">{ui("Sign in")}</span></>)}
            </Link>
          </div>
        </div>
      </header>
      <nav aria-label={ui("Mobile navigation")} className="m-tabbar md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 h-[68px] max-w-lg mx-auto">
          {links.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${active(href) ? "text-primary" : "text-muted-foreground"}`}>
            <span className={`rounded-xl px-4 py-1 ${active(href) ? "bg-primary-light" : ""}`}>
              <Icon size={21} />
            </span>{ui(label)}</Link>)}
        </div>
      </nav>
    </>
  );
}
