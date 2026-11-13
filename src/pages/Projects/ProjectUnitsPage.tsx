import { ArrowLeft, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { UnitsArchitecturalSchedule } from '@/components/property/UnitScheduleRowAndCard';
import {
  EmptyLedgerState,
  ErrorRetryState,
  LoadingPlate,
} from '@/components/ui/DataStates';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { useGetProjectBySlugQuery, useGetProjectsQuery } from '@/features/projects/projectsApi';
import { useGetProjectUnitsQuery } from '@/features/units/unitsApi';
import { useContractSearchParams } from '@/hooks/useContractSearchParams';
import { useSeo } from '@/hooks/useSeo';
import type { UnitStatus } from '@/types/api';

export default function ProjectUnitsPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();
  const [rawSearchParams] = useSearchParams();

  const { params, unitStatus, updateParams, resetParams } =
    useContractSearchParams(12);
  const [orientationFilter, setOrientationFilter] = useState<string>('');

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
    refetch: refetchProject,
  } = useGetProjectBySlugQuery(projectSlug, { skip: !projectSlug });

  const { data: allProjectsData } = useGetProjectsQuery({ limit: 50 });
  const allProjects = allProjectsData?.items ?? [];

  const {
    data: unitsData,
    isLoading: isUnitsLoading,
    isFetching: isUnitsFetching,
    isError: isUnitsError,
    error: unitsError,
    refetch: refetchUnits,
  } = useGetProjectUnitsQuery(
    {
      projectId: project?.id ?? '',
      params: {
        propertyType: params.propertyType,
        bedrooms: params.bedrooms,
        bathrooms: params.bathrooms,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minArea: params.minArea,
        maxArea: params.maxArea,
        floor: params.floor,
        status: unitStatus,
        sort: params.sort,
        page: params.page,
        limit: params.limit,
      },
    },
    { skip: !project?.id }
  );

  const displayedUnits = useMemo(() => {
    const raw = unitsData?.items ?? [];
    if (!orientationFilter) return raw;
    const q = orientationFilter.toLowerCase();
    return raw.filter(
      (u) =>
        u.orientation?.toLowerCase().includes(q) ||
        u.view?.toLowerCase().includes(q)
    );
  }, [unitsData?.items, orientationFilter]);

  useSeo({
    title: project
      ? `Residences at ${project.name} — Schedule & Availability`
      : 'Residence Schedule — Aurelia Developments',
    description: project
      ? `Filter available residences, floor plans, square footage, and guide pricing at ${project.name} in ${project.location.city}.`
      : 'Explore residence availability across Aurelia Developments.',
    canonicalPath: `/projects/${projectSlug}/units`,
  });

  if (isProjectLoading) {
    return (
      <div className="container-wide py-24">
        <LoadingPlate label="Loading development schedule…" />
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <div className="container-wide py-24">
        <ErrorRetryState error={projectError} onRetry={refetchProject} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="py-14 lg:py-20 border-b border-[var(--border-hairline)] bg-elevated/60">
        <div className="container-wide space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to={`/projects/${project.slug}`}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-secondary hover:text-ink"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Back to {project.name} Monograph</span>
            </Link>

            {/* Switch Project Selector */}
            {allProjects.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <label
                  htmlFor="unit-proj-switch"
                  className="uppercase tracking-[0.16em] text-ink-muted"
                >
                  Commission:
                </label>
                <select
                  id="unit-proj-switch"
                  value={project.slug}
                  onChange={(e) => {
                    const qs = rawSearchParams.toString();
                    navigate(
                      `/projects/${e.target.value}/units${qs ? `?${qs}` : ''}`
                    );
                  }}
                  className="px-3 py-1.5 bg-canvas border border-[var(--border-strong)] text-ink"
                >
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} ({p.location.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8">
              <p className="text-xs uppercase tracking-[0.22em] text-bronze">
                {project.location.city}, {project.location.country}
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl text-ink mt-1">
                {project.name} — Schedule of Residences
              </h1>
            </div>
            <p className="lg:col-span-4 text-xs uppercase tracking-[0.16em] text-ink-muted lg:text-right tabular-nums">
              {project.availableUnits} Available of {project.totalUnits} Total Residences
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Unit Filter Bar (URL-Synchronized) */}
      <section
        aria-label="Filter residences"
        className="py-6 border-b border-[var(--border-hairline)] bg-canvas"
      >
        <div className="container-wide space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3">
            {/* Availability Status */}
            <select
              aria-label="Availability status"
              value={params.status ?? ''}
              onChange={(e) =>
                updateParams({
                  status: (e.target.value as UnitStatus) || undefined,
                })
              }
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>

            {/* Property Type */}
            <select
              aria-label="Property type"
              value={params.propertyType ?? ''}
              onChange={(e) =>
                updateParams({ propertyType: e.target.value || undefined })
              }
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">All Typologies</option>
              {project.propertyTypes.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>

            {/* Bedrooms */}
            <select
              aria-label="Bedrooms"
              value={params.bedrooms ?? ''}
              onChange={(e) =>
                updateParams({
                  bedrooms: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">Bedrooms: Any</option>
              {[1, 2, 3, 4, 5].map((b) => (
                <option key={b} value={b}>
                  {b} Bedrooms
                </option>
              ))}
            </select>

            {/* Bathrooms */}
            <select
              aria-label="Minimum bathrooms"
              value={params.bathrooms ?? ''}
              onChange={(e) =>
                updateParams({
                  bathrooms: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">Bathrooms: Any</option>
              <option value="2">2+ Bathrooms</option>
              <option value="3">3+ Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
              <option value="5">5+ Bathrooms</option>
            </select>

            {/* Minimum Area */}
            <select
              aria-label="Minimum area sq ft"
              value={params.minArea ?? ''}
              onChange={(e) =>
                updateParams({
                  minArea: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">Min Area: Any</option>
              <option value="1800">≥ 1,800 sq ft</option>
              <option value="3000">≥ 3,000 sq ft</option>
              <option value="4500">≥ 4,500 sq ft</option>
            </select>

            {/* Max Price */}
            <select
              aria-label="Maximum guide price"
              value={params.maxPrice ?? ''}
              onChange={(e) =>
                updateParams({
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">Max Price: Any</option>
              <option value="5000000">≤ $5.0M</option>
              <option value="8000000">≤ $8.0M</option>
              <option value="15000000">≤ $15.0M</option>
            </select>

            {/* Orientation / Aspect Refinement */}
            <select
              aria-label="Orientation or view"
              value={orientationFilter}
              onChange={(e) => setOrientationFilter(e.target.value)}
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">Aspect: Any</option>
              <option value="South">South Aspect</option>
              <option value="West">West / Sunset</option>
              <option value="Sea">Sea / Waterfront</option>
              <option value="Garden">Garden / Courtyard</option>
            </select>

            {/* Sort */}
            <select
              aria-label="Sort residences"
              value={params.sort ?? ''}
              onChange={(e) => updateParams({ sort: e.target.value || undefined })}
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">Sort: Floor Low → High</option>
              <option value="floor_desc">Floor: High → Low</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="area_desc">Area: Largest First</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-2 tabular-nums">
              <SlidersHorizontal className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
              {isUnitsFetching
                ? 'Refreshing schedule…'
                : `${displayedUnits.length} residences displayed`}
            </span>

            <button
              type="button"
              onClick={() => {
                setOrientationFilter('');
                resetParams();
              }}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink hover:text-bronze cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      </section>

      {/* Schedule Content */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          {isUnitsLoading ? (
            <LoadingPlate label="Retrieving residence schedule…" />
          ) : isUnitsError ? (
            <ErrorRetryState error={unitsError} onRetry={refetchUnits} />
          ) : displayedUnits.length === 0 ? (
            <EmptyLedgerState
              title="No Residences Match Selected Filters"
              description="Adjust bedroom count, guide price, or availability status to view additional residences in this commission."
              onReset={() => {
                setOrientationFilter('');
                resetParams();
              }}
            />
          ) : (
            <>
              <UnitsArchitecturalSchedule
                units={displayedUnits}
                projectName={project.name}
              />
              {unitsData?.pagination && (
                <PaginationBar
                  pagination={unitsData.pagination}
                  onPageChange={(nextPage) => updateParams({ page: nextPage })}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
