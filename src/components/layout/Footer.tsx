
import { useUiText } from "@/components/i18n/ui-text";
import Link from "next/link";
import { Wordmark } from "@/components/mobile/ui/primitives";
import { FooterCommunityLink } from "@/components/ui/CommunityLinkButton";

export function Footer() {
  const ui = useUiText();

  return (
    <footer className="border-t border-border bg-white mt-4">
      <div className="max-w-[1168px] mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Wordmark size={24} />
          <p className="mt-2 text-xs text-muted-foreground">{ui("Made for the Bangladesh Free Fire community.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/rules" className="py-2 hover:text-primary">{ui("Rules")}</Link>
          <Link href="/hall-of-fame" className="py-2 hover:text-primary">{ui("Hall of Fame")}</Link>
          <FooterCommunityLink href="https://chat.whatsapp.com/Eh3CuMwkzqFCCcC2GYARp4" label={ui("Community")} />
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()}{ui("NexStarBD")}</p>
      </div>
    </footer>
  );
}
