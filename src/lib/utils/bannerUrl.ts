/**
 * Default artwork for tournaments without an uploaded banner — one character
 * per tournament, picked from its id so it never changes between visits.
 *
 * `wide` (2172×724) is the banner itself. `hero` (1536×1024) is the same
 * character with an empty left side, for taller headers. `focus` is the
 * horizontal object-position that keeps the character in frame when the
 * wide banner is cropped narrower (thumbnails, phone cards).
 */
const DEFAULTS = [
  { wide: "/banners/free-fire-wide/01-alok-white-neon.png", hero: "/banners/free-fire-minimal/01-alok-white-green.png", focus: "100%" },
  { wide: "/banners/free-fire-wide/02-kelly-charcoal-gold.png", hero: "/banners/free-fire-minimal/02-kelly-black-yellow.png", focus: "88%" },
  { wide: "/banners/free-fire-wide/03-hayato-mint-ink.png", hero: "/banners/free-fire-minimal/03-hayato-white-red.png", focus: "0%" },
  { wide: "/banners/free-fire-wide/04-moco-purple-neon.png", hero: "/banners/free-fire-minimal/04-moco-black-purple.png", focus: "100%" },
  { wide: "/banners/free-fire-wide/05-chrono-white-blue.png", hero: "/banners/free-fire-minimal/05-chrono-white-blue.png", focus: "95%" },
];

export interface Banner {
  src: string;
  /** CSS object-position for cropped displays */
  position: string;
}

function pick(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return DEFAULTS[hash % DEFAULTS.length];
}

/**
 * The banner to show for a tournament: the uploaded one if any, otherwise
 * its default character art. `variant: "hero"` asks for the taller version.
 */
export function resolveBanner(
  bannerUrl: string | null | undefined,
  id: string,
  variant: "wide" | "hero" = "wide"
): Banner {
  if (bannerUrl) return { src: bannerUrl, position: "center" };
  const d = pick(id);
  return variant === "hero"
    ? { src: d.hero, position: "100% center" }
    : { src: d.wide, position: `${d.focus} center` };
}

export function resolveBannerUrl(bannerUrl: string | null | undefined, id: string): string {
  return resolveBanner(bannerUrl, id).src;
}
