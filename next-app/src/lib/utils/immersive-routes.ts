/** Full-screen video routes — hide bottom nav and use immersive layout. */
export function isImmersiveVideoRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/feed/") ||
    pathname.startsWith("/profile/posts/") ||
    pathname.startsWith("/reels")
  );
}
