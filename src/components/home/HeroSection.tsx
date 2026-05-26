import { Button } from "@/components/ui/Button";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaRegister: string;
  ctaWinners: string;
}

export function HeroSection({ title, subtitle, ctaRegister, ctaWinners }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gray-950 text-white py-20 sm:py-28 lg:py-36">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black" />
        {/* Decorative circles */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-semibold">
          <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          Bangladesh Free Fire Community
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-wide leading-tight mb-4">
          <span className="text-white">{title.split("Free Fire")[0]}</span>
          <span className="text-primary">Free Fire</span>
          <span className="text-white">{title.split("Free Fire")[1]}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-medium">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/#upcoming-tournaments" size="lg">
            🎮 {ctaRegister}
          </Button>
          <Button href="/hall-of-fame" variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10 hover:border-white/50">
            🏆 {ctaWinners}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
          {[
            { value: "12", label: "Squads/Tournament" },
            { value: "FREE", label: "Registration" },
            { value: "🇧🇩", label: "Bangladesh" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl sm:text-4xl text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
