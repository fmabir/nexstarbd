export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs.flat().filter(Boolean).join(" ").trim();
}
