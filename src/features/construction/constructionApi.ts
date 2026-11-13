import { apiSlice } from '@/services/api/apiSlice';
import type { ApiSuccess, ConstructionUpdateDTO } from '@/types/api';

export const constructionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjectConstructionUpdates: builder.query<ConstructionUpdateDTO[], string>({
      query: (projectId) => ({
        url: `projects/${encodeURIComponent(projectId)}/construction-updates`,
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccess<unknown>) =>
        response.data as ConstructionUpdateDTO[],
      providesTags: (_res, _err, projectId) => [{ type: 'Construction', id: projectId }],
    }),
  }),
});

export const { useGetProjectConstructionUpdatesQuery } = constructionApi;
