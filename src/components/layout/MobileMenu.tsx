"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations("nav");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "/", label: t("home") },
    { href: "/#upcoming-tournaments", label: t("tournaments") },
    { href: "/hall-of-fame", label: t("hallOfFame") },
    { href: "/rules", label: t("rules") },
    { href: "/#community", label: t("community") },
  ];

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <span className="font-display text-2xl text-primary tracking-wide">nextstarBD</span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block px-4 py-3 rounded-xl text-base font-semibold text-foreground hover:bg-primary-light hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 py-5 border-t border-border">
          <Link
            href="/#upcoming-tournaments"
            onClick={onClose}
            className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Register Now
          </Link>
        </div>
      </div>
    </>
  );
}
