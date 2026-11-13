"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton, Field, Toggle, fieldClass, textareaClass } from "./ui";
import { PlusIcon } from "./icons";
import { useToast } from "@/context/ToastContext";

export function CreateTournamentForm() {
  const ui = useUiText();

  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    mode: "Squad (BR)",
    prizePool: "",
    firstPrize: "",
    secondPrize: "",
    registrationFee: "",
    bkashNumber: "",
    startsAt: "",
    registrationDeadline: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          isFree,
          startsAt: new Date(form.startsAt).toISOString(),
          registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast(ui("Tournament created!"), "success");
      setIsFree(true);
      setForm({ name: "", description: "", mode: "Squad (BR)", prizePool: "", firstPrize: "", secondPrize: "", registrationFee: "", bkashNumber: "", startsAt: "", registrationDeadline: "" });
      router.refresh();
    } catch {
      showToast(ui("Failed to create tournament"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label={ui("Tournament name *")} wide>
        <input required value={form.name} onChange={set("name")} className={fieldClass} placeholder={ui("BD Free Fire Clash #1")} />
      </Field>

      <Field label={ui("Description")} wide>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={2}
          className={`${textareaClass} resize-none`}
          placeholder={ui("Tournament description...")}
        />
      </Field>

      <Field label={ui("Mode *")}>
        <select required value={form.mode} onChange={set("mode")} className={fieldClass}>
          <option value="Squad (BR)">{ui("Squad (BR)")}</option>
          <option value="Duo">{ui("Duo")}</option>
          <option value="Solo">{ui("Solo")}</option>
        </select>
      </Field>

      <Field label={ui("Total prize pool *")}>
        <input required value={form.prizePool} onChange={set("prizePool")} className={fieldClass} placeholder="৳5,000" />
      </Field>

      <Field label={ui("1st prize")}>
        <input value={form.firstPrize} onChange={set("firstPrize")} className={fieldClass} placeholder="৳3,000" />
      </Field>

      <Field label={ui("2nd prize")}>
        <input value={form.secondPrize} onChange={set("secondPrize")} className={fieldClass} placeholder="৳1,500" />
      </Field>

      {/* Free / paid */}
      <div className="sm:col-span-2">
        <Toggle
          on={isFree}
          onToggle={() => setIsFree((v) => !v)}
          label={ui(isFree ? "Free entry" : "Paid entry")}
          description={isFree ? "No registration fee. Turn off to charge a fee." : "Squads pay a fee by bKash; you verify it before approving."}
        />
      </div>

      {/* Fee and bKash number — paid tournaments only */}
      {!isFree && (
        <>
          <Field label={ui("Registration fee *")}>
            <input required value={form.registrationFee} onChange={set("registrationFee")} className={fieldClass} placeholder="৳50" />
          </Field>
          <Field label={ui("bKash Send Money number *")} hint={ui("Players will send payments to this number during registration.")}>
            <input
              required
              type="tel"
              value={form.bkashNumber}
              onChange={set("bkashNumber")}
              className={fieldClass}
              placeholder={ui("+880 1XXX-XXXXXX")}
            />
          </Field>
        </>
      )}

      <Field label={ui("Start date & time *")}>
        <input required type="datetime-local" value={form.startsAt} onChange={set("startsAt")} className={fieldClass} />
      </Field>

      <Field label={ui("Registration deadline *")}>
        <input
          required
          type="datetime-local"
          value={form.registrationDeadline}
          onChange={set("registrationDeadline")}
          className={fieldClass}
        />
      </Field>

      <div className="sm:col-span-2 pt-1">
        <AdminButton type="submit" loading={loading}>
          {!loading && <PlusIcon size={18} />}{ui("Create tournament")}</AdminButton>
      </div>
    </form>
  );
}
