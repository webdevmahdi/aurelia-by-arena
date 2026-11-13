import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ProjectPlateCard } from '@/components/property/ProjectPlateCard';
import {
  EmptyLedgerState,
  ErrorRetryState,
  LoadingPlate,
} from '@/components/ui/DataStates';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import { useContractSearchParams } from '@/hooks/useContractSearchParams';
import { useProjectReveal } from '@/hooks/useGsapAnimations';
import { useSeo } from '@/hooks/useSeo';
import type { ProjectStatus } from '@/types/api';

export default function ProjectsPage() {
  const { params, projectStatus, updateParams, resetParams } =
    useContractSearchParams(12);
  const [searchInput, setSearchInput] = useState(params.location ?? '');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearchInput(params.location ?? '');
  }, [params.location]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetProjectsQuery({
      location: params.location,
      propertyType: params.propertyType,
      bedrooms: params.bedrooms,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      status: projectStatus,
      sort: params.sort,
      page: params.page,
      limit: params.limit,
    });

  const projects = data?.items ?? [];
  useProjectReveal(listRef, projects.length > 0);

  useSeo({
    title: 'Architectural Developments — Aurelia Portfolio',
    description:
      'Browse Aurelia Developments residential commissions by location, completion status, residence typology, bedrooms, and starting guide price.',
    canonicalPath: '/projects',
  });

  const hasActiveFilters = Boolean(
    params.location ||
      params.propertyType ||
      params.bedrooms ||
      params.minPrice ||
      params.maxPrice ||
      params.status ||
      params.sort
  );

  return (
    <div ref={listRef}>
      {/* Page Monograph Header */}
      <section className="py-16 lg:py-24 border-b border-[var(--border-hairline)] bg-elevated/55">
        <div className="container-wide space-y-6">
          <p className="text-xs uppercase tracking-[0.24em] text-bronze">
            Portfolio Directory
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <h1 className="lg:col-span-8 font-serif text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.05]">
              Architectural Developments
            </h1>
            <p className="lg:col-span-4 text-sm text-ink-secondary leading-relaxed">
              Every commission is conceived in limited numbers, uniting natural stone
              permanence with bespoke residential hospitality.
            </p>
          </div>
        </div>
      </section>

      {/* URL-Synchronized Architectural Filter Bar */}
      <section
        aria-label="Filter developments"
        className="py-6 border-b border-[var(--border-hairline)] bg-canvas sticky top-20 z-30"
      >
        <div className="container-wide space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search / Location */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({ location: searchInput.trim() || undefined });
              }}
              className="sm:col-span-2 lg:col-span-3 relative flex"
            >
              <label htmlFor="proj-location-input" className="sr-only">
                Search by city, country, or project name
              </label>
              <input
                id="proj-location-input"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onBlur={() => {
                  if ((params.location ?? '') !== searchInput.trim()) {
                    updateParams({ location: searchInput.trim() || undefined });
                  }
                }}
                placeholder="City, country, or project…"
                className="w-full pl-9 pr-3 py-2.5 bg-elevated border border-[var(--border-strong)] text-xs text-ink placeholder:text-ink-muted"
              />
              <Search
                className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.5}
              />
            </form>

            {/* Status */}
            <div className="lg:col-span-2">
              <label htmlFor="proj-status" className="sr-only">
                Project Status
              </label>
              <select
                id="proj-status"
                value={params.status ?? ''}
                onChange={(e) =>
                  updateParams({
                    status: (e.target.value as ProjectStatus) || undefined,
                  })
                }
                className="w-full px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
                <option value="PLANNED">Planned Release</option>
              </select>
            </div>

            {/* Property Type */}
            <div className="lg:col-span-2">
              <label htmlFor="proj-type" className="sr-only">
                Property Type
              </label>
              <select
                id="proj-type"
                value={params.propertyType ?? ''}
                onChange={(e) =>
                  updateParams({ propertyType: e.target.value || undefined })
                }
                className="w-full px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
              >
                <option value="">All Typologies</option>
                <option value="Residence">Lateral Residence</option>
                <option value="Sky Villa">Sky Villa</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Duplex Loft">Duplex Loft</option>
                <option value="Townhouse">Townhouse</option>
              </select>
            </div>

            {/* Minimum Bedrooms */}
            <div className="lg:col-span-2">
              <label htmlFor="proj-beds" className="sr-only">
                Bedroom Range
              </label>
              <select
                id="proj-beds"
                value={params.bedrooms ?? ''}
                onChange={(e) =>
                  updateParams({
                    bedrooms: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
              >
                <option value="">Any Bedrooms</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            {/* Starting Price Ceiling */}
            <div className="lg:col-span-1">
              <label htmlFor="proj-maxprice" className="sr-only">
                Starting Price
              </label>
              <select
                id="proj-maxprice"
                value={params.maxPrice ?? ''}
                onChange={(e) =>
                  updateParams({
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-2.5 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
              >
                <option value="">Any Price</option>
                <option value="4500000">From ≤ $4.5M</option>
                <option value="6000000">From ≤ $6.0M</option>
                <option value="10000000">From ≤ $10M</option>
              </select>
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <label htmlFor="proj-sort" className="sr-only">
                Sort Projects
              </label>
              <select
                id="proj-sort"
                value={params.sort ?? ''}
                onChange={(e) => updateParams({ sort: e.target.value || undefined })}
                className="w-full px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
              >
                <option value="">Sort: Curated Order</option>
                <option value="price_asc">Starting Price: Low → High</option>
                <option value="price_desc">Starting Price: High → Low</option>
                <option value="availability_desc">Available Units</option>
                <option value="newest">Latest Release</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
            <div className="inline-flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
              <span className="tabular-nums">
                {isFetching
                  ? 'Updating portfolio…'
                  : `${data?.pagination.total ?? 0} developments matching criteria`}
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetParams}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink hover:text-bronze cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results Ledger */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          {isLoading ? (
            <LoadingPlate label="Retrieving developments…" />
          ) : isError ? (
            <ErrorRetryState error={error} onRetry={refetch} />
          ) : projects.length === 0 ? (
            <EmptyLedgerState
              title="No Developments Match Your Criteria"
              description="Consider broadening your location, typology, or starting price parameters, or speak directly with our Private Sales Office."
              onReset={resetParams}
            />
          ) : (
            <div className="space-y-12">
              {/* Lead Featured Plate */}
              <ProjectPlateCard project={projects[0]} indexNumber={1} featuredLayout />

              {/* Remaining Portfolio Grid */}
              {projects.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projects.slice(1).map((project, idx) => (
                    <ProjectPlateCard
                      key={project.id}
                      project={project}
                      indexNumber={idx + 2}
                    />
                  ))}
                </div>
              )}

              {data?.pagination && (
                <PaginationBar
                  pagination={data.pagination}
                  onPageChange={(nextPage) => updateParams({ page: nextPage })}
                />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
