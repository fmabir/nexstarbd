"use client";

import Link from "next/link";
import { useCompletedTournaments } from "@/lib/hooks/useCompletedTournaments";
import { resolveBanner } from "@/lib/utils/bannerUrl";
import { formatDateOnly } from "@/lib/utils/formatDate";
import { Section, mCard } from "@/components/mobile/ui/primitives";
import { ChevronRightIcon } from "@/components/mobile/ui/icons";

/** Horizontal rail of finished tournaments, each opening its results. */
export function CompletedSection() {
  const { tournaments, loading } = useCompletedTournaments();

  if (loading || tournaments.length === 0) return null;

  return (
    <Section
      title="Previous tournaments"
      tone="slate"
      action={<span className="text-[13px] text-m-faint">{tournaments.length} completed</span>}
    >
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 scroll-px-4">
        {tournaments.map((t) => {
          const banner = resolveBanner(t.bannerUrl, t.id);
          return (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className={`snap-start shrink-0 w-[168px] ${mCard} overflow-hidden active:bg-m-raised transition-colors`}
            >
              <div className="relative aspect-[16/9] bg-m-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.src}
                  style={{ objectPosition: banner.position }}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-[14px] font-semibold leading-snug text-m-text line-clamp-2 min-h-[2.6em]">{t.name}</p>
                <p className="mt-1 text-[12px] text-m-faint">{formatDateOnly(t.startsAt)}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-m-gold-text truncate">{t.prizePool}</span>
                  <span className="inline-flex items-center text-[12px] font-medium text-m-red-text shrink-0">
                    Results
                    <ChevronRightIcon size={14} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
