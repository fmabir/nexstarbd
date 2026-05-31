import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { Button } from "@/components/ui/Button";
import { getSessionUser } from "@/lib/server/session";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect(`/login?next=/register/${tournamentId}`);
  }

  const locale = await getLocale();
  const t = await getTranslations("registration");

  let tournamentName = "Tournament";
  let bkashNumber: string | null = null;
  let registrationFee: string | null = null;
  let isFree = true;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("tournaments").doc(tournamentId).get();
    if (doc.exists) {
      const data = doc.data()!;
      tournamentName = data.name;
      bkashNumber = data.bkashNumber ?? null;
      registrationFee = data.registrationFee ?? null;
      isFree = data.isFree ?? true;
    }
  } catch {}

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-muted py-10">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <Button href={`/tournaments/${tournamentId}`} variant="ghost" size="sm">
              ← Back to Dashboard
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">
            <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-1">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {tournamentName}
            </p>

            {!isFree && bkashNumber && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">💳 Payment Required</p>
                <p className="text-sm text-amber-900">
                  Send <span className="font-bold">{registrationFee}</span> via bKash <span className="font-semibold">Send Money</span> to:
                </p>
                <p className="font-mono text-lg font-bold text-amber-900 mt-1 tracking-wider">{bkashNumber}</p>
                <p className="text-xs text-amber-700 mt-2">Enter your bKash transaction ID in the form below after payment.</p>
              </div>
            )}

            <RegistrationForm tournamentId={tournamentId} userId={sessionUser.uid} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
