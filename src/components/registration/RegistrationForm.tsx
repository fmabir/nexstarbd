"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { WaitlistBanner } from "./WaitlistBanner";
import { useToast } from "@/context/ToastContext";

interface TournamentState {
  allUids: string[];
  registeredCount: number;
  maxSlots: number;
  isRegistrationOpen: boolean;
  status: string;
}

interface PlayerInput {
  ign: string;
  uid: string;
}

export function RegistrationForm({ tournamentId }: { tournamentId: string }) {
  const t = useTranslations("registration");
  const router = useRouter();
  const { showToast } = useToast();

  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ isWaitlisted: boolean } | null>(null);

  const [squadName, setSquadName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [players, setPlayers] = useState<PlayerInput[]>([
    { ign: "", uid: "" },
    { ign: "", uid: "" },
    { ign: "", uid: "" },
    { ign: "", uid: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/register?tournamentId=${tournamentId}`)
      .then((r) => r.json())
      .then((data) => {
        setTournamentState(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tournamentId]);

  const updatePlayer = (index: number, field: keyof PlayerInput, value: string) => {
    setPlayers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!squadName.trim()) errs.squadName = "Squad name is required";
    if (!contactNumber.trim()) errs.contactNumber = "WhatsApp number is required";
    if (!players[0].ign.trim()) errs["player_0_ign"] = "Captain IGN is required";
    if (!players[0].uid.trim()) errs["player_0_uid"] = "Captain UID is required";

    // Client-side duplicate UID check
    const allUids = tournamentState?.allUids || [];
    players.forEach((p, i) => {
      if (p.uid && allUids.includes(p.uid.trim())) {
        errs[`player_${i}_uid`] = t("error_duplicate");
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    const activePlayers = players.filter((p) => p.ign.trim() || p.uid.trim());

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          squadName: squadName.trim(),
          contactNumber: contactNumber.trim(),
          players: activePlayers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || t("error_generic") });
        return;
      }

      setSuccess({ isWaitlisted: data.isWaitlisted });
      showToast(
        data.isWaitlisted ? t("waitlistSuccess") : t("success"),
        "success"
      );

      setTimeout(() => {
        router.push(`/tournaments/${tournamentId}`);
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tournamentState?.isRegistrationOpen || tournamentState?.status !== "upcoming") {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🔒</p>
        <p className="text-muted-foreground font-semibold">{t("error_closed")}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <p className="text-5xl mb-4">{success.isWaitlisted ? "⏳" : "🎉"}</p>
        <h3 className="font-display text-3xl text-foreground tracking-wide mb-2">
          {success.isWaitlisted ? t("waitlistSuccess") : t("success")}
        </h3>
        <p className="text-muted-foreground">
          {success.isWaitlisted ? t("waitlistMsg") : t("successMsg")}
        </p>
        <p className="text-sm text-muted-foreground mt-4">Redirecting to dashboard...</p>
      </div>
    );
  }

  const isFull = (tournamentState?.registeredCount || 0) >= (tournamentState?.maxSlots || 12);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isFull && <WaitlistBanner />}

      {errors.form && (
        <div className="bg-primary-light border border-primary rounded-xl px-4 py-3 text-primary text-sm font-medium">
          {errors.form}
        </div>
      )}

      {/* Squad Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">{t("squadName")} *</label>
          <input
            type="text"
            value={squadName}
            onChange={(e) => setSquadName(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. Fire Dragons"
          />
          {errors.squadName && <p className="text-primary text-xs mt-1">{errors.squadName}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{t("whatsapp")} *</label>
          <input
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="+880 1XXX-XXXXXX"
          />
          {errors.contactNumber && <p className="text-primary text-xs mt-1">{errors.contactNumber}</p>}
        </div>
      </div>

      {/* Players */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Players</h3>
        {players.map((player, i) => (
          <div key={i} className="bg-muted rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <span className="text-sm font-semibold">
                {t("player")} {i + 1} {i === 0 ? `(${t("captain")})` : i >= 2 ? `(${t("optional")})` : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">
                  {t("playerIGN")} {i === 0 ? "*" : ""}
                </label>
                <input
                  type="text"
                  value={player.ign}
                  onChange={(e) => updatePlayer(i, "ign", e.target.value)}
                  required={i === 0}
                  className="w-full border border-border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="In-game name"
                />
                {errors[`player_${i}_ign`] && (
                  <p className="text-primary text-xs mt-1">{errors[`player_${i}_ign`]}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">
                  {t("playerUID")} {i === 0 ? "*" : ""}
                </label>
                <input
                  type="text"
                  value={player.uid}
                  onChange={(e) => updatePlayer(i, "uid", e.target.value)}
                  required={i === 0}
                  className="w-full border border-border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Free Fire UID"
                />
                {errors[`player_${i}_uid`] && (
                  <p className="text-primary text-xs mt-1">{errors[`player_${i}_uid`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="submit"
        variant={isFull ? "outline" : "primary"}
        size="lg"
        loading={submitting}
        className="w-full"
      >
        {submitting
          ? t("submitting")
          : isFull
          ? t("waitlistBtn")
          : t("submit")}
      </Button>
    </form>
  );
}
