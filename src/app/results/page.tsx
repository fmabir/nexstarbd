import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResultsView } from "@/components/results/ResultsView";

export default async function ResultsPage() {
  const locale = await getLocale();

  return (
    <>
      <Navbar locale={locale} />
      <main>
        <ResultsView />
      </main>
      <Footer />
    </>
  );
}
