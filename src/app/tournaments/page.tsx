import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileTournaments } from "@/components/mobile/tournaments/MobileTournaments";

export default async function TournamentsPage() {
  const locale = await getLocale();

  return (
    <>
      <Navbar locale={locale} />
      <main id="main-content"><MobileTournaments /></main>
      <Footer />
    </>
  );
}
