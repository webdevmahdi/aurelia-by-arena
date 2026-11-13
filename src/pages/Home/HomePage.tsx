import { ArrowRight, ArrowUpRight, FileText, MessageCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { ProjectPlateCard } from '@/components/property/ProjectPlateCard';
import { UnitsArchitecturalSchedule } from '@/components/property/UnitScheduleRowAndCard';
import { ErrorRetryState, LoadingPlate } from '@/components/ui/DataStates';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProjectStatusBadge } from '@/components/ui/StatusBadge';
import { useGetProjectConstructionUpdatesQuery } from '@/features/construction/constructionApi';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import { useGetProjectUnitsQuery } from '@/features/units/unitsApi';
import {
  useHeroTimeline,
  useParallaxSection,
  useProjectReveal,
} from '@/hooks/useGsapAnimations';
import { useSeo } from '@/hooks/useSeo';
import {
  buildWhatsAppConciergeUrl,
  formatCurrency,
  formatDateEditorial,
} from '@/lib/format';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const heroRef = useRef<HTMLElement | null>(null);
  const revealScopeRef = useRef<HTMLDivElement | null>(null);
  const parallaxScopeRef = useRef<HTMLElement | null>(null);

  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsError,
    refetch: refetchProjects,
  } = useGetProjectsQuery({ limit: 12 });

  const projects = projectsData?.items ?? [];
  const featuredProject = projects[0];
  const selectedProjects = projects.slice(1, 5);

  const [snapshotProjectId, setSnapshotProjectId] = useState<string>('');
  const activeSnapshotProject =
    projects.find((p) => p.id === snapshotProjectId) ?? featuredProject;

  const { data: snapshotUnitsData, isLoading: isUnitsLoading } =
    useGetProjectUnitsQuery(
      {
        projectId: activeSnapshotProject?.id ?? '',
        params: { limit: 6, sort: 'floor_desc' },
      },
      { skip: !activeSnapshotProject?.id }
    );

  const { data: featuredUpdates = [] } = useGetProjectConstructionUpdatesQuery(
    featuredProject?.id ?? '',
    { skip: !featuredProject?.id }
  );

  useHeroTimeline(heroRef);
  useProjectReveal(revealScopeRef, projects.length > 0);
  useParallaxSection(parallaxScopeRef);

  useSeo({
    title: 'Aurelia Developments — Architectural Residences & Private Estates',
    description:
      'Discover architectural residences by Aurelia Developments across London, Dubai, Mallorca, Geneva, and New York. Request private pricing, floor plates, or schedule a site viewing.',
    canonicalPath: '/',
    ogImage: '/media/hero-sanctuary.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: 'Aurelia Developments',
      description:
        'Developer of architectural residences crafted with natural stone, bronze, and generational permanence.',
      url: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
    },
  });

  const totalPortfolioUnits = projects.reduce((acc, p) => acc + p.totalUnits, 0);
  const totalAvailableUnits = projects.reduce((acc, p) => acc + p.availableUnits, 0);
  const distinctCities = Array.from(new Set(projects.map((p) => p.location.city)));

  return (
    <div ref={revealScopeRef}>
      {/* 1. CINEMATIC ARCHITECTURAL HERO */}
      <section
        ref={heroRef}
        className="relative min-h-[86vh] lg:min-h-[90vh] bg-obsidian text-ivory flex items-end overflow-hidden border-b border-[var(--border-on-dark)]"
      >
        <div className="absolute inset-0 overflow-hidden">
          <img
            data-hero-media
            src="/media/hero-sanctuary.jpg"
            alt="Cantilevered travertine stone and bronze coastal residence at dusk"
            width={1600}
            height={1066}
            fetchPriority="high"
            className="w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#171614] via-[#171614]/52 to-[#171614]/20"
          />
        </div>

        <div className="relative z-10 container-wide py-16 sm:py-20 lg:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-6">
              <p
                data-hero-kicker
                className="text-xs uppercase tracking-[0.26em] text-brass"
              >
                Aurelia Developments · Architectural Monograph
              </p>
              <h1
                data-hero-title
                className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.03] tracking-[-0.02em] text-ivory max-w-4xl"
              >
                Architecture of quiet permanence, built for generational living.
              </h1>
              <p
                data-hero-copy
                className="text-base sm:text-lg text-ivory/85 max-w-xl leading-relaxed"
              >
                Low-density stone and bronze residences across waterfront peninsulas and
                historic cultural quarters—designed from the inside out around daylight,
                proportion, and privacy.
              </p>
            </div>

            <div
              data-hero-actions
              className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch"
            >
              <button
                type="button"
                onClick={() => dispatch(openConversionModal({ mode: 'SITE_VISIT' }))}
                className="inline-flex items-center justify-between px-6 py-4 bg-ivory text-ink text-xs uppercase tracking-[0.2em] hover:bg-bronze hover:text-ivory transition-colors cursor-pointer"
              >
                <span>Schedule a Site Visit</span>
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <Link
                to="/projects"
                className="inline-flex items-center justify-between px-6 py-4 border border-ivory/40 bg-[#171614]/45 backdrop-blur-[2px] text-ivory text-xs uppercase tracking-[0.2em] hover:border-ivory transition-colors"
              >
                <span>Explore Developments</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEVELOPER POSITIONING / ARCHITECTURAL STATEMENT */}
      <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)]">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-4 space-y-3" data-reveal>
            <span className="text-[11px] uppercase tracking-[0.22em] text-bronze">
              01 / Developer Positioning
            </span>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
              Restraint as a Measure of Value
            </p>
          </div>

          <div className="lg:col-span-8 space-y-12" data-reveal>
            <p className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-[1.2] text-ink font-normal">
              We commission fewer than twenty-five residences per address—pairing
              quarry-selected limestone, hand-patinated bronze, and museum-grade acoustic
              engineering to create homes that age with dignity.
            </p>

            {projects.length > 0 && (
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-10 border-t border-[var(--border-hairline)]">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                    Active Portfolio
                  </dt>
                  <dd className="font-serif text-4xl text-ink tabular-nums mt-2">
                    0{projects.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                    Total Commissioned
                  </dt>
                  <dd className="font-serif text-4xl text-ink tabular-nums mt-2">
                    {totalPortfolioUnits}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                    Available Now
                  </dt>
                  <dd className="font-serif text-4xl text-bronze tabular-nums mt-2">
                    {totalAvailableUnits}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                    Sanctuary Cities
                  </dt>
                  <dd className="font-serif text-4xl text-ink tabular-nums mt-2">
                    0{distinctCities.length}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* 3. FEATURED DEVELOPMENT */}
      <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)] bg-elevated/45">
        <div className="container-wide space-y-12">
          <SectionHeading
            index="02"
            kicker="Flagship Commission"
            title="Featured Architectural Release"
            description="An intimate look at our principal waterfront commission, currently welcoming private appointments and off-plan reservations."
            action={
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink hover:text-bronze transition-colors"
              >
                <span>All Developments</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            }
          />

          {isProjectsLoading ? (
            <LoadingPlate label="Loading flagship commission…" />
          ) : isProjectsError ? (
            <ErrorRetryState error={projectsError} onRetry={refetchProjects} />
          ) : featuredProject ? (
            <ProjectPlateCard project={featuredProject} indexNumber={1} featuredLayout />
          ) : null}
        </div>
      </section>

      {/* 4. SELECTED PROJECTS */}
      <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)]">
        <div className="container-wide space-y-12">
          <SectionHeading
            index="03"
            kicker="Curated Portfolio"
            title="Selected Developments"
            description="Each address responds to its immediate topography and architectural vernacular—never repeating a standardized template."
            action={
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink text-xs uppercase tracking-[0.18em] hover:bg-ink hover:text-ivory transition-colors"
              >
                <span>Filter All Residences</span>
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            }
          />

          {isProjectsLoading ? (
            <LoadingPlate />
          ) : isProjectsError ? (
            <ErrorRetryState error={projectsError} onRetry={refetchProjects} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {selectedProjects.map((project, i) => (
                <ProjectPlateCard key={project.id} project={project} indexNumber={i + 2} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. ARCHITECTURAL / LIFESTYLE EDITORIAL SECTION */}
      <section
        ref={parallaxScopeRef}
        className="py-24 lg:py-32 bg-obsidian text-ivory border-b border-[var(--border-on-dark)]"
      >
        <div className="container-wide space-y-16">
          <SectionHeading
            index="04"
            kicker="Materiality & Interior Volume"
            title="Crafted Around Natural Light, Tactile Stone, and Silence"
            description="True residential luxury is felt in ceiling height, wall depth, acoustic isolation, and the way honed stone holds late-afternoon warmth."
            invert
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 overflow-hidden border border-[var(--border-on-dark)] aspect-[16/10]">
              <img
                data-parallax-media
                src="/media/interior-living.jpg"
                alt="Double-height travertine salon with bespoke oak millwork opening onto coastal terrace"
                loading="lazy"
                className="w-full h-[112%] object-cover"
              />
            </div>

            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3 pb-6 border-b border-[var(--border-on-dark)]">
                <span className="text-[11px] uppercase tracking-[0.2em] text-brass">
                  I · Proportion &amp; Glazing
                </span>
                <h3 className="font-serif text-2xl text-ivory">
                  Generous 3.6m to 6.2m Clearances
                </h3>
                <p className="text-sm text-ivory-muted leading-relaxed">
                  Slimline thermally broken bronze frames recess flush into honed travertine
                  thresholds, dissolving the boundary between salon and cantilevered loggia.
                </p>
              </div>

              <div className="space-y-3 pb-6 border-b border-[var(--border-on-dark)]">
                <span className="text-[11px] uppercase tracking-[0.2em] text-brass">
                  II · Provenance of Material
                </span>
                <h3 className="font-serif text-2xl text-ivory">
                  Monolithic Stone &amp;FSC Smoked Oak
                </h3>
                <p className="text-sm text-ivory-muted leading-relaxed">
                  Every slab of Tivoli travertine, Dorset Portland stone, and Pietra Grey
                  marble is dry-laid and sequence-numbered prior to installation.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-brass">
                  III · Wellness Sanctuary
                </span>
                <h3 className="font-serif text-2xl text-ivory">
                  Subterranean Thermal &amp; Acoustic Calm
                </h3>
                <p className="text-sm text-ivory-muted leading-relaxed">
                  Floating acoustic floor slabs, hospital-grade fresh air filtration, and
                  resident-only Vals quartzite lap pools cultivate restorative daily living.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LOCATION / VALUE PROPOSITION */}
      <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)] bg-stone/45">
        <div className="container-wide space-y-12">
          <SectionHeading
            index="05"
            kicker="Geography & Scarcity"
            title="Irreplaceable Addresses, Enduring Capital Value"
            description="We acquire only finite waterfront peninsulas, conservation-protected squares, and cultural precincts where future supply is structurally constrained."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-hairline)] border border-[var(--border-hairline)] bg-elevated">
            {projects.slice(0, 3).map((proj) => (
              <div key={proj.id} className="p-8 lg:p-10 flex flex-col justify-between gap-8">
                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-bronze">
                    {proj.location.city} · {proj.location.country}
                  </span>
                  <h3 className="font-serif text-3xl text-ink">{proj.name}</h3>
                  <p className="text-xs text-ink-muted uppercase tracking-[0.14em]">
                    {proj.location.address}
                  </p>
                  <p className="text-sm text-ink-secondary leading-relaxed pt-2">
                    Limited to {proj.totalUnits} private residences with{' '}
                    {proj.availableUnits} currently available for acquisition.
                  </p>
                </div>
                <Link
                  to={`/projects?location=${encodeURIComponent(proj.location.city)}`}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink hover:text-bronze transition-colors"
                >
                  <span>Explore {proj.location.city}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. LIVE AVAILABILITY SNAPSHOT */}
      <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)]">
        <div className="container-wide space-y-10">
          <SectionHeading
            index="06"
            kicker="Live Schedule of Residences"
            title="Availability Snapshot"
            description="Inspect real-time residence availability, floor plates, orientations, and guide pricing directly from our private sales ledger."
            action={
              activeSnapshotProject ? (
                <Link
                  to={`/projects/${activeSnapshotProject.slug}/units`}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink hover:text-bronze transition-colors"
                >
                  <span>Full {activeSnapshotProject.name} Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              ) : null
            }
          />

          {/* Project Switcher Tabs */}
          {projects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {projects.map((proj) => {
                const isSelected = activeSnapshotProject?.id === proj.id;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setSnapshotProjectId(proj.id)}
                    className={`px-4 py-2.5 text-xs uppercase tracking-[0.16em] border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-ink text-ivory border-ink'
                        : 'bg-elevated text-ink-secondary border-[var(--border-hairline)] hover:border-ink'
                    }`}
                  >
                    {proj.name} ({proj.availableUnits})
                  </button>
                );
              })}
            </div>
          )}

          {isUnitsLoading ? (
            <LoadingPlate label="Updating residence availability…" />
          ) : snapshotUnitsData && snapshotUnitsData.items.length > 0 ? (
            <UnitsArchitecturalSchedule
              units={snapshotUnitsData.items}
              projectName={activeSnapshotProject?.name}
            />
          ) : null}
        </div>
      </section>

      {/* 8. CONSTRUCTION / PROGRESS HIGHLIGHT */}
      {featuredProject && (
        <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)] bg-elevated/55">
          <div className="container-wide space-y-12">
            <SectionHeading
              index="07"
              kicker="Site Engineering & Delivery"
              title="Transparent Construction Progress"
              description="Every Aurelia commission publishes dated structural certifications and site photography verified by independent project monitors."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 border border-[var(--border-hairline)] bg-elevated">
              <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-[var(--border-hairline)]">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <ProjectStatusBadge status={featuredProject.status} />
                    <span className="font-serif text-4xl text-ink tabular-nums">
                      {featuredProject.constructionProgress}% Complete
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-stone">
                    <div
                      style={{ width: `${featuredProject.constructionProgress}%` }}
                      className="h-full bg-ink"
                    />
                  </div>

                  <h3 className="font-serif text-3xl text-ink pt-2">
                    {featuredProject.name} — {featuredProject.location.city}
                  </h3>

                  {featuredUpdates[0] && (
                    <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-bronze">
                        Latest Milestone · {formatDateEditorial(featuredUpdates[0].date)}
                      </p>
                      <p className="font-medium text-ink">{featuredUpdates[0].title}</p>
                      <p className="text-sm text-ink-secondary leading-relaxed">
                        {featuredUpdates[0].description}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Link
                    to={`/projects/${featuredProject.slug}#construction`}
                    className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink text-xs uppercase tracking-[0.18em] hover:bg-ink hover:text-ivory transition-colors"
                  >
                    <span>Inspect Site Ledger</span>
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <img
                  src="/media/construction-progress.jpg"
                  alt="Precision travertine stone facade panels being installed on structural concrete frame"
                  loading="lazy"
                  className="w-full h-full object-cover aspect-[16/11]"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. DEVELOPER CREDIBILITY */}
      <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)]">
        <div className="container-wide space-y-12">
          <SectionHeading
            index="08"
            kicker="Stewardship & Governance"
            title="Built With Institutional Rigor"
            description="Acquiring an architectural residence demands absolute clarity in engineering standards, escrow protection, and long-term estate management."
            action={
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink hover:text-bronze transition-colors"
              >
                <span>Read Developer Monograph</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="pt-6 border-t border-ink space-y-3">
              <span className="text-xs uppercase tracking-[0.2em] text-bronze tabular-nums">
                Standard 01
              </span>
              <h3 className="font-serif text-2xl text-ink">
                Ring-Fenced Project Escrow
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                All purchaser milestone payments are held in regulated project-specific
                escrow accounts released solely against certified engineering completion.
              </p>
            </div>

            <div className="pt-6 border-t border-ink space-y-3">
              <span className="text-xs uppercase tracking-[0.2em] text-bronze tabular-nums">
                Standard 02
              </span>
              <h3 className="font-serif text-2xl text-ink">
                Decennial Structural Warranty
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Every structure undergoes independent acoustic, thermal, and facade
                weathering certification backed by ten-year structural latent defects cover.
              </p>
            </div>

            <div className="pt-6 border-t border-ink space-y-3">
              <span className="text-xs uppercase tracking-[0.2em] text-bronze tabular-nums">
                Standard 03
              </span>
              <h3 className="font-serif text-2xl text-ink">
                In-House Estate Stewardship
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Post-handover concierge, stone conservation, botanical upkeep, and preventive
                engineering remain managed directly by Aurelia Resident Services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CONVERSION SECTION */}
      <section className="py-24 lg:py-32 bg-stone/70">
        <div className="container-editorial text-center space-y-8">
          <p className="text-xs uppercase tracking-[0.24em] text-bronze">
            Private Acquisition Desk
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink max-w-3xl mx-auto leading-[1.08]">
            Arrange a Private Gallery Presentation or Remote Walkthrough
          </h2>
          <p className="text-base text-ink-secondary max-w-xl mx-auto leading-relaxed">
            Senior advisors in London, Dubai, Geneva, and New York are available for
            confidential portfolio briefings, dimensioned floor-plate reviews, and on-site
            inspections.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => dispatch(openConversionModal({ mode: 'SITE_VISIT' }))}
              className="px-7 py-4 bg-ink text-ivory text-xs uppercase tracking-[0.2em] hover:bg-bronze transition-colors cursor-pointer"
            >
              Schedule a Site Visit
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  openConversionModal({
                    mode: 'BROCHURE',
                    projectId: featuredProject?.id,
                    projectName: featuredProject?.name,
                  })
                )
              }
              className="inline-flex items-center gap-2 px-6 py-4 border border-ink bg-elevated text-ink text-xs uppercase tracking-[0.18em] hover:bg-ink hover:text-ivory transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span>Request Portfolio Brochure</span>
            </button>
            <a
              href={buildWhatsAppConciergeUrl('the Aurelia residential portfolio')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 border border-[var(--border-strong)] bg-elevated text-ink text-xs uppercase tracking-[0.18em] hover:border-ink transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-bronze" strokeWidth={1.5} />
              <span>WhatsApp Concierge</span>
            </a>
          </div>

          {featuredProject?.priceFrom && (
            <p className="text-xs uppercase tracking-[0.18em] text-ink-muted pt-2 tabular-nums">
              Current Residences From{' '}
              {formatCurrency(featuredProject.priceFrom, featuredProject.currency)}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
