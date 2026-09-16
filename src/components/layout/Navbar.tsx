"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#upcoming-tournaments", label: "Tournaments" },
  { href: "/hall-of-fame", label: "Results" },
  { href: "/rules", label: "Rules" },
];

// locale prop kept so callers don't need to change
export function Navbar({ locale: _locale }: { locale: string }) {
  const { user, isAdmin, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close the profile dropdown on an outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Hold the page still behind the open sheet
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Escape closes either overlay
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setProfileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const sheetLinks = isAdmin
    ? [...navLinks, { href: "/admin", label: "Admin Dashboard" }]
    : navLinks;

  return (
    <>
      {/*
        Apple's bar: slim, translucent, and blurred so the page tints it as it
        scrolls underneath. saturate lifts the colour the blur washes out.
      */}
      <header className="sticky top-0 z-40">
        <div className="bg-surface/70 backdrop-blur-xl backdrop-saturate-[180%] border-b border-green-900/10">
          <nav className="max-w-6xl mx-auto px-2 sm:px-6">
            <div className="relative flex items-center justify-between h-11 sm:h-12">

              {/* Left — menu button (mobile only) */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden flex flex-col items-center justify-center w-11 h-11 -ml-1 shrink-0"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="nav-sheet"
              >
                <span
                  className={`block w-[17px] h-[1.5px] bg-foreground rounded-full transition-transform duration-300 ease-out ${
                    menuOpen ? "translate-y-[3.25px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block w-[17px] h-[1.5px] bg-foreground rounded-full mt-[5px] transition-transform duration-300 ease-out ${
                    menuOpen ? "-translate-y-[3.25px] -rotate-45" : ""
                  }`}
                />
              </button>

              {/* Brand — centred on mobile, flush left on desktop */}
              <Link
                href="/"
                className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center gap-1.5 shrink-0 h-11"
                aria-label="NexStarBD home"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/banners/lnsbd.png"
                  alt=""
                  aria-hidden="true"
                  className="w-auto h-[26px] sm:h-[28px] block"
                />
                <span className="font-brand text-[15px] sm:text-base text-foreground">
                  NexStar<span className="text-pink-800">B</span><span className="text-green-800">D</span>
                </span>
              </Link>

              {/* Centre — links (desktop) */}
              <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[13px] tracking-[-0.01em] text-foreground/75 hover:text-foreground transition-colors duration-200 whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-[13px] tracking-[-0.01em] text-primary hover:text-primary-dark transition-colors duration-200 whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}
              </div>

              {/* Right — account */}
              <div className="flex items-center shrink-0 ml-auto md:ml-0" ref={profileRef}>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen((v) => !v)}
                      className="flex items-center justify-center w-11 h-11 md:w-auto md:h-auto md:gap-2 md:px-2 md:py-1.5 rounded-full transition-colors duration-200"
                      aria-label="Account menu"
                      aria-expanded={profileOpen}
                    >
                      <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-semibold">
                        {(user.displayName?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                      </span>
                      <span className="hidden md:inline text-[13px] text-foreground/75 max-w-[10rem] truncate">
                        {user.displayName || user.email?.split("@")[0]}
                      </span>
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl bg-surface/95 backdrop-blur-xl border border-green-900/10 shadow-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-green-900/10">
                          {user.displayName && (
                            <p className="text-[13px] font-semibold text-foreground truncate">{user.displayName}</p>
                          )}
                          <p className="text-[12px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center min-h-11 px-4 text-[13px] text-foreground hover:bg-green-900/5 transition-colors"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={async () => { setProfileOpen(false); await signOut(); }}
                          className="flex items-center w-full min-h-11 px-4 text-[13px] text-primary hover:bg-green-900/5 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="group inline-flex items-center justify-center h-11 -mr-1 px-1"
                  >
                    <span className="inline-flex items-center justify-center h-8 px-4 rounded-full bg-primary group-hover:bg-primary-dark text-white text-[13px] font-medium transition-colors duration-200">
                      Sign In
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile sheet — drops out from under the bar rather than sliding in
            from the side, the way Apple's small-screen nav opens. */}
        <div
          id="nav-sheet"
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            menuOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-surface/95 backdrop-blur-xl border-b border-green-900/10 px-5 pb-3">
            {sheetLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center min-h-[52px] text-[19px] tracking-[-0.02em] font-medium text-foreground border-b border-green-900/[0.07] last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Dimmer for the page behind the sheet */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-green-900/20"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
