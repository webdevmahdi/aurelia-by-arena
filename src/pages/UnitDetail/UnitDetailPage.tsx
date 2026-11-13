import clsx from 'clsx';
import {
  ArrowLeft,
  Calendar,
  Compass,
  FileText,
  MessageCircle,
  Scale,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { ArchitecturalGallery } from '@/components/media/ArchitecturalGallery';
import { ErrorRetryState, LoadingPlate } from '@/components/ui/DataStates';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { UnitStatusBadge } from '@/components/ui/StatusBadge';
import { PaymentCalculator } from '@/features/calculator/PaymentCalculator';
import { toggleCompareUnit } from '@/features/comparison/comparisonSlice';
import { InteractiveFloorPlanViewer } from '@/features/floorPlans/InteractiveFloorPlanViewer';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import { useGetUnitByIdQuery } from '@/features/units/unitsApi';
import { useSeo } from '@/hooks/useSeo';
import {
  buildWhatsAppConciergeUrl,
  formatArea,
  formatCurrency,
} from '@/lib/format';

export default function UnitDetailPage() {
  const { unitId = '' } = useParams<{ unitId: string }>();
  const dispatch = useAppDispatch();
  const comparedIds = useAppSelector((s) => s.comparison.items.map((i) => i.id));

  const {
    data: unit,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUnitByIdQuery(unitId, { skip: !unitId });

  const { data: projectsData } = useGetProjectsQuery({ limit: 50 });
  const parentProject = projectsData?.items.find(
    (p) => p.id === unit?.projectId
  );

  const isCompared = unit ? comparedIds.includes(unit.id) : false;

  useSeo({
    title: unit
      ? `Residence ${unit.unitNumber}${
          parentProject ? ` at ${parentProject.name}` : ''
        } — Aurelia Developments`
      : 'Residence Dossier — Aurelia Developments',
    description: unit
      ? `${unit.bedrooms}-bedroom ${unit.propertyType} (${unit.areaSqFt.toLocaleString()} sq ft) on Floor ${unit.floor}. Guide price ${formatCurrency(unit.price, unit.currency)}.`
      : 'Inspect architectural residence specifications, floor plates, and payment estimates.',
    canonicalPath: `/units/${unitId}`,
    ogImage: unit?.media[0]?.url ?? parentProject?.heroMedia?.url,
    structuredData: unit
      ? {
          '@context': 'https://schema.org',
          '@type': 'Accommodation',
          name: `Residence ${unit.unitNumber}`,
          floorLevel: String(unit.floor),
          numberOfBedrooms: unit.bedrooms,
          numberOfBathroomsTotal: unit.bathrooms,
          floorSize: {
            '@type': 'QuantitativeValue',
            value: unit.areaSqFt,
            unitCode: 'FTK',
          },
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="container-wide py-24">
        <LoadingPlate label="Retrieving residence dossier…" />
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="container-wide py-24 space-y-8">
        <ErrorRetryState error={error} onRetry={refetch} />
        <div className="text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink hover:text-bronze"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Return to Developments</span>
          </Link>
        </div>
      </div>
    );
  }

  const pricePerSqFt = Math.round(unit.price / Math.max(1, unit.areaSqFt));

  return (
    <div className="pb-20 lg:pb-0">
      {/* Top Dossier Header & Conversion Panel */}
      <section className="py-12 lg:py-20 border-b border-[var(--border-hairline)] bg-elevated/60">
        <div className="container-wide space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
              {parentProject ? (
                <>
                  <Link
                    to={`/projects/${parentProject.slug}`}
                    className="hover:text-ink transition-colors"
                  >
                    {parentProject.name}
                  </Link>
                  <span>/</span>
                  <Link
                    to={`/projects/${parentProject.slug}/units`}
                    className="hover:text-ink transition-colors"
                  >
                    Residences
                  </Link>
                  <span>/</span>
                </>
              ) : (
                <>
                  <Link to="/search" className="hover:text-ink transition-colors">
                    Residences
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-ink">{unit.unitNumber}</span>
            </div>

            <button
              type="button"
              onClick={() => dispatch(toggleCompareUnit(unit))}
              className={clsx(
                'inline-flex items-center gap-2 px-4 py-2 border text-xs uppercase tracking-[0.16em] transition-colors cursor-pointer',
                isCompared
                  ? 'bg-bronze text-ivory border-bronze'
                  : 'border-[var(--border-strong)] bg-canvas text-ink hover:border-ink'
              )}
            >
              <Scale className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{isCompared ? 'In Comparison' : 'Add to Compare'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <UnitStatusBadge status={unit.status} />
                <span className="text-xs uppercase tracking-[0.2em] text-bronze">
                  {unit.propertyType} · Elevation Level {unit.floor}
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl text-ink leading-[1.05]">
                Residence {unit.unitNumber}
              </h1>

              {parentProject && (
                <p className="text-sm text-ink-secondary">
                  {parentProject.name} — {parentProject.location.address},{' '}
                  {parentProject.location.city}, {parentProject.location.country}
                </p>
              )}

              {/* Architectural Spec Grid */}
              <dl className="grid grid-cols-2 sm:grid-cols-3 border-t border-l border-[var(--border-hairline)] bg-canvas pt-0">
                <div className="p-5 border-r border-b border-[var(--border-hairline)]">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Total Area
                  </dt>
                  <dd className="text-sm font-medium text-ink tabular-nums mt-1">
                    {formatArea(unit.areaSqFt)}
                  </dd>
                </div>
                <div className="p-5 border-r border-b border-[var(--border-hairline)]">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Accommodations
                  </dt>
                  <dd className="text-sm font-medium text-ink tabular-nums mt-1">
                    {unit.bedrooms} Bedrooms · {unit.bathrooms} Baths
                  </dd>
                </div>
                <div className="p-5 border-r border-b border-[var(--border-hairline)]">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Elevation Floor
                  </dt>
                  <dd className="text-sm font-medium text-ink tabular-nums mt-1">
                    Level {String(unit.floor).padStart(2, '0')}
                  </dd>
                </div>
                <div className="p-5 border-r border-b border-[var(--border-hairline)]">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Orientation
                  </dt>
                  <dd className="text-sm font-medium text-ink mt-1 inline-flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
                    <span>{unit.orientation ?? 'Upon Application'}</span>
                  </dd>
                </div>
                <div className="p-5 border-r border-b border-[var(--border-hairline)] sm:col-span-2">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Principal Aspect &amp; View
                  </dt>
                  <dd className="text-sm font-medium text-ink mt-1">
                    {unit.view ?? 'Private Architectural Outlook'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right: Pricing & High-Intent Actions */}
            <div className="lg:col-span-5 border border-[var(--border-strong)] bg-canvas p-7 sm:p-9 space-y-6">
              <div className="pb-6 border-b border-[var(--border-hairline)] space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
                  Guide Acquisition Price ({unit.currency})
                </span>
                <p className="font-serif text-4xl sm:text-5xl text-ink tabular-nums">
                  {formatCurrency(unit.price, unit.currency)}
                </p>
                <p className="text-xs text-ink-muted tabular-nums">
                  Indicative {formatCurrency(pricePerSqFt, unit.currency)} / sq ft
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      openConversionModal({
                        mode: 'UNIT_INQUIRY',
                        projectId: unit.projectId,
                        projectName: parentProject?.name,
                        unitId: unit.id,
                        unitNumber: unit.unitNumber,
                        defaultBudget: formatCurrency(unit.price, unit.currency),
                      })
                    )
                  }
                  className="w-full py-3.5 px-5 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors cursor-pointer"
                >
                  Enquire About This Residence
                </button>

                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      openConversionModal({
                        mode: 'SITE_VISIT',
                        projectId: unit.projectId,
                        projectName: parentProject?.name,
                        unitId: unit.id,
                        unitNumber: unit.unitNumber,
                      })
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 border border-ink text-ink text-xs uppercase tracking-[0.18em] hover:bg-ink hover:text-ivory transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Schedule a Site Visit</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        openConversionModal({
                          mode: 'PRICING',
                          projectId: unit.projectId,
                          projectName: parentProject?.name,
                          unitId: unit.id,
                          unitNumber: unit.unitNumber,
                        })
                      )
                    }
                    className="py-3 px-3 border border-[var(--border-strong)] text-xs uppercase tracking-[0.14em] text-ink hover:border-ink transition-colors cursor-pointer"
                  >
                    Request Pricing
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        openConversionModal({
                          mode: 'BROCHURE',
                          projectId: unit.projectId,
                          projectName: parentProject?.name,
                        })
                      )
                    }
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-3 border border-[var(--border-strong)] text-xs uppercase tracking-[0.14em] text-ink hover:border-ink transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Brochure</span>
                  </button>
                </div>

                <a
                  href={buildWhatsAppConciergeUrl(
                    `Residence ${unit.unitNumber}${
                      parentProject ? ` at ${parentProject.name}` : ''
                    }`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 pt-2 text-xs uppercase tracking-[0.16em] text-bronze hover:text-ink transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Direct WhatsApp Concierge</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Residence Interior Photography */}
      {unit.media.length > 0 && (
        <section className="py-20 lg:py-24 border-b border-[var(--border-hairline)]">
          <div className="container-wide space-y-10">
            <SectionHeading
              index="01"
              kicker="Interior Study"
              title={`Residence ${unit.unitNumber} Plates`}
              description="Representative architectural finishes, joinery proportions, and natural daylighting."
            />
            <ArchitecturalGallery
              media={unit.media}
              heading={`Residence ${unit.unitNumber}`}
            />
          </div>
        </section>
      )}

      {/* Interactive Floor Plan */}
      {unit.floorPlan && (
        <section className="py-20 lg:py-24 border-b border-[var(--border-hairline)] bg-stone/35">
          <div className="container-wide space-y-10">
            <SectionHeading
              index="02"
              kicker="Architectural Drawing"
              title="Dimensioned Floor Plan"
              description="Zoom and pan to inspect room dimensions, structural columns, and terrace depth."
            />
            <InteractiveFloorPlanViewer
              floorPlans={[unit.floorPlan]}
              units={[unit]}
              projectId={unit.projectId}
              projectName={parentProject?.name ?? 'Aurelia Commission'}
            />
          </div>
        </section>
      )}

      {/* Prefilled Payment Calculator */}
      <section className="py-20 lg:py-24">
        <div className="container-wide space-y-10">
          <SectionHeading
            index="03"
            kicker="Acquisition Modeling"
            title={`Payment Estimator — Residence ${unit.unitNumber}`}
            description="Prefilled with the guide price of this residence. Adjust down payment, interest rate, or financing duration."
          />
          <PaymentCalculator
            initialPrice={unit.price}
            currency={unit.currency}
            projectId={unit.projectId}
            projectName={parentProject?.name}
            unitId={unit.id}
            unitNumber={unit.unitNumber}
          />
        </div>
      </section>

      {/* Mobile Sticky Conversion Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-elevated/95 backdrop-blur-md border-t border-[var(--border-strong)] p-3 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() =>
            dispatch(
              openConversionModal({
                mode: 'UNIT_INQUIRY',
                projectId: unit.projectId,
                projectName: parentProject?.name,
                unitId: unit.id,
                unitNumber: unit.unitNumber,
              })
            )
          }
          className="flex-1 py-3 px-3 bg-ink text-ivory text-[11px] uppercase tracking-[0.16em]"
        >
          Enquire ({unit.unitNumber})
        </button>
        <button
          type="button"
          onClick={() =>
            dispatch(
              openConversionModal({
                mode: 'SITE_VISIT',
                projectId: unit.projectId,
                projectName: parentProject?.name,
                unitId: unit.id,
                unitNumber: unit.unitNumber,
              })
            )
          }
          className="flex-1 py-3 px-3 border border-ink text-ink text-[11px] uppercase tracking-[0.16em]"
        >
          Schedule Visit
        </button>
      </div>
    </div>
  );
}
