import { apiSlice } from '@/services/api/apiSlice';
import type { ApiSuccess, BrochureCreateRequest, MediaDTO } from '@/types/api';

export const brochuresApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBrochureRequest: builder.mutation<ApiSuccess<unknown>, BrochureCreateRequest>({
      query: (body) => ({
        url: 'brochure-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Brochure', id: arg.projectId }],
    }),

    getProjectBrochure: builder.query<ApiSuccess<MediaDTO>, string>({
      query: (projectId) => ({
        url: `projects/${encodeURIComponent(projectId)}/brochure`,
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccess<unknown>) =>
        response as ApiSuccess<MediaDTO>,
      providesTags: (_res, _err, projectId) => [{ type: 'Brochure', id: projectId }],
    }),
  }),
});

export const {
  useCreateBrochureRequestMutation,
  useGetProjectBrochureQuery,
  useLazyGetProjectBrochureQuery,
} = brochuresApi;
