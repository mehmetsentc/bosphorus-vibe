export const BRAND_NAME = "Bosphorus Vibe";

export const BRAND_INSTAGRAM = {
  handle: "bosphorusvibe",
  displayName: "BosphorusVibe",
  url: "https://www.instagram.com/bosphorusvibe/",
  /** Public stats mirrored from @bosphorusvibe (update manually if needed) */
  followers: 1014,
  following: 1,
} as const;

/** Firebase / legacy Porty Club strings → brand name */
export function formatBrandText(text: string): string {
  return text
    .replace(/Porty Club Animation Team/gi, `${BRAND_NAME} Animation Team`)
    .replace(/Porty Club/gi, BRAND_NAME)
    .replace(/\bPorty\b/gi, BRAND_NAME);
}
