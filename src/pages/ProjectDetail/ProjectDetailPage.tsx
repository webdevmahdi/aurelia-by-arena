import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { ArchitecturalGallery } from '@/components/media/ArchitecturalGallery';
import { VideoAndTourShowcase } from '@/components/media/VideoAndTourShowcase';
import { ArchitecturalLocationMap } from '@/components/property/ArchitecturalLocationMap';
import { UnitsArchitecturalSchedule } from '@/components/property/UnitScheduleRowAndCard';
import {
  EmptyLedgerState,
  ErrorRetryState,
  LoadingPlate,
} from '@/components/ui/DataStates';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProjectStatusBadge } from '@/components/ui/StatusBadge';
import { PaymentCalculator } from '@/features/calculator/PaymentCalculator';
import { useGetProjectConstructionUpdatesQuery } from '@/features/construction/constructionApi';
import { ConstructionTimeline } from '@/features/construction/ConstructionTimeline';
import { useGetProjectFloorPlansQuery } from '@/features/floorPlans/floorPlansApi';
import { InteractiveFloorPlanViewer } from '@/features/floorPlans/InteractiveFloorPlanViewer';
import { useGetProjectBySlugQuery } from '@/features/projects/projectsApi';
import { useGetProjectUnitsQuery } from '@/features/units/unitsApi';
import { useHeroTimeline, useProjectReveal } from '@/hooks/useGsapAnimations';
import { useSeo } from '@/hooks/useSeo';
import {
  buildWhatsAppConciergeUrl,
  formatCurrency,
  formatProjectStatus,
} from '@/lib/format';

export default function ProjectDetailPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const dispatch = useAppDispatch();
  const heroRef = useRef<HTMLElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  const {
    data: project,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectBySlugQuery(projectSlug, { skip: !projectSlug });

  const projectId = project?.id ?? '';

  const { data: unitsData } = useGetProjectUnitsQuery(
    { projectId, params: { limit: 50 } },
    { skip: !projectId }
  );

  const { data: floorPlans = [] } = useGetProjectFloorPlansQuery(projectId, {
    skip: !projectId,
  });

  const { data: constructionUpdates = [] } =
    useGetProjectConstructionUpdatesQuery(projectId, {
      skip: !projectId,
    });

  const units = unitsData?.items ?? [];

  const areaRangeLabel = useMemo(() => {
    if (units.length === 0) return 'Upon Private Application';
    const areas = units.map((u) => u.areaSqFt);
    const min = Math.min(...areas);
    const max = Math.max(...areas);
    return min === max
      ? `${min.toLocaleString()} sq ft`
      : `${min.toLocaleString()} – ${max.toLocaleString()} sq ft`;
  }, [units]);

  const bedroomRangeLabel = useMemo(() => {
    if (!project || project.bedrooms.length === 0) return '—';
    const min = Math.min(...project.bedrooms);
    const max = Math.max(...project.bedrooms);
    return min === max ? `${min} Bedrooms` : `${min} – ${max} Bedrooms`;
  }, [project]);

  useHeroTimeline(heroRef);
  useProjectReveal(pageRef, Boolean(project));

  useSeo({
    title: project
      ? `${project.name} (${project.location.city}) — Aurelia Developments`
      : 'Development Monograph — Aurelia Developments',
    description:
      project?.tagline ??
      project?.description ??
      'Explore architectural specifications, floor plates, availability, and private viewings.',
    canonicalPath: `/projects/${projectSlug}`,
    ogImage: project?.heroMedia?.url ?? '/media/hero-sanctuary.jpg',
    ogType: 'article',
    structuredData: project
      ? {
          '@context': 'https://schema.org',
          '@type': 'ApartmentComplex',
          name: project.name,
          description: project.description,
          address: {
            '@type': 'PostalAddress',
            streetAddress: project.location.address,
            addressLocality: project.location.city,
            addressCountry: project.location.country,
          },
          numberOfAccommodationUnits: project.totalUnits,
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="container-wide py-24">
        <LoadingPlate label="Retrieving architectural monograph…" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="container-wide py-24 space-y-8">
        <ErrorRetryState error={error} onRetry={refetch} />
        <div className="text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink hover:text-bronze"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Back to All Developments</span>
          </Link>
        </div>
      </div>
    );
  }

  const heroImage =
    project.heroMedia?.url ?? project.gallery[0]?.url ?? '/media/hero-sanctuary.jpg';

  return (
    <div ref={pageRef} className="pb-20 lg:pb-0">
      {/* 1. HERO */}
      <section
        ref={heroRef}
        className="relative min-h-[78vh] bg-obsidian text-ivory flex items-end overflow-hidden border-b border-[var(--border-on-dark)]"
      >
        <div className="absolute inset-0 overflow-hidden">
          <img
            data-hero-media
            src={heroImage}
            alt={project.heroMedia?.alt ?? project.name}
            width={project.heroMedia?.width ?? 1600}
            height={project.heroMedia?.height ?? 1066}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171614] via-[#171614]/50 to-[#171614]/25" />
        </div>

        <div className="relative z-10 container-wide py-14 sm:py-20 w-full space-y-8">
          <div data-hero-kicker className="flex flex-wrap items-center gap-4">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ivory/80 hover:text-ivory"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Developments</span>
            </Link>
            <span className="text-ivory/35">/</span>
            <ProjectStatusBadge status={project.status} invert />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-brass">
                {project.location.address} · {project.location.city},{' '}
                {project.location.country}
              </p>
              <h1
                data-hero-title
                className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.03] text-ivory"
              >
                {project.name}
              </h1>
              {project.tagline && (
                <p
                  data-hero-copy
                  className="font-serif italic text-xl sm:text-2xl text-ivory/85 max-w-2xl"
                >
                  {project.tagline}
                </p>
              )}
            </div>

            <div
              data-hero-actions
              className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3"
            >
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openConversionModal({
                      mode: 'SITE_VISIT',
                      projectId: project.id,
                      projectName: project.name,
                    })
                  )
                }
                className="inline-flex items-center justify-between px-6 py-4 bg-ivory text-ink text-xs uppercase tracking-[0.2em] hover:bg-bronze hover:text-ivory transition-colors cursor-pointer"
              >
                <span>Schedule a Site Visit</span>
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openConversionModal({
                      mode: 'BROCHURE',
                      projectId: project.id,
                      projectName: project.name,
                    })
                  )
                }
                className="inline-flex items-center justify-between px-6 py-4 border border-ivory/40 bg-[#171614]/50 text-ivory text-xs uppercase tracking-[0.2em] hover:border-ivory transition-colors cursor-pointer"
              >
                <span>Request Brochure</span>
                <FileText className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Monograph Sub-Navigation */}
      <nav
        aria-label="Project sections"
        className="hidden md:block sticky top-20 z-30 bg-elevated/95 backdrop-blur-md border-b border-[var(--border-hairline)]"
      >
        <div className="container-wide h-13 flex items-center justify-between gap-6 text-[11px] uppercase tracking-[0.18em] text-ink-secondary overflow-x-auto">
          <div className="flex items-center gap-7">
            <a href="#overview" className="hover:text-ink py-1">
              Overview
            </a>
            <a href="#location" className="hover:text-ink py-1">
              Location
            </a>
            <a href="#amenities" className="hover:text-ink py-1">
              Amenities
            </a>
            <a href="#gallery" className="hover:text-ink py-1">
              Gallery
            </a>
            {floorPlans.length > 0 && (
              <a href="#floor-plans" className="hover:text-ink py-1">
                Floor Plans
              </a>
            )}
            <a href="#units" className="hover:text-ink py-1">
              Available Units ({project.availableUnits})
            </a>
            <a href="#payment-options" className="hover:text-ink py-1">
              Payment Options
            </a>
            <a href="#construction" className="hover:text-ink py-1">
              Progress
            </a>
          </div>
          <button
            type="button"
            onClick={() =>
              dispatch(
                openConversionModal({
                  mode: 'PRICING',
                  projectId: project.id,
                  projectName: project.name,
                })
              )
            }
            className="text-bronze hover:text-ink font-medium shrink-0 cursor-pointer"
          >
            Request Pricing →
          </button>
        </div>
      </nav>

      {/* 2 & 3. OVERVIEW & KEY FACTS */}
      <section id="overview" className="py-20 lg:py-28 border-b border-[var(--border-hairline)]">
        <div className="container-wide space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" data-reveal>
            <div className="lg:col-span-4 space-y-3">
              <span className="text-[11px] uppercase tracking-[0.22em] text-bronze">
                01 / Architectural Overview
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink">
                Spatial Intent &amp; Setting
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <p className="font-serif text-2xl sm:text-3xl leading-[1.35] text-ink">
                {project.description}
              </p>
            </div>
          </div>

          {/* Key Facts Architectural Matrix */}
          <dl
            data-reveal
            className="grid grid-cols-2 sm:grid-cols-4 border-t border-l border-[var(--border-hairline)] bg-elevated"
          >
            {[
              {
                label: 'Property Typology',
                value: project.propertyTypes.join(' · '),
              },
              {
                label: 'Total Commissioned',
                value: `${project.totalUnits} Private Residences`,
              },
              {
                label: 'Currently Available',
                value: `${project.availableUnits} Residences`,
              },
              {
                label: 'Starting Guide Price',
                value: formatCurrency(project.priceFrom, project.currency),
              },
              {
                label: 'Completion Status',
                value: formatProjectStatus(project.status),
              },
              {
                label: 'Residence Area Range',
                value: areaRangeLabel,
              },
              {
                label: 'Bedroom Configurations',
                value: bedroomRangeLabel,
              },
              {
                label: 'Principal Location',
                value: `${project.location.city}, ${project.location.country}`,
              },
            ].map((fact) => (
              <div
                key={fact.label}
                className="p-6 sm:p-7 border-r border-b border-[var(--border-hairline)] space-y-2"
              >
                <dt className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                  {fact.label}
                </dt>
                <dd className="text-sm sm:text-base font-medium text-ink tabular-nums">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 4. LOCATION */}
      <section
        id="location"
        className="py-20 lg:py-28 border-b border-[var(--border-hairline)] bg-stone/35"
      >
        <div className="container-wide space-y-12">
          <SectionHeading
            index="02"
            kicker="Address & Context"
            title="Precinct & Geographical Orientation"
            description={`${project.location.address}, ${project.location.city} — positioned for immediate cultural connectivity while preserving residential privacy.`}
          />
          <ArchitecturalLocationMap
            location={project.location}
            projectName={project.name}
          />
        </div>
      </section>

      {/* 5 & 6. ARCHITECTURE & AMENITIES */}
      <section
        id="amenities"
        className="py-20 lg:py-28 border-b border-[var(--border-hairline)]"
      >
        <div className="container-wide space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5" data-reveal>
              <span className="text-[11px] uppercase tracking-[0.22em] text-bronze">
                03 / Architecture &amp; Resident Amenities
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-ink leading-[1.08]">
                Private Hospitality Reserved Solely for Residents
              </h2>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Every shared space at {project.name} is operated as a private residential
                club—never open to commercial footfall—combining monolithic natural stone
                architecture with discreet 24-hour concierge stewardship.
              </p>
            </div>

            <div className="lg:col-span-7" data-reveal>
              <ul className="border-t border-[var(--border-hairline)] divide-y divide-[var(--border-hairline)]">
                {project.amenities.map((amenity, idx) => (
                  <li
                    key={amenity}
                    className="py-5 flex items-baseline gap-6 justify-between"
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="text-xs text-bronze tabular-nums tracking-[0.16em]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-serif text-xl sm:text-2xl text-ink">
                        {amenity}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                      Included
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GALLERY */}
      <section
        id="gallery"
        className="py-20 lg:py-28 border-b border-[var(--border-hairline)] bg-elevated/45"
      >
        <div className="container-wide space-y-12">
          <SectionHeading
            index="04"
            kicker="Photographic Monograph"
            title="Exterior Elevations & Interior Volumes"
            description="Select any plate to inspect materiality, fenestration, and daylighting in fullscreen."
          />
          <ArchitecturalGallery media={project.gallery} heading={project.name} />
        </div>
      </section>

      {/* 8. VIDEO & VIRTUAL TOUR */}
      {(project.videos.length > 0 || project.virtualTourUrl) && (
        <section className="py-20 lg:py-28 border-b border-[var(--border-hairline)]">
          <div className="container-wide space-y-12">
            <SectionHeading
              index="05"
              kicker="Film & Spatial Walkthrough"
              title="Remote Architectural Exploration"
              description="Step inside principal salons and subterranean wellness sanctuaries from anywhere in the world."
            />
            <VideoAndTourShowcase
              videos={project.videos}
              virtualTourUrl={project.virtualTourUrl}
              projectName={project.name}
              fallbackPoster={heroImage}
            />
          </div>
        </section>
      )}

      {/* 9. INTERACTIVE FLOOR PLANS */}
      {floorPlans.length > 0 && (
        <section
          id="floor-plans"
          className="py-20 lg:py-28 border-b border-[var(--border-hairline)] bg-stone/35"
        >
          <div className="container-wide space-y-12">
            <SectionHeading
              index="06"
              kicker="Dimensioned Plates"
              title="Interactive Floor Plans"
              description="Filter by elevation level, select individual residences to verify availability, and zoom or pan architectural drawings."
            />
            <InteractiveFloorPlanViewer
              floorPlans={floorPlans}
              units={units}
              projectId={project.id}
              projectName={project.name}
            />
          </div>
        </section>
      )}

      {/* 10. AVAILABLE UNITS */}
      <section id="units" className="py-20 lg:py-28 border-b border-[var(--border-hairline)]">
        <div className="container-wide space-y-12">
          <SectionHeading
            index="07"
            kicker="Schedule of Accommodations"
            title="Available Residences"
            description="Compare individual floor plates, orientations, and guide prices, or open the dedicated unit filter directory."
            action={
              <Link
                to={`/projects/${project.slug}/units`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors"
              >
                <span>Advanced Residence Filter</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            }
          />

          {units.length === 0 ? (
            <EmptyLedgerState
              title="Private Off-Market Release"
              description="Individual residence schedules for this commission are shared directly by our Private Sales Office."
            />
          ) : (
            <UnitsArchitecturalSchedule units={units} projectName={project.name} />
          )}
        </div>
      </section>

      {/* 11. PAYMENT OPTIONS / CALCULATOR */}
      <section
        id="payment-options"
        className="py-20 lg:py-28 border-b border-[var(--border-hairline)] bg-elevated/55"
      >
        <div className="container-wide space-y-12">
          <SectionHeading
            index="08"
            kicker="Acquisition Structure"
            title="Indicative Payment Calculator"
            description="Model illustrative monthly financing scenarios or request our construction-milestone payment schedule."
          />
          <PaymentCalculator
            initialPrice={project.priceFrom ?? 4250000}
            currency={project.currency}
            projectId={project.id}
            projectName={project.name}
          />
        </div>
      </section>

      {/* 12. CONSTRUCTION PROGRESS */}
      <section
        id="construction"
        className="py-20 lg:py-28 border-b border-[var(--border-hairline)]"
      >
        <div className="container-wide space-y-12">
          <SectionHeading
            index="09"
            kicker="Engineering Ledger"
            title="Construction Progress & Milestones"
            description="Dated engineering milestones and site verification updates."
          />
          <ConstructionTimeline
            overallProgress={project.constructionProgress}
            updates={constructionUpdates}
          />
        </div>
      </section>

      {/* 13 & 14. DEVELOPER CREDIBILITY & CONVERSION CTA */}
      <section className="py-24 lg:py-32 bg-obsidian text-ivory">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-[0.24em] text-brass">
              10 / Aurelia Developments · Private Sales
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl text-ivory leading-[1.08]">
              Acquire a Residence at {project.name}
            </h2>
            <p className="text-sm sm:text-base text-ivory-muted leading-relaxed max-w-xl">
              Commissioned and delivered by Aurelia Developments with ring-fenced escrow
              governance and dedicated post-handover estate management. Arrange a private
              presentation in person or via live spatial walkthrough.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-brass hover:text-ivory transition-colors"
            >
              <span>About Aurelia Developments</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="lg:col-span-5 border border-[var(--border-on-dark-strong)] bg-charcoal p-8 sm:p-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ivory-muted">
              Direct Conversion Routes
            </p>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  openConversionModal({
                    mode: 'SITE_VISIT',
                    projectId: project.id,
                    projectName: project.name,
                  })
                )
              }
              className="w-full py-3.5 px-5 bg-ivory text-ink text-xs uppercase tracking-[0.18em] hover:bg-bronze hover:text-ivory transition-colors cursor-pointer"
            >
              Schedule a Site Visit
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  openConversionModal({
                    mode: 'PRICING',
                    projectId: project.id,
                    projectName: project.name,
                  })
                )
              }
              className="w-full py-3.5 px-5 border border-ivory/35 text-ivory text-xs uppercase tracking-[0.18em] hover:border-ivory transition-colors cursor-pointer"
            >
              Request Confidential Pricing
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  openConversionModal({
                    mode: 'BROCHURE',
                    projectId: project.id,
                    projectName: project.name,
                  })
                )
              }
              className="w-full py-3.5 px-5 border border-[var(--border-on-dark)] text-ivory-muted text-xs uppercase tracking-[0.18em] hover:text-ivory hover:border-ivory transition-colors cursor-pointer"
            >
              Download Architectural Brochure
            </button>
            <a
              href={buildWhatsAppConciergeUrl(project.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-xs uppercase tracking-[0.16em] text-brass hover:text-ivory transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>WhatsApp Dedicated Advisor</span>
            </a>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Conversion Bar (PRD Section 20) */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-elevated/95 backdrop-blur-md border-t border-[var(--border-strong)] p-3 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() =>
            dispatch(
              openConversionModal({
                mode: 'SITE_VISIT',
                projectId: project.id,
                projectName: project.name,
              })
            )
          }
          className="flex-1 py-3 px-3 bg-ink text-ivory text-[11px] uppercase tracking-[0.16em]"
        >
          Schedule Visit
        </button>
        <button
          type="button"
          onClick={() =>
            dispatch(
              openConversionModal({
                mode: 'PRICING',
                projectId: project.id,
                projectName: project.name,
              })
            )
          }
          className="flex-1 py-3 px-3 border border-ink text-ink text-[11px] uppercase tracking-[0.16em]"
        >
          Request Pricing
        </button>
      </div>
    </div>
  );
}
