import { apiSlice } from '@/services/api/apiSlice';
import type {
  ApiSuccess,
  PaginatedData,
  UnitDTO,
  UnitsQueryParams,
} from '@/types/api';

export type ProjectUnitsRequest = {
  projectId: string;
  params?: UnitsQueryParams;
};

export const unitsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjectUnits: builder.query<PaginatedData<UnitDTO>, ProjectUnitsRequest>({
      query: ({ projectId, params }) => ({
        url: `projects/${encodeURIComponent(projectId)}/units`,
        method: 'GET',
        params: params ? { ...params } : undefined,
      }),
      transformResponse: (response: ApiSuccess<unknown>) =>
        response.data as PaginatedData<UnitDTO>,
      providesTags: (result, _err, { projectId }) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Unit' as const, id })),
              { type: 'Units', id: projectId },
            ]
          : [{ type: 'Units', id: projectId }],
    }),

    getUnitById: builder.query<UnitDTO, string>({
      query: (unitId) => ({
        url: `units/${encodeURIComponent(unitId)}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => response.data as UnitDTO,
      providesTags: (_res, _err, unitId) => [{ type: 'Unit', id: unitId }],
    }),
  }),
});

export const {
  useGetProjectUnitsQuery,
  useLazyGetProjectUnitsQuery,
  useGetUnitByIdQuery,
} = unitsApi;
