export type ExternalSharePlatform =
  | "whatsapp"
  | "telegram"
  | "twitter"
  | "facebook";

export function buildShareUrl(
  platform: ExternalSharePlatform,
  url: string,
  text: string,
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`.trim())}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    default:
      return url;
  }
}

export async function copyShareLink(url: string): Promise<void> {
  await navigator.clipboard.writeText(url);
}

export async function nativeShare(options: {
  title?: string;
  text?: string;
  url: string;
}): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({
      title: options.title,
      text: options.text,
      url: options.url,
    });
    return true;
  } catch {
    return false;
  }
}
