
import { createUiText } from "@/components/i18n/ui-text";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileRegistrationForm } from "@/components/mobile/registration/MobileRegistrationForm";
import { PageHeader } from "@/components/mobile/ui/primitives";
import { getSessionUser } from "@/lib/server/session";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const ui = createUiText(await getLocale());

  const { tournamentId } = await params;

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect(`/login?next=/register/${tournamentId}`);
  }

  const locale = await getLocale();
  const t = await getTranslations("registration");

  let tournamentName = "Tournament";
  let registrationFee: string | null = null;
  let isFree = true;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("tournaments").doc(tournamentId).get();
    if (doc.exists) {
      const data = doc.data()!;
      tournamentName = data.name;
      registrationFee = data.registrationFee ?? null;
      isFree = data.isFree ?? true;
    }
  } catch {}

  return (
    <>
      <Navbar locale={locale} />
      <main id="main-content">
        <div className="player-narrow">
          <PageHeader title={ui(t("title"))} subtitle={ui(tournamentName)} back={{ href: `/tournaments/${tournamentId}`, label: "Tournament" }} />
          <div className="px-4">
            <div className="mb-5 rounded-xl border border-border bg-white p-4 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{ui(isFree ? "No entry fee for this tournament" : "Tournament entry fee")}</span>
              <span className={`font-semibold shrink-0 ${isFree ? "text-secondary" : "text-foreground"}`}>{ui(isFree ? "Free entry" : registrationFee || "Fee applies")}</span>
            </div>
            <MobileRegistrationForm tournamentId={tournamentId} userId={sessionUser.uid} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
