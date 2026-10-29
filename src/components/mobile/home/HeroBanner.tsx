"use client";

import Image from "next/image";
import Link from "next/link";
import { useActiveTournaments } from "@/lib/hooks/useActiveTournaments";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { ChevronRightIcon } from "@/components/mobile/ui/icons";

// The squad illustration with its white ground removed (see public/illustrations)
const SQUAD = { src: "/illustrations/squad-cartoon-cutout.png", width: 866, height: 758 };

/* Four-point sparkle, placed by percentage so it scales with the banner */
const sparkles = [
  { top: "14%", left: "58%", size: 14, delay: "0s", color: "#ffd76a" },
  { top: "30%", left: "92%", size: 10, delay: "0.7s", color: "#ffffff" },
  { top: "62%", left: "50%", size: 9, delay: "1.3s", color: "#ffffff" },
  { top: "8%", left: "84%", size: 8, delay: "1.8s", color: "#ffd76a" },
  { top: "48%", left: "6%", size: 7, delay: "0.4s", color: "#ffffff" },
];

function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" />
    </svg>
  );
}

/**
 * What's happening right now, as one tappable line: a live tournament, one
 * open for registration, or the date of the next one.
 */
function StatusPill() {
  const { active, rest, loading } = useActiveTournaments();
  const now = active[0];
  const next = rest[0];

  if (loading) return <span className="block h-7" aria-hidden="true" />;

  const pill =
    "inline-flex items-center gap-1.5 h-7 max-w-full pl-2.5 pr-1.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/35 text-[12px] font-semibold text-white active:bg-white/25";

  if (now) {
    const live = now.status === "ongoing";
    return (
      <Link href={`/tournaments/${now.id}`} className={pill}>
        {/* White, not red: a red dot would vanish into the red banner */}
        <span className={`w-2 h-2 shrink-0 rounded-full ${live ? "bg-white animate-pulse" : "bg-[#5df08e]"}`} />
        <span className="shrink-0">{live ? "Live now" : "Registration open"}</span>
        <span className="truncate font-medium text-white/80">· {now.name}</span>
        <ChevronRightIcon size={14} className="shrink-0 text-white/80" />
      </Link>
    );
  }

  if (next) {
    return (
      <Link href={`/tournaments/${next.id}`} className={pill}>
        <span className="w-2 h-2 shrink-0 rounded-full bg-[#ffd76a]" />
        <span className="shrink-0">Next battle</span>
        <span className="truncate font-medium text-white/80">
          · {formatDateOnly(next.startsAt)}, {formatTimeOnly(next.startsAt)}
        </span>
        <ChevronRightIcon size={14} className="shrink-0 text-white/80" />
      </Link>
    );
  }

  return <span className={pill}>Weekly squad battles</span>;
}

/**
 * Home hero for phones. Straight top and sides, one curved bottom edge (two
 * half-width elliptical corner radii that meet in the middle) with a thin gold
 * rim along it. Layered for depth: gradient, drifting glows, dot texture,
 * light streaks, a spotlight, the floating squad, and sparkles on top.
 */
export function HeroBanner() {
  return (
    <section
      aria-label="Welcome"
      className="relative h-[236px] overflow-hidden rounded-b-[50%_34px] border-b-[3px] border-[#ffd76a]/80 bg-[linear-gradient(140deg,#ff2d55_0%,#e11d2e_30%,#b3125f_62%,#4c1d95_100%)] shadow-[0_26px_40px_-26px_rgba(179,18,95,0.7)]"
    >
      {/* Drifting glows */}
      <div aria-hidden="true" className="absolute -left-16 -bottom-20 w-64 h-64 rounded-full bg-[#22c55e]/35 blur-3xl m-aurora" />
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-24 w-72 h-72 rounded-full bg-[#ffd76a]/30 blur-3xl m-aurora"
        style={{ animationDelay: "-5s" }}
      />

      {/* Dot texture, fading out toward the bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1.6px)] bg-[length:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />

      {/* Light streaks */}
      {["0s", "2.6s"].map((delay, i) => (
        <div
          key={delay}
          aria-hidden="true"
          className="absolute top-0 left-0 h-[150%] w-[2px] -translate-y-1/4 bg-gradient-to-b from-transparent via-white/70 to-transparent m-streak"
          style={{ animationDelay: delay, marginLeft: i === 0 ? "8%" : "30%" }}
        />
      ))}

      {/* Spotlight behind the squad */}
      <div
        aria-hidden="true"
        className="absolute -right-[12%] -bottom-[38%] w-[82%] aspect-square rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.1)_45%,transparent_68%)]"
      />

      {/* The squad, floating; the curved edge crops their feet */}
      <div aria-hidden="true" className="absolute right-[-4%] bottom-[-6px] w-[58%] m-float">
        <Image
          src={SQUAD.src}
          width={SQUAD.width}
          height={SQUAD.height}
          alt=""
          sizes="60vw"
          className="w-full h-auto drop-shadow-[0_12px_18px_rgba(40,0,30,0.45)]"
        />
      </div>

      {sparkles.map((s) => (
        <span
          key={s.top + s.left}
          aria-hidden="true"
          className="absolute m-twinkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        >
          <Sparkle size={s.size} color={s.color} />
        </span>
      ))}

      {/* Copy */}
      <div className="relative h-full flex flex-col px-4 pt-4 pb-9">
        <div className="max-w-[78%]">
          <StatusPill />
        </div>
        <h1 className="mt-auto font-m-display font-bold text-[31px] leading-[0.98] text-white drop-shadow-[0_2px_10px_rgba(60,0,30,0.35)]">
          Drop in.
          <br />
          Squad up.
          <br />
          <span className="text-[#ffd76a]">Win big.</span>
        </h1>
        <p className="mt-2 max-w-[46%] text-[12px] font-medium leading-snug text-white/85">
          Weekly squad battles · Free entry · Real prizes
        </p>
      </div>
    </section>
  );
}
