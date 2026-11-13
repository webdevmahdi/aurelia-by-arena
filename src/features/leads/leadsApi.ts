import { apiSlice } from '@/services/api/apiSlice';
import type { ApiSuccess, LeadCreateRequest } from '@/types/api';

export const leadsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createLead: builder.mutation<ApiSuccess<unknown>, LeadCreateRequest>({
      query: (body) => ({
        url: 'leads',
        method: 'POST',
        body,
      }),
    }),

    createContactInquiry: builder.mutation<ApiSuccess<unknown>, LeadCreateRequest>({
      query: (body) => ({
        url: 'contact-inquiries',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCreateLeadMutation, useCreateContactInquiryMutation } = leadsApi;
