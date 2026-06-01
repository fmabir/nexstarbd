"use client";

import { useTranslations } from "next-intl";
import { CommunityLinkButton } from "@/components/ui/CommunityLinkButton";

const WHATSAPP_URL = "https://chat.whatsapp.com/Eh3CuMwkzqFCCcC2GYARp4";

export function CommunityLinks() {
  const t = useTranslations("community");

  return (
    <section id="community" className="py-16 bg-white/80 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide mb-2">
          {t("title")}
        </h2>
        <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground mb-10">{t("subtitle")}</p>

        <div className="flex justify-center">
          <CommunityLinkButton
            href={WHATSAPP_URL}
            label={t("whatsapp")}
            icon={
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.121 1.531 5.852L0 24l6.335-1.524A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.002-1.37l-.359-.213-3.728.897.931-3.626-.234-.372A9.818 9.818 0 0 1 12 2.182c5.427 0 9.818 4.391 9.818 9.818S17.427 21.818 12 21.818z" />
              </svg>
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          />
        </div>
      </div>
    </section>
  );
}
