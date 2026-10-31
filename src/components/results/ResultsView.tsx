"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useResultPosts } from "@/lib/hooks/useResultPosts";
import { ResultPostCard, toView } from "@/components/results/ResultPostCard";
import { EmptyState, PageHeader, Skeleton, art, mBtn, mCard } from "@/components/mobile/ui/primitives";
import { AlertIcon, ChevronRightIcon, CrownIcon, LockIcon, TrophyIcon } from "@/components/mobile/ui/icons";

/**
 * The Results page, phone and desktop. Members see the feed; anyone else
 * gets a sign-in prompt. The Hall of Fame stays public and is linked at the top.
 */
export function ResultsView() {
  const t = useTranslations("results");
  const { posts, loading, locked, error } = useResultPosts();

  const content = (
    <div className="space-y-4">
      <Link href="/hall-of-fame" className={`${mCard} flex items-center gap-3 p-3 active:bg-m-raised hover:bg-m-raised transition-colors`}>
        <span className="w-11 h-11 rounded-xl bg-m-gold/20 text-m-gold-text flex items-center justify-center shrink-0">
          <CrownIcon size={22} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-m-display font-semibold text-[17px] leading-tight text-m-text">{t("hallOfFame")}</span>
          <span className="block text-[13px] text-m-dim">{t("hallOfFameText")}</span>
        </span>
        <ChevronRightIcon size={18} className="text-m-faint shrink-0" />
      </Link>

      {locked ? (
        <div className={`${mCard} flex flex-col items-center text-center px-6 py-10`}>
          <span className="w-14 h-14 rounded-full bg-m-red/10 text-m-red-text flex items-center justify-center mb-4">
            <LockIcon size={26} />
          </span>
          <p className="font-m-display font-bold text-[21px] leading-tight text-m-text">{t("lockedTitle")}</p>
          <p className="mt-1.5 text-[14px] text-m-dim max-w-[19rem]">{t("lockedText")}</p>
          <Link href="/login?next=/results" className={`${mBtn.primary} mt-5 w-full max-w-[19rem]`}>
            {t("signIn")}
          </Link>
        </div>
      ) : loading ? (
        <>
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </>
      ) : error ? (
        <div className={`${mCard} flex flex-col items-center text-center px-6 py-10`}>
          <span className="w-12 h-12 rounded-full bg-m-raised text-m-dim flex items-center justify-center mb-3">
            <AlertIcon size={22} />
          </span>
          <p className="text-[15px] font-semibold text-m-text">{t("error")}</p>
          <button type="button" onClick={() => window.location.reload()} className={`${mBtn.secondary} mt-4`}>
            {t("retry")}
          </button>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={<TrophyIcon size={22} />} title={t("empty")} text={t("emptyText")} />
      ) : (
        posts.map((p) => <ResultPostCard key={p.id} post={toView(p)} />)
      )}
    </div>
  );

  return (
    <>
      <div className="md:hidden m-app">
        <PageHeader title={t("title")} subtitle={t("subtitle")} art={art.trophy} />
        <div className="px-4">{content}</div>
      </div>

      <div className="hidden md:block min-h-screen bg-background">
        <div className="bg-gray-900 text-white py-14">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h1 className="font-display text-5xl sm:text-6xl tracking-wide mb-3">{t("title")}</h1>
            <p className="text-gray-400">{t("subtitle")}</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-12">{content}</div>
      </div>
    </>
  );
}
