import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import { useProjectReveal } from '@/hooks/useGsapAnimations';
import { useSeo } from '@/hooks/useSeo';
import { formatProjectStatus } from '@/lib/format';

export default function AboutPage() {
  const dispatch = useAppDispatch();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const { data } = useGetProjectsQuery({ limit: 50 });
  const projects = data?.items ?? [];

  useProjectReveal(pageRef, true);

  useSeo({
    title: 'About Aurelia Developments — Architectural Ethos & Stewardship',
    description:
      'Learn how Aurelia Developments commissions low-density architectural residences built from quarry-numbered natural stone, bronze, and enduring engineering.',
    canonicalPath: '/about',
  });

  return (
    <div ref={pageRef}>
      {/* Editorial Monograph Header */}
      <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)] bg-elevated/60">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8 space-y-6">
            <p className="text-xs uppercase tracking-[0.24em] text-bronze">
              Developer Monograph · Est. London &amp; Geneva
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-ink leading-[1.04]">
              Architecture conceived as enduring cultural infrastructure.
            </h1>
          </div>
          <p className="lg:col-span-4 text-sm text-ink-secondary leading-relaxed">
            Aurelia Developments was founded by architects, structural engineers, and
            fiduciary stewards united by a single conviction: residential buildings should
            grow more dignified with every decade.
          </p>
        </div>
      </section>

      {/* Large Plate + Founding Essay */}
      <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)]">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 border border-[var(--border-hairline)] overflow-hidden aspect-[16/10]" data-reveal>
            <img
              src="/media/amenity-pool.jpg"
              alt="Subterranean Vals stone lap pool illuminated by natural daylight shafts"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-5 space-y-6" data-reveal>
            <span className="text-[11px] uppercase tracking-[0.22em] text-bronze">
              01 / Architectural Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-[1.15]">
              Why We Refuse Volume-Driven Development
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Conventional residential development optimizes net-to-gross floor plates at
              the expense of ceiling clearance, wall thickness, and acoustic privacy. At
              Aurelia, we invert that equation—limiting every building to between twelve and
              twenty-four residences so each home enjoys dual- or triple-aspect natural
              light and private lift arrival.
            </p>
            <p className="text-sm text-ink-secondary leading-relaxed">
              From hand-dressed Portland ashlar in Mayfair to Roman travertine rain-screens
              on Jumeirah Bay, we specify materials that weather gracefully rather than
              synthetic claddings that require replacement.
            </p>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)] bg-stone/40">
        <div className="container-wide space-y-14">
          <SectionHeading
            index="02"
            kicker="Disciplines"
            title="The Aurelia Standard"
            description="Every residence across our international portfolio adheres to three non-negotiable engineering and fiduciary commitments."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4 pt-6 border-t border-ink" data-reveal>
              <span className="text-xs uppercase tracking-[0.2em] text-bronze">
                01 · Material Provenance
              </span>
              <h3 className="font-serif text-3xl text-ink">
                Quarry-Numbered Stone &amp;FSC Timber
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                We partner directly with family-run quarries in Tivoli, Dorset, and Vals,
                alongside European joinery workshops crafting bespoke smoked oak and fluted
                walnut interiors.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-ink" data-reveal>
              <span className="text-xs uppercase tracking-[0.2em] text-bronze">
                02 · Environmental Longevity
              </span>
              <h3 className="font-serif text-3xl text-ink">
                Passive Solar &amp; Geothermal Engineering
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Deep bronze loggia overhangs, low-iron triple glazing, geothermal heat
                exchange, and hospital-grade MERV-15 air filtration reduce operational
                energy while elevating indoor wellness.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-ink" data-reveal>
              <span className="text-xs uppercase tracking-[0.2em] text-bronze">
                03 · Purchaser Governance
              </span>
              <h3 className="font-serif text-3xl text-ink">
                Escrow Custody &amp; Lifetime Stewardship
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Independent engineering certifiers oversee every construction milestone, and
                Aurelia Resident Services retains long-term building stewardship post-handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Portfolio Index */}
      {projects.length > 0 && (
        <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)]">
          <div className="container-wide space-y-12">
            <SectionHeading
              index="03"
              kicker="Commission Ledger"
              title="Current & Completed Portfolio"
            />

            <div className="border-t border-[var(--border-hairline)] divide-y divide-[var(--border-hairline)]">
              {projects.map((p, idx) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.slug}`}
                  className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-elevated/70 px-4 -mx-4 transition-colors"
                >
                  <div className="flex items-baseline gap-6">
                    <span className="text-xs text-bronze tabular-nums">
                      0{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl text-ink group-hover:text-bronze transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-ink-muted uppercase tracking-[0.16em] mt-1">
                        {p.location.address} · {p.location.city}, {p.location.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs uppercase tracking-[0.16em] text-ink-secondary">
                    <span>{formatProjectStatus(p.status)}</span>
                    <span className="tabular-nums text-ink">
                      {p.totalUnits} Residences
                    </span>
                    <ArrowUpRight
                      className="w-4 h-4 text-bronze group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      strokeWidth={1.5}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-obsidian text-ivory">
        <div className="container-editorial text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.24em] text-brass">
            Private Consultation
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-ivory">
            Connect With Our Senior Advisory Partners
          </h2>
          <p className="text-sm text-ivory-muted max-w-lg mx-auto leading-relaxed">
            For private family-office briefings, multi-residence acquisitions, or bespoke
            penthouse amalgamations, speak directly with our leadership desk.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                dispatch(openConversionModal({ mode: 'GENERAL_INQUIRY' }))
              }
              className="px-7 py-4 bg-ivory text-ink text-xs uppercase tracking-[0.2em] hover:bg-bronze hover:text-ivory transition-colors cursor-pointer"
            >
              Arrange Private Briefing
            </button>
            <Link
              to="/contact"
              className="px-7 py-4 border border-ivory/35 text-ivory text-xs uppercase tracking-[0.2em] hover:border-ivory transition-colors"
            >
              Global Sales Offices
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
