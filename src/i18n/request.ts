import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeValue = cookieStore.get("locale")?.value;
  // Bangla unless the visitor has chosen English with the language switch
  const locale = localeValue === "en" ? "en" : "bn";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
