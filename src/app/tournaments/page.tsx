import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UpcomingTournaments } from "@/components/home/UpcomingTournaments";

export default async function TournamentsPage() {
  const locale = await getLocale();

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-muted">
        <div className="bg-gray-900 text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-display text-5xl sm:text-6xl tracking-wide mb-2">
              All Tournaments
            </h1>
            <p className="text-gray-400">
              Join the battle — register your squad today
            </p>
          </div>
        </div>
        <UpcomingTournaments />
      </main>
      <Footer />
    </>
  );
}
