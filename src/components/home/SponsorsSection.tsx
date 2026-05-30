import Image from "next/image";
import type { Sponsor } from "@/lib/types";

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  const active = sponsors.filter((s) => s.isActive);
  if (active.length === 0) return null;

  const heroBanners = active.filter((s) => s.slotType === "hero").sort((a, b) => a.displayOrder - b.displayOrder);
  const standardBanners = active.filter((s) => s.slotType === "banner").sort((a, b) => a.displayOrder - b.displayOrder);
  const sidebarBanners = active.filter((s) => s.slotType === "sidebar").sort((a, b) => a.displayOrder - b.displayOrder);

  const SponsorLink = ({ sponsor, className }: { sponsor: Sponsor; className: string }) => (
    <a
      key={sponsor.id}
      href={sponsor.websiteUrl || "#"}
      target={sponsor.websiteUrl ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={className}
    >
      <Image
        src={sponsor.logoUrl}
        alt={sponsor.name}
        fill
        className="object-contain"
      />
    </a>
  );

  return (
    <section className="bg-white border-t border-border">
      {/* Hero Banners — Full-width featured sponsors */}
      {heroBanners.length > 0 && (
        <div className="bg-gradient-to-r from-muted to-muted/50 py-8 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Platinum Partners
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroBanners.map((sponsor) => (
                <SponsorLink
                  key={sponsor.id}
                  sponsor={sponsor}
                  className="relative h-24 w-full grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100 rounded-lg overflow-hidden bg-white p-3"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Standard Banners — Regular sponsor section */}
      {standardBanners.length > 0 && (
        <div className="py-10 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
              Our Sponsors &amp; Partners
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {standardBanners.map((sponsor) => (
                <SponsorLink
                  key={sponsor.id}
                  sponsor={sponsor}
                  className="relative h-12 w-28 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Banners — Supporting sponsors */}
      {sidebarBanners.length > 0 && (
        <div className="py-8 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Supporting Partners
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {sidebarBanners.map((sponsor) => (
                <SponsorLink
                  key={sponsor.id}
                  sponsor={sponsor}
                  className="relative h-10 w-24 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-90"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
