
import { useUiText } from "@/components/i18n/ui-text";
import Image from "next/image";
import Link from "next/link";
import type { TournamentStatus } from "@/lib/types";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

/* ── Buttons ─────────────────────────────────────────────────────
   One height (48px) and one radius for every tappable action, so a row
   of buttons always lines up. */
const btnBase =
  "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-[14px] font-semibold transition-colors select-none";

export const mBtn = {
  primary: `${btnBase} bg-primary hover:bg-primary-dark active:bg-primary-dark text-white`,
  secondary: `${btnBase} bg-white hover:bg-m-raised active:bg-m-line border border-m-line text-m-text`,
  warning: `${btnBase} bg-m-amber active:brightness-90 text-black`,
  whatsapp: `${btnBase} bg-m-green active:brightness-90 text-white`,
};

/* Text inputs. m-field carries the background (see globals.css) */
export const mInput =
  "m-field w-full h-11 rounded-xl border border-m-line px-4 text-[16px] text-m-text placeholder:text-m-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-colors";

/* ── Wordmark ─────────────────────────────────────────────────── */
export function Wordmark({ size = 28 }: { size?: number }) {

  return (
    <span className="inline-flex items-center gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/banners/lnsbd.png" alt="" aria-hidden="true" style={{ height: size, width: size }} className="block" />
      <span className="font-sans text-[17px] md:text-[19px] font-bold tracking-tight text-m-text">
        NexStar<span className="text-m-red-text">B</span><span className="text-m-green-text">D</span>
      </span>
    </span>
  );
}

/* ── Illustrations ──────────────────────────────────────────────
   The artwork in /illustrations is drawn on white with no transparency,
   so it sits on a white tile (seamless on the white shell), always shown whole
   (object-contain). Left lazy on purpose: the phone tree is display:none on
   desktop, and lazy images there are never fetched. */
export const art = {
  arena: "/illustrations/arena-background.png",
  trophy: "/illustrations/trophy-doodle.png",
  squad: "/illustrations/squad-cartoon.png",
  community: "/illustrations/community-vector.png",
} as const;

export function ArtTile({
  src,
  sizes,
  className = "",
}: {
  src: string;
  /** Rendered width, for next/image to pick a file size */
  sizes: string;
  /** Sets the tile's size, e.g. "w-24 h-24" */
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-2xl bg-white ${className}`} aria-hidden="true">
      <Image src={src} alt="" fill sizes={sizes} className="object-contain p-1.5" />
    </div>
  );
}

/* ── Page + section headers ──────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  back,
  art,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  /** Illustration tile beside the title */
  art?: string;
}) {
  const ui = useUiText();

  return (
    <header className="px-4 pt-2 pb-3">
      {back && <BackLink href={back.href} label={ui(back.label)} />}
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-m-display font-bold text-[24px] md:text-[28px] leading-tight text-m-text">{ui(title)}</h1>
          {subtitle && <p className="mt-1.5 text-[14px] leading-snug text-m-dim">{ui(subtitle)}</p>}
        </div>
        {art && <ArtTile src={art} sizes="40px" className="w-10 h-10" />}
      </div>
    </header>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  const ui = useUiText();

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-0.5 h-9 -ml-1.5 pr-2 mb-1 text-[14px] font-medium text-m-dim active:text-m-text"
    >
      <ChevronLeftIcon size={18} />
      {ui(label)}
    </Link>
  );
}

/* ── Sections ────────────────────────────────────────────────────
   Every kind of section has its own colour — a soft full-width band plus
   a matching accent bar on the title — so the page reads as distinct
   blocks. The same kind keeps the same colour on every page:
   live = red, announcements = blue, upcoming = green, past = slate,
   winners = gold, community = violet. */
export type SectionTone = "plain" | "red" | "blue" | "green" | "slate" | "gold" | "violet";

const sectionTones: Record<SectionTone, { band: string; accent: string }> = {
  plain: { band: "", accent: "bg-primary" },
  red: { band: "bg-m-tint-red", accent: "bg-m-red" },
  blue: { band: "bg-m-tint-blue", accent: "bg-m-blue" },
  green: { band: "bg-m-tint-green", accent: "bg-m-green" },
  slate: { band: "bg-m-tint-slate", accent: "bg-m-faint" },
  gold: { band: "bg-m-tint-gold", accent: "bg-m-gold" },
  violet: { band: "bg-m-tint-violet", accent: "bg-m-violet" },
};

/**
 * Full-width coloured band. `backdrop` lays one of the illustrations along
 * the bottom of the band; mix-blend-multiply drops the artwork's white
 * ground into the tint, so only the drawing shows, under the cards.
 */
export function SectionBand({
  tone = "plain",
  backdrop,
  flipBackdrop = false,
  className = "",
  children,
}: {
  tone?: SectionTone;
  backdrop?: string;
  flipBackdrop?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  // Keep the props stable for existing callers; decoration stays inside cards.
  void backdrop;
  void flipBackdrop;
  void tone;
  return <section className={`player-section ${className}`}>{children}</section>;
}

export function Section({
  title,
  live = false,
  tone = "plain",
  backdrop,
  flipBackdrop,
  action,
  children,
}: {
  title: string;
  /** Pulsing red dot in place of the accent bar, for sections showing live play */
  live?: boolean;
  tone?: SectionTone;
  backdrop?: string;
  flipBackdrop?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ui = useUiText();

  return (
    <SectionBand tone={tone} backdrop={backdrop} flipBackdrop={flipBackdrop}>
      <div className="flex items-center justify-between gap-3 px-4 mb-2.5">
        <h2 className="flex items-center gap-2.5 font-m-display font-semibold text-[17px] leading-tight text-m-text">
          {ui(live ? (
            <span className="w-2.5 h-2.5 rounded-full bg-m-red animate-pulse" aria-hidden="true" />
          ) : (
            <span className={`w-1 h-5 rounded-full ${sectionTones[tone].accent}`} aria-hidden="true" />
          ))}
          {ui(title)}
        </h2>
        {action}
      </div>
      {children}
    </SectionBand>
  );
}

const seeAllClass =
  "inline-flex items-center gap-0.5 h-8 -mr-1.5 pl-2 text-[14px] font-medium text-primary active:opacity-70";

export function SeeAllLink({ href, label = "See all" }: { href: string; label?: string }) {
  const ui = useUiText();

  return (
    <Link href={href} className={seeAllClass}>
      {ui(label)}
      <ChevronRightIcon size={16} />
    </Link>
  );
}

export function SeeAllButton({ onClick, label = "See all" }: { onClick: () => void; label?: string }) {
  const ui = useUiText();

  return (
    <button type="button" onClick={onClick} className={seeAllClass}>
      {ui(label)}
      <ChevronRightIcon size={16} />
    </button>
  );
}

/** Small uppercase label above a value — the one caption style everywhere. */
export function Caption({
  children,
  color = "text-m-faint",
  className = "",
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span className={`block text-[11px] font-semibold uppercase tracking-[0.08em] ${color} ${className}`}>
      {children}
    </span>
  );
}

/* ── Chips ───────────────────────────────────────────────────── */
export type ChipTone = "neutral" | "red" | "green" | "amber" | "gold";

const chipTones: Record<ChipTone, string> = {
  neutral: "bg-m-raised text-m-dim border-m-line",
  red: "bg-m-red/10 text-m-red-text border-m-red/25",
  green: "bg-m-green/10 text-m-green-text border-m-green/25",
  amber: "bg-m-amber/15 text-m-amber-text border-m-amber/40",
  gold: "bg-m-gold/20 text-m-gold-text border-m-gold/50",
};

export function Chip({
  tone = "neutral",
  dot = false,
  pulse = false,
  className = "",
  children,
}: {
  tone?: ChipTone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[12px] font-semibold leading-none whitespace-nowrap ${chipTones[tone]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? "animate-pulse" : ""}`} />}
      {children}
    </span>
  );
}

const statusChip: Record<TournamentStatus, { label: string; tone: ChipTone }> = {
  ongoing: { label: "Live", tone: "green" },
  upcoming: { label: "Upcoming", tone: "neutral" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "amber" },
};

export function StatusChip({ status, className = "" }: { status: TournamentStatus; className?: string }) {
  const ui = useUiText();

  const s = statusChip[status];
  return (
    <Chip tone={s.tone} dot={status === "ongoing"} pulse={status === "ongoing"} className={className}>
      {ui(s.label)}
    </Chip>
  );
}

export function EntryChip({
  isFree,
  fee,
  className = "",
}: {
  isFree: boolean;
  fee: string | null;
  className?: string;
}) {
  const ui = useUiText();

  if (isFree) return <Chip tone="green" className={className}>{ui("Free entry")}</Chip>;
  if (!fee) return null;
  return <Chip className={className}>{ui("Entry")}{fee}</Chip>;
}

/* Wrap a chip in this to put it over a photo: a solid backing keeps it legible */
export const onImage = "rounded-full bg-white/90 backdrop-blur-md";

/* ── Stats ───────────────────────────────────────────────────── */
export function StatGrid({
  items,
}: {
  items: {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    accent?: "gold" | "none";
    /** A word rather than a score (e.g. the mode): set in Inter, which is narrower */
    text?: boolean;
  }[];
}) {
  const ui = useUiText();

  return (
    <dl
      className="grid divide-x divide-m-line rounded-xl border border-m-line"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((it) => (
        <div key={it.label} className="px-2.5 py-2.5 min-w-0">
          <dt><Caption>{ui(it.label)}</Caption></dt>
          {/* Wraps rather than truncates: a value is never cut off */}
          <dd
            className={`mt-1 leading-tight break-words ${
              it.text ? "font-sans font-semibold text-[15px]" : "font-m-display font-semibold text-[17px]"
            } ${it.accent === "gold" ? "text-m-gold-text" : "text-m-text"}`}
          >
            {it.value}
          </dd>
          {it.sub && <dd className="text-[12px] text-m-dim truncate">{it.sub}</dd>}
        </div>
      ))}
    </dl>
  );
}

const placeTone = { 1: "text-m-gold-text", 2: "text-m-silver-text", 3: "text-m-bronze-text" } as const;
const placeLabel = { 1: "1st", 2: "2nd", 3: "3rd" } as const;

/** "1st ৳3,000" — the per-place split under a prize pool. */
export function PlacePrize({ place, value }: { place: 1 | 2 | 3; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-m-raised text-[13px] font-medium text-m-text">
      <span className={`font-semibold ${placeTone[place]}`}>{placeLabel[place]}</span>
      {value}
    </span>
  );
}

/** Round medal badge for podium rows. */
export function PlaceBadge({ place, size = 32 }: { place: 1 | 2 | 3; size?: number }) {
  const bg = { 1: "bg-m-gold", 2: "bg-m-silver", 3: "bg-m-bronze" }[place];
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full font-m-display font-bold text-black ${bg}`}
      style={{ width: size, height: size, fontSize: size * 0.47 }}
    >
      {place}
    </span>
  );
}

/* ── Slot meter ──────────────────────────────────────────────────
   One block per slot when the count is small enough to read at a glance
   (squad lobbies are usually 12), a plain bar otherwise. */
export function SlotMeter({ filled, max, waitlisted = 0 }: { filled: number; max: number; waitlisted?: number }) {
  const ui = useUiText();

  const isFull = filled >= max;
  const segmented = max > 0 && max <= 24;
  const pct = max > 0 ? Math.min((filled / max) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <Caption>{ui("Slots")}</Caption>
        <span className="text-[13px] font-semibold tabular-nums text-m-text">
          {filled}
          <span className="text-m-faint">/{max}</span>
          {isFull && <span className="ml-2 text-m-red-text">{ui("Full")}</span>}
          {waitlisted > 0 && <span className="ml-2 text-m-amber-text">+{waitlisted}{ui("waitlist")}</span>}
        </span>
      </div>
      {ui(segmented ? (
        <div className="flex gap-[3px]" role="img" aria-label={ui(`${filled} of ${max} slots filled`)}>
          {Array.from({ length: max }, (_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-[2px] ${
                i < filled ? (isFull ? "bg-m-red" : "bg-m-green") : "bg-m-line"
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="h-2 rounded-full bg-m-line overflow-hidden">
          <div className={`h-full rounded-full ${isFull ? "bg-m-red" : "bg-m-green"}`} style={{ width: `${pct}%` }} />
        </div>
      ))}
    </div>
  );
}

/* ── Empty + loading ─────────────────────────────────────────── */
export function EmptyState({
  icon,
  art,
  title,
  text,
  className = "",
}: {
  icon?: React.ReactNode;
  /** Illustration in place of the icon */
  art?: string;
  title: string;
  text?: string;
  className?: string;
}) {
  const ui = useUiText();

  return (
    <div className={`flex flex-col items-center text-center px-4 py-5 rounded-2xl border border-dashed border-m-line ${className}`}>
      {ui(art ? (
        <ArtTile src={art} sizes="128px" className="w-20 h-20 mb-3" />
      ) : (
        <span className="w-12 h-12 rounded-full bg-m-raised text-m-dim flex items-center justify-center mb-3">{icon}</span>
      ))}
      <p className="text-[15px] font-semibold text-m-text">{ui(title)}</p>
      {text && <p className="mt-1 text-[13px] text-m-dim max-w-[16rem]">{ui(text)}</p>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-2xl bg-m-raised animate-pulse ${className}`} />;
}

/** Card surface — flat white, hairline border, the faintest lift off the white page. */
export const mCard = "rounded-2xl bg-m-surface border border-m-line shadow-[0_3px_12px_rgba(30,70,110,0.035)]";
