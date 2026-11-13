import { apiSlice } from '@/services/api/apiSlice';
import type {
  ApiSuccess,
  PaginatedData,
  ProjectDTO,
  ProjectsQueryParams,
} from '@/types/api';

export const projectsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<PaginatedData<ProjectDTO>, ProjectsQueryParams | void>({
      query: (params) => ({
        url: 'projects',
        method: 'GET',
        params: params ? { ...params } : undefined,
      }),
      transformResponse: (response: ApiSuccess<unknown>) =>
        response.data as PaginatedData<ProjectDTO>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Project' as const, id })),
              { type: 'Projects', id: 'LIST' },
            ]
          : [{ type: 'Projects', id: 'LIST' }],
    }),

    getProjectBySlug: builder.query<ProjectDTO, string>({
      query: (slug) => ({
        url: `projects/${encodeURIComponent(slug)}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => response.data as ProjectDTO,
      providesTags: (result, _err, slug) => [{ type: 'Project', id: result?.id ?? slug }],
    }),
  }),
});

export const { useGetProjectsQuery, useGetProjectBySlugQuery } = projectsApi;
