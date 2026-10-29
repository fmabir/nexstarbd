"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons";

/**
 * Bottom sheet for the phone layout.
 *
 * Portalled to <body>: the top bar uses backdrop-filter, which turns it into
 * the containing block for fixed children, so a sheet rendered inside it
 * would be clipped to the bar.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 w-full bg-black/40 m-fade-in"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] flex flex-col rounded-t-3xl bg-m-surface border-t border-m-line m-sheet-in pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-center pt-2.5 pb-1" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-m-line-strong" />
        </div>
        {title && (
          <div className="flex items-center justify-between gap-3 pl-4 pr-2 h-12 shrink-0">
            <h2 className="font-m-display font-semibold text-[20px] text-m-text truncate">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-m-dim active:bg-m-raised"
              aria-label="Close"
            >
              <CloseIcon size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto overscroll-contain px-4 pb-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
