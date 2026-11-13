import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlayerAccount } from "@/components/registration/PlayerAccount";

export default async function AccountPage() {
  const locale = await getLocale();
  return <>
    <Navbar locale={locale} />
    <main id="main-content">
      <PlayerAccount />
    </main>
    <Footer />
  </>;
}
