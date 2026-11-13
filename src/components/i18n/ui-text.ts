import { useLocale } from "next-intl";
import en from "../../../messages/en.json";
import bn from "../../../messages/bn.json";

export function textKey(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return `u${(hash >>> 0).toString(16)}`;
}

/** Translate interface copy only. IDs, form values, and user content stay intact. */
export function createUiText(locale: string) {
  const catalog = (locale === "bn" ? bn : en) as unknown as { ui: Record<string, string> };
  return function ui<T>(value: T): T {
    if (typeof value !== "string") return value;
    const translated = catalog.ui?.[textKey(value)];
    if (translated) return translated as T;
    if (locale === "bn") {
      const months: Record<string, string> = { Jan: "জানুয়ারি", Feb: "ফেব্রুয়ারি", Mar: "মার্চ", Apr: "এপ্রিল", May: "মে", Jun: "জুন", Jul: "জুলাই", Aug: "আগস্ট", Sept: "সেপ্টেম্বর", Sep: "সেপ্টেম্বর", Oct: "অক্টোবর", Nov: "নভেম্বর", Dec: "ডিসেম্বর" };
      if (/^\d{1,2} [A-Z][a-z]{2,3}(?: \d{4})?$/.test(value)) return value.replace(/[A-Z][a-z]{2,3}/, month => months[month] ?? month) as T;
      if (/^\d{1,2}:\d{2} (AM|PM)$/.test(value)) return value.replace("AM", "পূর্বাহ্ণ").replace("PM", "অপরাহ্ণ") as T;
      const patterns: [RegExp, (match: RegExpMatchArray) => string][] = [
        [/^Resend in (\d+)s$/, m => `${m[1]} সেকেন্ড পরে আবার পাঠান`],
        [/^(\d+) squads? approved!$/, m => `${m[1]}টি স্কোয়াড অনুমোদিত হয়েছে!`],
        [/^Show slide (\d+): (.*)$/, m => `${m[1]} নম্বর স্লাইড: ${catalog.ui?.[textKey(m[2])] ?? m[2]}`],
        [/^Digit (\d+)$/, m => `${m[1]} নম্বর সংখ্যা`],
      ];
      for (const [pattern, render] of patterns) {
        const match = value.match(pattern);
        if (match) return render(match) as T;
      }
    }
    return value;
  };
}

export function useUiText() {
  return createUiText(useLocale());
}
