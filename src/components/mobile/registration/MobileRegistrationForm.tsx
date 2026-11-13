"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { Children, useId } from "react";
import { useRegistrationForm } from "@/lib/hooks/useRegistrationForm";
import { Caption, EmptyState, mBtn, mCard, mInput } from "@/components/mobile/ui/primitives";
import { AlertIcon, LockIcon, WalletIcon } from "@/components/mobile/ui/icons";

// Shown when a paid tournament has no bKash number of its own (matches desktop)
const FALLBACK_BKASH = "01757788900";

function Field({
  label,
  error,
  hint,
  ...input
}: { label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const ui = useUiText();

  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block mb-1.5 text-[14px] font-medium text-m-text">
        {ui(label)}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        className={`${mInput} ${error ? "border-m-red" : ""}`}
        {...input}
      />
      {hint && !error && <p className="mt-1.5 text-[12px] text-m-faint">{ui(hint)}</p>}
      {error && <p className="mt-1.5 text-[13px] text-m-red-text">{ui(error)}</p>}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const ui = useUiText();

  return (
    <div role="group" aria-label={ui(title)} className={`${mCard} p-3 space-y-2`}>
      <Caption>{ui(title)}</Caption>
      <div className={Children.count(children) > 1 ? "grid sm:grid-cols-2 gap-3 items-start" : "space-y-3"}>{children}</div>
    </div>
  );
}

export function MobileRegistrationForm({ tournamentId, userId }: { tournamentId: string; userId: string }) {
  const ui = useUiText();

  const f = useRegistrationForm(tournamentId, userId);

  if (f.loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!f.ts?.isRegistrationOpen) {
    return (
      <EmptyState
        icon={<LockIcon size={22} />}
        title={ui("Registration is currently closed.")}
        text={ui("Check back later for upcoming tournaments.")}
      />
    );
  }

  const paid = !f.ts.isFree;

  return (
    <form onSubmit={f.handleSubmit} className="space-y-3" noValidate>
      {f.isFull && (
        <div className="flex gap-3 rounded-2xl border border-m-amber/35 bg-m-amber/10 p-4 text-[14px] text-m-text">
          <AlertIcon size={20} className="shrink-0 text-m-amber-text" />
          <p>{ui("All")}{f.ts.maxSlots}{ui("slots are full. You will be added to the")}{ui(" ")}
            <strong className="text-m-amber-text">{ui("waiting list")}</strong>.
          </p>
        </div>
      )}

      {f.formError && (
        <div className="rounded-2xl border border-m-red/40 bg-m-red/10 px-4 py-3 text-[14px] text-m-red-text" role="alert">
          {ui(f.formError)}
        </div>
      )}

      <Group title={ui("Squad")}>
        <Field
          label={ui("Squad name *")}
          type="text"
          value={f.squadName}
          onChange={(e) => f.setSquadName(e.target.value)}
          placeholder={ui("e.g. Fire Dragons")}
          error={f.errors.squadName}
        />
      </Group>

      <Group title={ui("Squad leader")}>
        <Field
          label={ui("Leader name *")}
          type="text"
          value={f.leaderName}
          onChange={(e) => f.setLeaderName(e.target.value)}
          placeholder={ui("In-game name")}
          error={f.errors.leaderName}
        />
        <Field
          label={ui("Leader UID *")}
          type="text"
          inputMode="numeric"
          value={f.leaderUid}
          onChange={(e) => f.setLeaderUid(e.target.value)}
          placeholder={ui("Free Fire UID")}
          error={f.errors.leaderUid}
        />
      </Group>

      <Group title={ui("Contact")}>
        <Field
          label={ui("WhatsApp number *")}
          type="tel"
          value={f.whatsapp}
          onChange={(e) => f.setWhatsapp(e.target.value)}
          placeholder={ui("+880 1XXX-XXXXXX")}
          error={f.errors.whatsapp}
        />
        <Field
          label={ui("bKash number (leader)")}
          type="tel"
          value={f.bkash}
          onChange={(e) => f.setBkash(e.target.value)}
          placeholder={ui("+880 1XXX-XXXXXX")}
        />
      </Group>

      {paid && (
        <Group title={ui("Payment verification")}>
          <div className="flex items-center gap-3 rounded-xl border border-m-amber/35 bg-m-amber/10 p-3.5">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-m-amber/15 text-m-amber-text flex items-center justify-center">
              <WalletIcon size={20} />
            </span>
            <div className="min-w-0">
              <Caption color="text-m-amber-text">{ui("Send")}{f.ts.registrationFee ?? "the fee"}{ui("· bKash Send Money (Personal)")}</Caption>
              <p className="font-mono text-[20px] font-bold tracking-widest text-m-text">
                {f.ts.bkashNumber ?? FALLBACK_BKASH}
              </p>
            </div>
          </div>
          <Field
            label={ui("Transaction ID *")}
            type="text"
            value={f.transactionId}
            onChange={(e) => f.setTransactionId(e.target.value)}
            placeholder={ui("e.g., TXN1234567890")}
            hint={ui("Enter the transaction ID you received after sending via bKash Send Money.")}
            error={f.errors.transactionId}
          />
        </Group>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={f.submitting}
          className={`${f.isFull ? mBtn.warning : mBtn.primary} w-full disabled:opacity-60`}
        >
          {ui(f.submitting ? "Submitting…" : f.isFull ? "Join waiting list" : "Register squad")}
        </button>
      </div>
    </form>
  );
}
