"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminBrand, isActive, navItems } from "./AdminSidebar";
import { LogoutIcon } from "./icons";

/** Phone and tablet navigation: a slim top bar, then every section as a scrollable row of pills. */
export function AdminMobileNav() {
  const ui = useUiText();

  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  // Keep the current section's pill in view, e.g. Sponsors at the far end
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="lg:hidden sticky top-0 z-30 bg-(--ad-surface)/95 backdrop-blur border-b border-(--ad-line)">
      <div className="flex items-center justify-between h-14 pl-4 pr-2">
        <Link href="/" aria-label={ui("NexStarBD home")}>
          <AdminBrand size={26} />
        </Link>
        <div className="flex items-center gap-2"><LanguageToggle /><button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-[13px] font-semibold text-(--ad-dim) hover:bg-(--ad-raised)"
        >
          <LogoutIcon size={17} />{ui("Sign out")}</button></div>
      </div>

      <nav ref={navRef} aria-label={ui("Admin")} className="flex gap-1.5 overflow-x-auto px-3 pb-2.5 [scrollbar-width:none]">
        {navItems.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-1.5 shrink-0 h-9 px-3 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors ${
                active
                  ? "bg-(--ad-accent) border-transparent text-white"
                  : "bg-(--ad-surface) border-(--ad-line) text-(--ad-dim)"
              }`}
            >
              <item.Icon size={16} />
              {ui(item.short)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
