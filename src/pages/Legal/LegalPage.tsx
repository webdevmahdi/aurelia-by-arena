import { useSeo } from '@/hooks/useSeo';

export default function LegalPage({ variant }: { variant: 'privacy' | 'terms' }) {
  const isPrivacy = variant === 'privacy';

  useSeo({
    title: isPrivacy
      ? 'Privacy Policy — Aurelia Developments'
      : 'Legal Notice & Architectural Disclaimers — Aurelia Developments',
    description: isPrivacy
      ? 'How Aurelia Developments safeguards personal data submitted for private sales inquiries, brochure requests, and site visits.'
      : 'Important notices regarding architectural drawings, floor areas, indicative pricing, and payment estimates.',
    canonicalPath: isPrivacy ? '/privacy' : '/terms',
  });

  return (
    <section className="py-20 lg:py-28">
      <div className="container-editorial max-w-3xl space-y-10">
        <div className="space-y-4 pb-8 border-b border-[var(--border-hairline)]">
          <p className="text-xs uppercase tracking-[0.24em] text-bronze">
            Governance &amp; Compliance
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink">
            {isPrivacy
              ? 'Privacy & Data Protection Notice'
              : 'Legal Notice & Property Disclaimers'}
          </h1>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            Effective November 2026 · Aurelia Developments Ltd.
          </p>
        </div>

        {isPrivacy ? (
          <div className="space-y-8 text-sm text-ink-secondary leading-relaxed">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-ink">
                1. Scope of Personal Information Collected
              </h2>
              <p>
                When you request a development brochure, schedule a site visit, or submit
                a residence inquiry, Aurelia Developments collects only the contact and
                preference details you explicitly provide—such as your name, email
                address, telephone number, country of residence, preferred contact
                channel, and residences of interest.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-ink">
                2. Purpose &amp; Lawful Basis
              </h2>
              <p>
                Your information is processed exclusively to fulfill your requested
                property documentation, coordinate private sales appointments, and assign
                an appropriate senior advisor. We never sell or syndicate client lists to
                third-party brokers or marketing networks.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-ink">
                3. Data Retention &amp; Client Rights
              </h2>
              <p>
                You may request access to, correction of, or deletion of your personal
                records at any time by writing to{' '}
                <span className="text-ink">privacy@aureliadevelopments.com</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-sm text-ink-secondary leading-relaxed">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-ink">
                1. Architectural Drawings &amp; Dimensions
              </h2>
              <p>
                All architectural plates, computer-generated photographs, floor plans,
                area measurements, and material descriptions on this platform are
                prepared with care for illustrative guidance only and do not constitute
                any part of a formal contract or warranty. Exact dimensions are governed
                solely by the executed Sales and Purchase Agreement.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-ink">
                2. Guide Pricing &amp; Availability
              </h2>
              <p>
                Residence availability (`AVAILABLE`, `RESERVED`, `SOLD`, `UNAVAILABLE`)
                and guide prices are subject to change or withdrawal without prior
                notice. Site-visit requests submitted online remain pending until
                confirmed in writing by an Aurelia Private Sales Advisor.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-ink">
                3. Indicative Payment Calculator Disclaimer
              </h2>
              <p>
                Outputs produced by the interactive payment calculator are mathematical
                illustrations only. Aurelia Developments is not a mortgage lender or
                financial advisor, and calculator estimates never imply credit or lender
                approval.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
