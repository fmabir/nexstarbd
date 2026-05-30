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
  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClick(e: MouseEvent) {
      const drawer = document.querySelector('[data-mobile-menu]');
      const hamburger = document.querySelector('[data-hamburger]');
      if (drawer && !drawer.contains(e.target as Node) && !hamburger?.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Bangladesh flag accent line */}
      <div className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 group gap-2 sm:gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/banners/lnsbd.png"
                alt="NexStarBD"
                className="w-auto"
                style={{
                  height: "clamp(40px, 5vw, 56px)",
                  display: "block",
                }}
              />
              <div className="hidden sm:block">
                <p className="font-brand font-bold text-xl text-foreground tracking-tight">
                  NexStar<span className="text-primary">B</span><span className="text-green-700">D</span>
                </p>
                <p className="text-xs text-muted-foreground font-medium">Esports Platform</p>
              </div>
            </Link>

            {/* Nav links — center */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-gray-50 transition-colors duration-200 rounded-lg whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Profile / Login — right */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Mobile hamburger menu */}
              <button
                data-hamburger
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="shrink-0 relative" ref={profileRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setProfileOpen((v) => !v)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      aria-label="Profile menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {(user.displayName?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-sm font-medium text-foreground">
                        {user.displayName || user.email?.split("@")[0]}
                      </span>
                      <svg className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                              {(user.displayName?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              {user.displayName && (
                                <p className="text-sm font-semibold text-foreground truncate">{user.displayName}</p>
                              )}
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        {/* Sign out */}
                        <button
                          onClick={async () => { setProfileOpen(false); await signOut(); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div
            data-mobile-menu
            className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
          >
            {/* Drawer header with close button */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
              <span className="font-brand font-bold text-lg text-foreground">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
