import type { Locale } from "@/i18n/detect";
import { LOCALE_BCP47 } from "@/i18n/detect";
import { getMessage } from "@/i18n/messages";

export async function getCurrentLocationLabel(locale: Locale = "en"): Promise<string> {
  if (!navigator.geolocation) {
    return getMessage(locale, "geolocationError");
  }

  const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  });

  const acceptLanguage = LOCALE_BCP47[locale].split("-")[0];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=16&accept-language=${acceptLanguage}`,
      { headers: { Accept: "application/json" } },
    );
    if (res.ok) {
      const data = (await res.json()) as { display_name?: string };
      if (data.display_name) return data.display_name;
    }
  } catch {
    // Fall back to coordinates if reverse geocoding fails
  }

  return `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
}
