"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useEffect, useRef } from "react";
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
  const ui = useUiText();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]') ?? []);
    (focusable()[0] ?? panel)?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) { e.preventDefault(); panel?.focus(); }
        else if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={ui(title || "Details")}>
      <button
        type="button"
        className="absolute inset-0 w-full bg-black/40 m-fade-in"
        onClick={onClose}
        aria-label={ui("Close")}
      />
      <div ref={panelRef} tabIndex={-1} className="absolute inset-x-0 bottom-0 md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(640px,90vw)] md:rounded-2xl max-h-[85dvh] flex flex-col rounded-t-3xl bg-m-surface border-t border-m-line m-sheet-in pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-center pt-2.5 pb-1" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-m-line-strong" />
        </div>
        {title && (
          <div className="flex items-center justify-between gap-3 pl-4 pr-2 h-12 shrink-0">
            <h2 className="font-m-display font-semibold text-[20px] text-m-text truncate">{ui(title)}</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-m-dim active:bg-m-raised"
              aria-label={ui("Close")}
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
