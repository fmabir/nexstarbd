import { Wordmark } from "@/components/mobile/ui/primitives";
import { WhatsAppIcon } from "@/components/mobile/ui/icons";

const WHATSAPP_URL = "https://chat.whatsapp.com/Eh3CuMwkzqFCCcC2GYARp4";

/** Navigation lives in the tab bar, so the phone footer is just identity and community. */
export function MobileFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="md:hidden m-app mt-10 px-4 pt-8 pb-8 border-t border-m-line text-center">
      <div className="flex justify-center">
        <Wordmark size={24} />
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-m-dim max-w-[18rem] mx-auto">
        Bangladesh&apos;s free community platform for Free Fire esports tournaments.
      </p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-full border border-m-line text-[13px] font-medium text-m-text active:bg-m-raised"
      >
        <WhatsAppIcon size={16} className="text-m-green-text" />
        WhatsApp Community
      </a>
      <p className="mt-6 text-[12px] text-m-faint">
        © {year} NexStarBD · Built for the Bangladesh Free Fire community 🇧🇩
      </p>
    </footer>
  );
}
