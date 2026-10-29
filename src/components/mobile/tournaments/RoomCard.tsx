"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Caption } from "@/components/mobile/ui/primitives";
import { CheckIcon, CopyIcon } from "@/components/mobile/ui/icons";

/** Room ID + password for approved squads once the tournament is live. */
export function RoomCard({ roomId, roomPassword }: { roomId: string; roomPassword: string }) {
  const t = useTranslations("dashboard");
  const [copied, setCopied] = useState<"id" | "pw" | null>(null);

  const copy = async (text: string, which: "id" | "pw") => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied((c) => (c === which ? null : c)), 2000);
  };

  const rows = [
    { label: t("roomId"), value: roomId, which: "id" as const },
    { label: t("roomPassword"), value: roomPassword, which: "pw" as const },
  ];

  return (
    <div className="rounded-2xl border border-m-red/40 bg-m-red/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-m-red animate-pulse" aria-hidden="true" />
        <h2 className="font-m-display font-semibold text-[20px] text-m-text">{t("roomInfo")}</h2>
      </div>
      <div className="space-y-2">
        {rows.map(({ label, value, which }) => (
          <div
            key={which}
            className="flex items-center justify-between gap-3 rounded-xl bg-m-surface border border-m-line pl-3.5 pr-2 py-2.5"
          >
            <div className="min-w-0">
              <Caption>{label}</Caption>
              <p className="font-sans font-bold text-[24px] leading-tight tracking-wide tabular-nums text-m-text break-all">{value}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(value, which)}
              className={`shrink-0 inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border text-[13px] font-semibold transition-colors ${
                copied === which
                  ? "bg-m-green/15 border-m-green/40 text-m-green-text"
                  : "bg-m-raised border-m-line text-m-text active:bg-m-line"
              }`}
            >
              {copied === which ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              {copied === which ? t("copied") : t("copy")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
