import type { Locale } from "../detect";
import type { MessageKey, Messages } from "./en";
import en from "./en";
import tr from "./tr";
import ru from "./ru";
import de from "./de";
import pl from "./pl";
import sq from "./sq";
import uk from "./uk";
import ro from "./ro";
import xk from "./xk";

const catalogs: Record<Locale, Messages> = {
  en,
  tr,
  ru,
  de,
  pl,
  sq,
  uk,
  ro,
  xk,
};

export function getMessage(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string>,
): string {
  let text = catalogs[locale]?.[key] ?? en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, value);
    }
  }
  return text;
}

export { en, tr, ru, de, pl, sq, uk, ro, xk };
export type { MessageKey, Messages };
