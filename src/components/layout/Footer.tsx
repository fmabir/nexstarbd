import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-display text-lg">N</span>
              </div>
              <span className="font-display text-2xl tracking-wide">
                nextstar<span className="text-primary">BD</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bangladesh&apos;s free community platform for Free Fire esports
              tournaments.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">
              Navigate
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/#upcoming-tournaments", label: "Tournaments" },
                { href: "/hall-of-fame", label: "Hall of Fame" },
                { href: "/rules", label: "Rules" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">
              Community
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_URL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Discord Server
                </a>
              </li>
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Facebook Group
                </a>
              </li>
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_WHATSAPP_URL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  WhatsApp Community
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© {year} nextstarBD. All rights reserved.</span>
          <span>Built for the Bangladesh Free Fire community 🇧🇩</span>
        </div>
      </div>
    </footer>
  );
}
