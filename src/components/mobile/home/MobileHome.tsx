import type { MvpPlayer, Sponsor, Tournament, Winner } from "@/lib/types";
import { HeroBanner } from "./HeroBanner";
import { HighlightsRail } from "./HighlightsRail";
import { LiveTournaments } from "./LiveTournaments";
import { AnnouncementsSection } from "./AnnouncementsSection";
import { UpcomingSection } from "./UpcomingSection";
import { CompletedSection } from "./CompletedSection";
import { HallOfFameSection } from "./HallOfFameSection";
import { SponsorsSection } from "./SponsorsSection";
import { CommunitySection } from "./CommunitySection";

/** Home page for phones — same sections as desktop, in the phone shell. */
export function MobileHome({
  winners,
  mvpPlayers,
  upcomingTournaments,
  sponsors,
}: {
  winners: Winner[];
  mvpPlayers: MvpPlayer[];
  upcomingTournaments: Tournament[];
  sponsors: Sponsor[];
}) {
  return (
    // Sections are full-width coloured bands that sit edge to edge
    <div className="md:hidden m-app">
      <HeroBanner />
      <div className="pt-5 pb-6">
        <HighlightsRail winners={winners} mvpPlayers={mvpPlayers} upcomingTournaments={upcomingTournaments} />
      </div>
      <LiveTournaments />
      <AnnouncementsSection />
      <UpcomingSection />
      <CompletedSection />
      <HallOfFameSection winners={winners} mvpPlayers={mvpPlayers} />
      <SponsorsSection sponsors={sponsors} />
      <CommunitySection />
    </div>
  );
}
