import Image from "next/image";
import type { Sponsor } from "@/lib/types";
import { Caption, Section } from "@/components/mobile/ui/primitives";

/** Sponsor logos on white tiles (logos are drawn for light backgrounds), one grid per tier. */
export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  const active = sponsors.filter((s) => s.isActive);
  if (active.length === 0) return null;

  const tier = (slot: Sponsor["slotType"]) =>
    active.filter((s) => s.slotType === slot).sort((a, b) => a.displayOrder - b.displayOrder);

  const tiers = [
    { title: "Platinum partners", items: tier("hero"), grid: "grid-cols-1", tile: "h-20", sizes: "100vw" },
    { title: "Sponsors & partners", items: tier("banner"), grid: "grid-cols-3", tile: "h-14", sizes: "33vw" },
    { title: "Supporting partners", items: tier("sidebar"), grid: "grid-cols-4", tile: "h-12", sizes: "25vw" },
  ].filter((t) => t.items.length > 0);

  return (
    <Section title="Partners">
      <div className="px-4 space-y-4">
        {tiers.map((t) => (
          <div key={t.title}>
            <Caption className="mb-2">{t.title}</Caption>
            <div className={`grid ${t.grid} gap-2`}>
              {t.items.map((s) => (
                <a
                  key={s.id}
                  href={s.websiteUrl || "#"}
                  target={s.websiteUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`relative ${t.tile} rounded-xl bg-white border border-m-line overflow-hidden`}
                  aria-label={s.name}
                >
                  <Image src={s.logoUrl} alt={s.name} fill sizes={t.sizes} className="object-contain p-2.5" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
