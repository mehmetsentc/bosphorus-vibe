import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = buildPageMetadata({
  title: "Cookie Policy",
  description:
    "Details about cookies and similar technologies used on Bosphorus Vibe.",
  path: "/cookie-policy",
  keywords: ["cookie policy", "GDPR", "KVKK", "consent", BRAND_NAME],
});

export default function CookiePolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 pb-24">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-gold">
          Legal
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
          Cookie Policy
        </h1>
        <p className="mt-3 text-sm text-muted">Last updated: June 7, 2026</p>
      </header>

      <div className="prose-legal space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device. We use cookies and local storage
            to keep you signed in, remember guest access, and — with your consent — measure
            platform usage.
          </p>
        </section>

        <section>
          <h2>2. Cookie Categories</h2>
          <h3>Necessary</h3>
          <p>
            Required for core functionality: session access, consent preferences, and Firebase
            authentication state. These cannot be disabled.
          </p>
          <h3>Analytics</h3>
          <p>
            Help us understand how features are used (e.g. Google Analytics). Loaded only after
            you accept analytics cookies.
          </p>
          <h3>Marketing</h3>
          <p>
            Used for promotional measurement and retargeting where applicable. Enabled only with
            explicit consent.
          </p>
        </section>

        <section>
          <h2>3. Managing Preferences</h2>
          <p>
            Use the cookie banner or the &quot;Cookie settings&quot; link in the footer to accept,
            reject non-essential cookies, or customize categories. You can change your choice at
            any time.
          </p>
        </section>

        <section>
          <h2>4. Retention</h2>
          <p>
            Consent preferences are stored for up to 12 months. Access cookies expire after 30
            days of inactivity unless renewed.
          </p>
        </section>

        <section>
          <h2>5. Contact</h2>
          <p>
            Questions about cookies:{" "}
            <a href="mailto:privacy@bosphorusvibe.com">privacy@bosphorusvibe.com</a>
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm">
        <Link href="/welcome" className="text-vibe hover:underline">
          ← Back to welcome
        </Link>
      </p>
    </article>
  );
}
