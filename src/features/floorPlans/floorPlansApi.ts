import { apiSlice } from '@/services/api/apiSlice';
import type { ApiSuccess, FloorPlanDTO } from '@/types/api';

export const floorPlansApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjectFloorPlans: builder.query<FloorPlanDTO[], string>({
      query: (projectId) => ({
        url: `projects/${encodeURIComponent(projectId)}/floor-plans`,
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => response.data as FloorPlanDTO[],
      providesTags: (_res, _err, projectId) => [{ type: 'FloorPlans', id: projectId }],
    }),
  }),
});

export const { useGetProjectFloorPlansQuery } = floorPlansApi;
