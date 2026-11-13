
import { useUiText } from "@/components/i18n/ui-text";
import Link from "next/link";
import type { ApprovalStatus, TournamentStatus } from "@/lib/types";
import { ChevronLeftIcon } from "./icons";

/*
 * Building blocks for the admin panel. Admin-only on purpose: the public
 * site's shared components can change without moving anything here.
 * Colours come from admin.module.css (the --ad-* variables).
 */

/* ── Buttons ─────────────────────────────────────────────────── */
type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger" | "dangerSoft";
type ButtonSize = "sm" | "md";

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl border transition-colors select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ad-accent) whitespace-nowrap";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-(--ad-accent) hover:bg-(--ad-accent-press) border-transparent text-white",
  secondary: "bg-(--ad-surface) hover:bg-(--ad-raised) border-(--ad-line-strong) text-(--ad-text)",
  ghost: "bg-transparent hover:bg-(--ad-raised) border-transparent text-(--ad-dim)",
  success: "bg-(--ad-success) hover:brightness-95 border-transparent text-white",
  danger: "bg-(--ad-danger) hover:brightness-95 border-transparent text-white",
  dangerSoft: "bg-(--ad-danger-soft) hover:brightness-95 border-transparent text-(--ad-danger)",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-11 px-5 text-sm",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]}`;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function AdminButton({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  type = "button",
  disabled,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      className={`${buttonClass(variant, size)} ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

/** Small text action in a list row: Edit, Delete, Publish… */
export function RowAction({
  tone = "neutral",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "neutral" | "accent" | "danger" | "success" }) {
  const color = {
    neutral: "text-(--ad-dim) hover:text-(--ad-text)",
    accent: "text-(--ad-accent) hover:text-(--ad-accent-press)",
    danger: "text-(--ad-danger)",
    success: "text-(--ad-success)",
  }[tone];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center gap-1 h-8 px-2 -mx-1 rounded-lg text-[13px] font-semibold hover:bg-(--ad-raised) disabled:opacity-50 transition-colors ${color} ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Forms ───────────────────────────────────────────────────── */
export const fieldClass =
  "w-full h-11 rounded-xl border border-(--ad-line-strong) bg-(--ad-surface) px-3.5 text-sm text-(--ad-text) placeholder:text-(--ad-faint) focus:outline-none focus:border-(--ad-accent) focus:ring-3 focus:ring-(--ad-accent)/15 transition-colors";

export const textareaClass = `${fieldClass} h-auto py-2.5 leading-relaxed`;

export function Field({
  label,
  hint,
  wide = false,
  children,
}: {
  label: string;
  hint?: string;
  /** Spans both columns of a two-column form */
  wide?: boolean;
  children: React.ReactNode;
}) {
  const ui = useUiText();

  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="block text-[13px] font-semibold text-(--ad-text) mb-1.5">{ui(label)}</span>
      {children}
      {hint && <span className="block text-xs text-(--ad-faint) mt-1.5">{ui(hint)}</span>}
    </label>
  );
}

/** On/off switch. Behaves like the old free/paid toggle: click flips it. */
export function Toggle({
  on,
  onToggle,
  label,
  description,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
}) {
  const ui = useUiText();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex items-center gap-3 w-full text-left rounded-xl border border-(--ad-line) bg-(--ad-raised) px-4 py-3"
    >
      <span className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${on ? "bg-(--ad-accent)" : "bg-(--ad-line-strong)"}`}>
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`}
        />
      </span>
      <span>
        <span className="block text-sm font-semibold text-(--ad-text)">{ui(label)}</span>
        {description && <span className="block text-xs text-(--ad-dim)">{description}</span>}
      </span>
    </button>
  );
}

/** Pick-one buttons, e.g. announcement type. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const ui = useUiText();

  return (
    <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-(--ad-raised)">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`h-8 px-3 rounded-lg text-[13px] font-semibold transition-colors ${
            value === o.value ? "bg-(--ad-surface) text-(--ad-text) shadow-sm" : "text-(--ad-dim) hover:text-(--ad-text)"
          }`}
        >
          {ui(o.label)}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className = "",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}) {
  const ui = useUiText();

  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer text-sm text-(--ad-text) ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded cursor-pointer"
      />
      {ui(label)}
    </label>
  );
}

/* ── Surfaces ────────────────────────────────────────────────── */
export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  const ui = useUiText();

  return (
    <header className="mb-6">
      {back && (
        <Link
          href={back.href}
          className="inline-flex items-center gap-1 h-8 -ml-1.5 pr-2 mb-2 rounded-lg text-[13px] font-medium text-(--ad-dim) hover:text-(--ad-text)"
        >
          <ChevronLeftIcon size={16} />
          {ui(back.label)}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-(--ad-text) leading-tight break-words">{ui(title)}</h1>
          {description && <p className="mt-1 text-sm text-(--ad-dim) max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({
  title,
  description,
  actions,
  flush = false,
  className = "",
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** No padding around the body — for lists that run edge to edge */
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ui = useUiText();

  return (
    <section className={`rounded-2xl bg-(--ad-surface) border border-(--ad-line) shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
      {(title || actions) && (
        <div className={`flex flex-wrap items-start justify-between gap-3 px-5 sm:px-6 pt-5 ${flush ? "pb-4 border-b border-(--ad-line)" : ""}`}>
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-(--ad-text)">{ui(title)}</h2>}
            {description && <p className="text-[13px] text-(--ad-dim) mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={flush ? "" : `px-5 sm:px-6 pb-5 sm:pb-6 ${title || actions ? "pt-4" : "pt-5 sm:pt-6"}`}>{children}</div>
    </section>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  const ui = useUiText();

  return (
    <div className="text-center px-6 py-10">
      <p className="text-sm font-semibold text-(--ad-text)">{ui(title)}</p>
      {text && <p className="text-[13px] text-(--ad-dim) mt-1">{ui(text)}</p>}
    </div>
  );
}

/** A labelled number, optionally a link. */
export function Stat({
  label,
  value,
  sub,
  tone = "neutral",
  href,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "neutral" | "accent" | "success" | "warn" | "gold";
  href?: string;
}) {
  const ui = useUiText();

  const color = {
    neutral: "text-(--ad-text)",
    accent: "text-(--ad-accent)",
    success: "text-(--ad-success)",
    warn: "text-(--ad-warn)",
    gold: "text-(--ad-gold)",
  }[tone];
  const body = (
    <div
      className={`h-full rounded-2xl bg-(--ad-surface) border border-(--ad-line) px-4 py-3.5 ${
        href ? "hover:border-(--ad-line-strong) transition-colors" : ""
      }`}
    >
      <span className="block text-xs font-medium text-(--ad-dim)">{ui(label)}</span>
      <span className={`block mt-1 text-2xl font-bold tabular-nums tracking-tight ${color}`}>{value}</span>
      {sub && <span className="block text-xs text-(--ad-faint) mt-0.5">{sub}</span>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/* ── Badges ──────────────────────────────────────────────────── */
export type BadgeTone = "neutral" | "accent" | "success" | "warn" | "danger" | "gold" | "info";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-(--ad-raised) text-(--ad-dim)",
  accent: "bg-(--ad-accent-soft) text-(--ad-accent)",
  success: "bg-(--ad-success-soft) text-(--ad-success)",
  warn: "bg-(--ad-warn-soft) text-(--ad-warn)",
  danger: "bg-(--ad-danger-soft) text-(--ad-danger)",
  gold: "bg-(--ad-gold-soft) text-(--ad-gold)",
  info: "bg-[#eaf1ff] text-[#2453b8]",
};

export function Badge({
  tone = "neutral",
  dot = false,
  className = "",
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap ${badgeTones[tone]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

const approvalBadge: Record<ApprovalStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending", tone: "warn" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const ui = useUiText();

  const b = approvalBadge[status];
  return (
    <Badge tone={b.tone} dot>
      {ui(b.label)}
    </Badge>
  );
}

const tournamentBadge: Record<TournamentStatus, { label: string; tone: BadgeTone }> = {
  upcoming: { label: "Upcoming", tone: "info" },
  ongoing: { label: "Live", tone: "accent" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "warn" },
};

export function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  const ui = useUiText();

  const b = tournamentBadge[status] ?? { label: status, tone: "neutral" as BadgeTone };
  return (
    <Badge tone={b.tone} dot={status === "ongoing"}>
      {ui(b.label)}
    </Badge>
  );
}

/** Label / value pair for detail lists. */
export function DetailRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  const ui = useUiText();

  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-3 py-1">
      <dt className="text-[13px] text-(--ad-dim)">{ui(label)}</dt>
      <dd className={`text-[13px] font-semibold text-(--ad-text) break-all ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
