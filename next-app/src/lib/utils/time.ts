export {
  toDate,
  isToday,
  formatTime,
  formatDate,
  formatEventSchedule,
  getCountdown,
  pad,
} from "./firestore-helpers";

/**
 * Returns a human-readable "time ago" string in Turkish or English.
 * Examples: "3 dakika önce", "2 saat önce", "1 gün önce", "just now"
 */
export function formatTimeAgo(date: Date | null | undefined, locale: "tr" | "en" = "tr"): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return locale === "tr" ? "az önce" : "just now";
  if (seconds < 60) return locale === "tr" ? `${seconds} saniye önce` : `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return locale === "tr" ? `${minutes} dakika önce` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return locale === "tr" ? `${hours} saat önce` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return locale === "tr" ? `${days} gün önce` : `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return locale === "tr" ? `${weeks} hafta önce` : `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return locale === "tr" ? `${months} ay önce` : `${months}mo ago`;
  const years = Math.floor(days / 365);
  return locale === "tr" ? `${years} yıl önce` : `${years}y ago`;
}
