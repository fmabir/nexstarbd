"use client";

import { useTranslations } from "next-intl";
import { ArtTile, SectionBand, art, mBtn, mCard } from "@/components/mobile/ui/primitives";
import { WhatsAppIcon } from "@/components/mobile/ui/icons";

const WHATSAPP_URL = "https://chat.whatsapp.com/Eh3CuMwkzqFCCcC2GYARp4";

export function CommunitySection() {
  const t = useTranslations("community");

  return (
    <SectionBand tone="violet">
      <div className={`mx-4 ${mCard} p-3 pb-5`}>
        <ArtTile src={art.community} sizes="100vw" className="w-full h-52" />
        <h2 className="mt-4 px-2 font-m-display font-bold text-[26px] leading-tight text-m-text">{t("title")}</h2>
        <p className="mt-1 px-2 text-[14px] leading-snug text-m-dim">{t("subtitle")}</p>
        <div className="px-2">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`${mBtn.whatsapp} w-full mt-4`}>
            <WhatsAppIcon size={18} />
            {t("whatsapp")}
          </a>
        </div>
      </div>
    </SectionBand>
  );
}
