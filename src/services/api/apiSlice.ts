import { createApi } from '@reduxjs/toolkit/query/react';
import { contractBaseQuery } from '@/services/api/baseQuery';

export const apiSlice = createApi({
  reducerPath: 'aureliaApi',
  baseQuery: contractBaseQuery,
  tagTypes: ['Projects', 'Project', 'Units', 'Unit', 'FloorPlans', 'Construction', 'Brochure'],
  keepUnusedDataFor: 300,
  endpoints: () => ({}),
});
