/** Production canonical origin — used for sitemap, robots, OG and JSON-LD. */
export const CANONICAL_SITE_ORIGIN = "https://www.bosphorusvibe.com";

const NON_CANONICAL_HOSTS = ["vercel.app", "localhost", "127.0.0.1"];

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, "");
}

function isCanonicalOrigin(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return !NON_CANONICAL_HOSTS.some(
      (blocked) => host === blocked || host.endsWith(`.${blocked}`),
    );
  } catch {
    return false;
  }
}

/**
 * Canonical site URL for SEO artifacts. Ignores Vercel preview / localhost
 * values in NEXT_PUBLIC_SITE_URL so sitemap URLs match Search Console property.
 */
export function getCanonicalSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_CANONICAL_URL?.trim();
  if (explicit && isCanonicalOrigin(explicit)) {
    return normalizeOrigin(explicit);
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && isCanonicalOrigin(configured)) {
    return normalizeOrigin(configured);
  }

  return CANONICAL_SITE_ORIGIN;
}

export function canonicalSiteUrl(path = ""): string {
  const base = getCanonicalSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
