import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms and conditions for using the Bosphorus Vibe hotel entertainment platform.",
  path: "/terms-of-service",
  keywords: ["terms of service", "user agreement", BRAND_NAME],
});

export default function TermsOfServicePage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 pb-24">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-gold">
          Legal
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted">Last updated: June 7, 2026</p>
      </header>

      <div className="prose-legal space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2>1. Acceptance</h2>
          <p>
            By accessing {BRAND_NAME}, you agree to these Terms. If you do not agree, please do
            not use the platform. Guest browsing is limited; full features require Google
            authentication.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 16 years old to create an account. Hotel staff accounts may be
            subject to additional internal policies.
          </p>
        </section>

        <section>
          <h2>3. User Content</h2>
          <p>
            You retain ownership of content you upload. You grant us a non-exclusive license to
            display, store, and distribute your content within the platform. You must not upload
            unlawful, offensive, or infringing material.
          </p>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <ul>
            <li>No harassment, spam, or impersonation</li>
            <li>No attempts to bypass security or access controls</li>
            <li>Respect other guests, staff, and hotel policies</li>
            <li>Guest users may browse events and reels preview only</li>
          </ul>
        </section>

        <section>
          <h2>5. Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these Terms. You may sign out at
            any time from your profile settings.
          </p>
        </section>

        <section>
          <h2>6. Disclaimer</h2>
          <p>
            The platform is provided &quot;as is&quot; without warranties. Event schedules may
            change without notice. We are not liable for indirect damages to the extent permitted
            by law.
          </p>
        </section>

        <section>
          <h2>7. Governing Law</h2>
          <p>
            These Terms are governed by the laws of Türkiye. Disputes shall be subject to the
            courts of Antalya, unless mandatory consumer protection rules apply.
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
