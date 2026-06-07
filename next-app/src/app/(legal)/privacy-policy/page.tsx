import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Bosphorus Vibe collects, uses, and protects your personal data under GDPR and KVKK.",
  path: "/privacy-policy",
  keywords: ["privacy policy", "GDPR", "KVKK", "data protection", BRAND_NAME],
});

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 pb-24">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-gold">
          Legal
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted">Last updated: June 7, 2026</p>
      </header>

      <div className="prose-legal space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2>1. Introduction</h2>
          <p>
            {BRAND_NAME} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the hotel
            entertainment platform for Bosphorus Sorgun Hotel guests and staff. This Privacy
            Policy explains how we process personal data in compliance with the EU General Data
            Protection Regulation (GDPR) and Türkiye&apos;s Personal Data Protection Law (KVKK).
          </p>
        </section>

        <section>
          <h2>2. Data We Collect</h2>
          <ul>
            <li>Account information from Google Sign-In (name, email, profile photo)</li>
            <li>Profile details you provide (username, bio, role)</li>
            <li>Content you upload (videos, images, captions)</li>
            <li>Usage data and analytics (only with your consent)</li>
            <li>Technical data such as device type and approximate location for activity uploads</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <p>
            We use personal data to provide the service, personalize your experience, moderate
            content, improve platform performance, and comply with legal obligations. Marketing
            communications are sent only when you opt in via cookie preferences.
          </p>
        </section>

        <section>
          <h2>4. Legal Bases (GDPR)</h2>
          <ul>
            <li>Contract performance — providing the platform and your account</li>
            <li>Legitimate interests — security, fraud prevention, service improvement</li>
            <li>Consent — analytics and marketing cookies</li>
            <li>Legal obligation — where required by applicable law</li>
          </ul>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>
            You may request access, correction, deletion, restriction, portability, or objection
            to processing. Contact us at privacy@bosphorusvibe.com. You may also lodge a complaint
            with your local supervisory authority or the Turkish Personal Data Protection Authority
            (KVKK).
          </p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain account and content data while your account is active. Analytics data is
            retained according to your consent settings and applicable retention schedules.
          </p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>
            Data Controller: Bosphorus Sorgun Hotel Entertainment Team. Email:{" "}
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
