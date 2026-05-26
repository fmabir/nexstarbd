"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface RoomInfoCardProps {
  roomId: string;
  roomPassword: string;
}

export function RoomInfoCard({ roomId, roomPassword }: RoomInfoCardProps) {
  const t = useTranslations("dashboard");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPw, setCopiedPw] = useState(false);

  const copy = async (text: string, which: "id" | "pw") => {
    await navigator.clipboard.writeText(text);
    if (which === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPw(true);
      setTimeout(() => setCopiedPw(false), 2000);
    }
  };

  return (
    <div className="bg-primary-light border-2 border-primary rounded-2xl p-5 animate-pulse-once">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
        <h3 className="font-display text-xl text-primary tracking-wide">{t("roomInfo")}</h3>
      </div>

      <div className="space-y-3">
        {[
          { label: t("roomId"), value: roomId, which: "id" as const, copied: copiedId },
          { label: t("roomPassword"), value: roomPassword, which: "pw" as const, copied: copiedPw },
        ].map(({ label, value, which, copied }) => (
          <div key={label} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                {label}
              </p>
              <p className="font-display text-2xl text-foreground tracking-widest">{value}</p>
            </div>
            <button
              onClick={() => copy(value, which)}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors"
            >
              {copied ? "✓ " + t("copied") : t("copy")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
