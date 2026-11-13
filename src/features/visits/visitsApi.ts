import { apiSlice } from '@/services/api/apiSlice';
import type { ApiSuccess, SiteVisitCreateRequest } from '@/types/api';

export const visitsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSiteVisit: builder.mutation<ApiSuccess<unknown>, SiteVisitCreateRequest>({
      query: (body) => ({
        url: 'site-visits',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCreateSiteVisitMutation } = visitsApi;
