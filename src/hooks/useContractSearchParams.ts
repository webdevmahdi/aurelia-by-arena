import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProjectStatus, UnitStatus } from '@/types/api';

/**
 * Strictly locked to the 13 URL query parameter names defined in Frontend TRD Section 4.
 */
export const CONTRACT_QUERY_KEYS = [
  'location',
  'propertyType',
  'bedrooms',
  'bathrooms',
  'minPrice',
  'maxPrice',
  'minArea',
  'maxArea',
  'floor',
  'status',
  'sort',
  'page',
  'limit',
] as const;

export type ContractQueryKey = (typeof CONTRACT_QUERY_KEYS)[number];

export type ParsedContractQuery = {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  floor?: number;
  status?: string;
  sort?: string;
  page: number;
  limit: number;
};

function parseOptionalInt(val: string | null): number | undefined {
  if (!val || val.trim() === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

export function useContractSearchParams(defaultLimit = 12) {
  const [searchParams, setSearchParams] = useSearchParams();

  const parsed: ParsedContractQuery = useMemo(() => {
    const page = Math.max(1, parseOptionalInt(searchParams.get('page')) ?? 1);
    const limit = Math.min(
      50,
      Math.max(1, parseOptionalInt(searchParams.get('limit')) ?? defaultLimit)
    );

    return {
      location: searchParams.get('location') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      bedrooms: parseOptionalInt(searchParams.get('bedrooms')),
      bathrooms: parseOptionalInt(searchParams.get('bathrooms')),
      minPrice: parseOptionalInt(searchParams.get('minPrice')),
      maxPrice: parseOptionalInt(searchParams.get('maxPrice')),
      minArea: parseOptionalInt(searchParams.get('minArea')),
      maxArea: parseOptionalInt(searchParams.get('maxArea')),
      floor: parseOptionalInt(searchParams.get('floor')),
      status: searchParams.get('status') || undefined,
      sort: searchParams.get('sort') || undefined,
      page,
      limit,
    };
  }, [searchParams, defaultLimit]);

  const updateParams = useCallback(
    (updates: Partial<Record<ContractQueryKey, string | number | undefined>>) => {
      const next = new URLSearchParams(searchParams);

      for (const [key, val] of Object.entries(updates)) {
        if (!CONTRACT_QUERY_KEYS.includes(key as ContractQueryKey)) continue;
        if (val === undefined || val === null || String(val).trim() === '') {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      }

      // Reset page to 1 whenever a filter changes unless page itself was updated
      if (!('page' in updates)) {
        next.delete('page');
      }

      setSearchParams(next, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  const resetParams = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: false });
  }, [setSearchParams]);

  return {
    params: parsed,
    projectStatus: parsed.status as ProjectStatus | undefined,
    unitStatus: parsed.status as UnitStatus | undefined,
    updateParams,
    resetParams,
  };
}
