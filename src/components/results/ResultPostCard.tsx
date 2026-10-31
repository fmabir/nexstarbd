"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Chip, mCard } from "@/components/mobile/ui/primitives";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/mobile/ui/icons";
import { toDate } from "@/lib/utils/formatDate";
import { resultPhotoUrl } from "@/lib/utils/resultPhotos";
import type { ResultPost } from "@/lib/types";

export interface CardPhoto {
  src: string;
  width: number;
  height: number;
}

/** What the card shows — built from a saved post, or from the admin's unsaved draft for the preview. */
export interface ResultPostView {
  title: string | null;
  body: string;
  tournamentId: string | null;
  tournamentName: string | null;
  /** null while it's still a draft: shown as "just now", how it will read once posted */
  postedAt: Date | null;
  photos: CardPhoto[];
}

export function toView(post: ResultPost): ResultPostView {
  return {
    title: post.title,
    body: post.body,
    tournamentId: post.tournamentId,
    tournamentName: post.tournamentName,
    postedAt: post.publishedAt ? toDate(post.publishedAt) : null,
    photos: post.photos.map((p) => ({ src: resultPhotoUrl(p.id), width: p.width, height: p.height })),
  };
}

/** One Results post: tournament tag, title, text, photos. Tapping a photo opens it full screen. */
export function ResultPostCard({ post, linkTournament = true }: { post: ResultPostView; linkTournament?: boolean }) {
  const [viewing, setViewing] = useState<number | null>(null);
  const close = useCallback(() => setViewing(null), []);
  const when = post.postedAt ? formatDistanceToNow(post.postedAt, { addSuffix: true }) : "just now";

  return (
    <article className={`${mCard} overflow-hidden`}>
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {post.tournamentName &&
            (linkTournament && post.tournamentId ? (
              <Link href={`/tournaments/${post.tournamentId}`} className="max-w-full">
                <Chip tone="gold" className="max-w-full truncate">{post.tournamentName}</Chip>
              </Link>
            ) : (
              <Chip tone="gold" className="max-w-full truncate">{post.tournamentName}</Chip>
            ))}
          <span className="text-[12px] text-m-faint">{when}</span>
        </div>
        {post.title && (
          <h2 className="mt-2.5 font-m-display font-bold text-[21px] leading-tight text-m-text break-words">{post.title}</h2>
        )}
        {post.body && (
          <p className="mt-1.5 text-[15px] leading-relaxed text-m-text whitespace-pre-line break-words">{post.body}</p>
        )}
      </div>

      {post.photos.length > 0 && <PhotoGrid photos={post.photos} onOpen={setViewing} />}

      {viewing !== null && <Lightbox photos={post.photos} start={viewing} onClose={close} />}
    </article>
  );
}

/**
 * One photo is shown whole. Two or more go in a grid of square crops (up to
 * four, the last one saying how many more), and open whole in the viewer.
 */
function PhotoGrid({ photos, onOpen }: { photos: CardPhoto[]; onOpen: (i: number) => void }) {
  if (photos.length === 1) {
    const [p] = photos;
    return (
      <button type="button" onClick={() => onOpen(0)} className="block w-full bg-m-raised" aria-label="Open photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.src}
          alt=""
          width={p.width}
          height={p.height}
          loading="lazy"
          decoding="async"
          className="block w-full h-auto max-h-[75vh] object-contain"
        />
      </button>
    );
  }

  const shown = photos.slice(0, 4);
  const more = photos.length - shown.length;
  return (
    <div className={`grid grid-cols-2 gap-0.5 ${photos.length === 3 ? "grid-rows-2" : ""}`}>
      {shown.map((p, i) => (
        <button
          key={p.src}
          type="button"
          onClick={() => onOpen(i)}
          // Three photos: the first runs the full height on the left
          className={`relative bg-m-raised ${photos.length === 3 && i === 0 ? "row-span-2" : "aspect-square"}`}
          aria-label={`Open photo ${i + 1} of ${photos.length}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.src} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          {more > 0 && i === shown.length - 1 && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-m-display font-bold text-[28px]">
              +{more}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Full-screen viewer. The photos sit in a horizontal snap scroller, so a
 * swipe moves between them natively; arrow keys and buttons do the same.
 * Portalled to <body> (see Sheet for why).
 */
function Lightbox({ photos, start, onClose }: { photos: CardPhoto[]; start: number; onClose: () => void }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);

  const go = useCallback((i: number) => {
    const rail = railRef.current;
    if (rail) rail.scrollTo({ left: i * rail.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (rail) rail.scrollLeft = start * rail.clientWidth;
  }, [start]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(Math.min(index + 1, photos.length - 1));
      if (e.key === "ArrowLeft") go(Math.max(index - 1, 0));
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [index, photos.length, go, onClose]);

  const arrow =
    "absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center disabled:opacity-0 transition-opacity";

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black m-fade-in" role="dialog" aria-modal="true" aria-label="Photos">
      <div
        ref={railRef}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none]"
      >
        {photos.map((p) => (
          <div key={p.src} className="relative w-full h-full shrink-0 snap-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" decoding="async" className="absolute inset-0 w-full h-full object-contain" />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between pl-4 pr-2 pt-[env(safe-area-inset-top)] h-14 text-white">
        <span className="text-[14px] font-medium tabular-nums">
          {photos.length > 1 && `${index + 1} / ${photos.length}`}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25"
          aria-label="Close"
        >
          <CloseIcon size={22} />
        </button>
      </div>

      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={`${arrow} left-3`} aria-label="Previous photo">
            <ChevronLeftIcon size={24} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === photos.length - 1}
            className={`${arrow} right-3`}
            aria-label="Next photo"
          >
            <ChevronRightIcon size={24} />
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
