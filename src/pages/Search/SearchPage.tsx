import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UnitsArchitecturalSchedule } from '@/components/property/UnitScheduleRowAndCard';
import {
  EmptyLedgerState,
  ErrorRetryState,
  LoadingPlate,
} from '@/components/ui/DataStates';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { useContractSearchParams } from '@/hooks/useContractSearchParams';
import { useSeo } from '@/hooks/useSeo';
import { apiSlice } from '@/services/api/apiSlice';
import type {
  ApiError,
  PaginatedData,
  ProjectDTO,
  UnitDTO,
  UnitsQueryParams,
  UnitStatus,
} from '@/types/api';

/**
 * Composes authoritative Contract v1 endpoints (`GET /projects` + `GET /projects/:projectId/units`)
 * inside RTK Query without inventing any non-contract endpoint.
 */
const portfolioSearchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchPortfolioUnits: builder.query<
      {
        units: PaginatedData<UnitDTO>;
        projectsById: Record<string, ProjectDTO>;
      },
      UnitsQueryParams
    >({
      async queryFn(params, _queryApi, _extraOptions, baseQuery) {
        const projResult = await baseQuery({
          url: 'projects',
          method: 'GET',
          params: {
            location: params.location,
            limit: 50,
          },
        });

        if (projResult.error) {
          return { error: projResult.error as ApiError };
        }

        const projectPage = projResult.data.data as PaginatedData<ProjectDTO>;
        const matchedProjects = projectPage.items;
        const projectsById: Record<string, ProjectDTO> = {};
        matchedProjects.forEach((p) => {
          projectsById[p.id] = p;
        });

        const unitResponses = await Promise.all(
          matchedProjects.map((proj) =>
            baseQuery({
              url: `projects/${encodeURIComponent(proj.id)}/units`,
              method: 'GET',
              params: {
                propertyType: params.propertyType,
                bedrooms: params.bedrooms,
                bathrooms: params.bathrooms,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
                minArea: params.minArea,
                maxArea: params.maxArea,
                floor: params.floor,
                status: params.status,
                limit: 50,
              },
            })
          )
        );

        const combined: UnitDTO[] = [];
        for (const res of unitResponses) {
          if (res.error) {
            return { error: res.error as ApiError };
          }
          const pageData = res.data.data as PaginatedData<UnitDTO>;
          combined.push(...pageData.items);
        }

        const sort = params.sort ?? '';
        if (sort === 'price_asc') {
          combined.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_desc') {
          combined.sort((a, b) => b.price - a.price);
        } else if (sort === 'area_desc') {
          combined.sort((a, b) => b.areaSqFt - a.areaSqFt);
        } else if (sort === 'floor_desc') {
          combined.sort((a, b) => b.floor - a.floor);
        }

        const page = Math.max(1, params.page ?? 1);
        const limit = Math.min(50, Math.max(1, params.limit ?? 12));
        const total = combined.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const safePage = Math.min(page, totalPages);
        const items = combined.slice((safePage - 1) * limit, safePage * limit);

        return {
          data: {
            units: {
              items,
              pagination: { page: safePage, limit, total, totalPages },
            },
            projectsById,
          },
        };
      },
      providesTags: ['Units', 'Projects'],
    }),
  }),
});

const { useSearchPortfolioUnitsQuery } = portfolioSearchApi;

export default function SearchPage() {
  const { params, unitStatus, updateParams, resetParams } =
    useContractSearchParams(12);
  const [locationInput, setLocationInput] = useState(params.location ?? '');

  useEffect(() => {
    setLocationInput(params.location ?? '');
  }, [params.location]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useSearchPortfolioUnitsQuery({
      location: params.location,
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
    });

  useSeo({
    title: 'Residence Search & Global Schedule — Aurelia Developments',
    description:
      'Search and filter individual luxury residences across all Aurelia Developments by city, bedrooms, floor, square footage, price, and availability.',
    canonicalPath: '/search',
  });

  const units = data?.units.items ?? [];

  return (
    <div>
      {/* Header */}
      <section className="py-16 lg:py-24 border-b border-[var(--border-hairline)] bg-elevated/55">
        <div className="container-wide space-y-5">
          <p className="text-xs uppercase tracking-[0.24em] text-bronze">
            Portfolio-Wide Residence Ledger
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.05]">
            Search Individual Residences
          </h1>
          <p className="text-sm text-ink-secondary max-w-2xl leading-relaxed">
            Filter available lateral apartments, duplex lofts, sky villas, and penthouses
            across London, Dubai, Mallorca, Geneva, and New York. All filter parameters
            are preserved in the page URL for sharing with advisors or co-purchasers.
          </p>
        </div>
      </section>

      {/* Filter Matrix */}
      <section
        aria-label="Global residence search filters"
        className="py-6 border-b border-[var(--border-hairline)] bg-canvas sticky top-20 z-30"
      >
        <div className="container-wide space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({ location: locationInput.trim() || undefined });
              }}
              className="col-span-2 relative"
            >
              <label htmlFor="global-loc" className="sr-only">
                Location or Development
              </label>
              <input
                id="global-loc"
                type="search"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onBlur={() => {
                  if ((params.location ?? '') !== locationInput.trim()) {
                    updateParams({ location: locationInput.trim() || undefined });
                  }
                }}
                placeholder="City, country, or project…"
                className="w-full pl-9 pr-3 py-2.5 bg-elevated border border-[var(--border-strong)] text-xs text-ink"
              />
              <Search
                className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.5}
              />
            </form>

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
              <option value="AVAILABLE">Available Only</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
            </select>

            <select
              aria-label="Property type"
              value={params.propertyType ?? ''}
              onChange={(e) =>
                updateParams({ propertyType: e.target.value || undefined })
              }
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">All Typologies</option>
              <option value="Residence">Residence</option>
              <option value="Sky Villa">Sky Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Duplex Loft">Duplex Loft</option>
            </select>

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
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
            </select>

            <select
              aria-label="Minimum area"
              value={params.minArea ?? ''}
              onChange={(e) =>
                updateParams({
                  minArea: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">Min Area: Any</option>
              <option value="2000">≥ 2,000 sq ft</option>
              <option value="3500">≥ 3,500 sq ft</option>
              <option value="5000">≥ 5,000 sq ft</option>
            </select>

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

            <select
              aria-label="Sort residences"
              value={params.sort ?? ''}
              onChange={(e) => updateParams({ sort: e.target.value || undefined })}
              className="px-3 py-2.5 bg-elevated border border-[var(--border-hairline)] text-xs text-ink"
            >
              <option value="">Sort: Default</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="area_desc">Largest Area</option>
              <option value="floor_desc">Highest Floor</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-2 tabular-nums">
              <SlidersHorizontal className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
              {isFetching
                ? 'Searching portfolio…'
                : `${data?.units.pagination.total ?? 0} matching residences`}
            </span>

            <button
              type="button"
              onClick={resetParams}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink hover:text-bronze cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          {isLoading ? (
            <LoadingPlate label="Querying global residence ledger…" />
          ) : isError ? (
            <ErrorRetryState error={error} onRetry={refetch} />
          ) : units.length === 0 ? (
            <EmptyLedgerState
              title="No Matching Residences Found"
              description="Broaden your filter selections or contact our Private Sales Office for off-market penthouse releases."
              onReset={resetParams}
            />
          ) : (
            <>
              <UnitsArchitecturalSchedule units={units} />
              {data?.units.pagination && (
                <PaginationBar
                  pagination={data.units.pagination}
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
