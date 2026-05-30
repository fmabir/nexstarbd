"use client";

import { useState } from "react";

function ComingSoonModal({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h3 className="font-brand font-bold text-xl text-foreground mb-2">Coming Soon</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Our <span className="font-semibold text-foreground">{label}</span> community hasn&apos;t launched yet. Stay tuned — we&apos;ll announce it here when it&apos;s ready!
        </p>
        <button
          onClick={onClose}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors w-full"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function CommunityLinkButton({
  href,
  label,
  icon,
  className,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  className?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const isPlaceholder = !href || href.includes("placeholder") || href === "#";

  if (isPlaceholder) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-3 font-semibold px-6 py-4 rounded-2xl transition-all active:scale-95 shadow-sm opacity-70 cursor-pointer ${className}`}
        >
          {icon}
          <span>{label}</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Soon</span>
        </button>
        {showModal && <ComingSoonModal label={label} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 font-semibold px-6 py-4 rounded-2xl transition-all active:scale-95 shadow-sm ${className}`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

export function FooterCommunityLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const isPlaceholder = !href || href.includes("placeholder") || href === "#";

  if (isPlaceholder) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          {label}
          <span className="text-xs text-muted-foreground/60">(soon)</span>
        </button>
        {showModal && <ComingSoonModal label={label} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary transition-colors">
      {label}
    </a>
  );
}
