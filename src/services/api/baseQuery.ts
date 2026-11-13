import { fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { executeMockRequest } from '@/services/api/mockAdapter';
import type { ApiError, ApiResponse, ApiSuccess } from '@/types/api';

export type ContractRequestArgs = {
  url: string;
  method?: 'GET' | 'POST';
  params?: Record<string, unknown>;
  body?: unknown;
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(
  /\/+$/,
  ''
);

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false';

const rawFetchBaseQuery = fetchBaseQuery({
  baseUrl: `${apiBaseUrl}/api/v1`,
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    return headers;
  },
});

function normalizeApiError(raw: unknown): ApiError {
  if (
    raw &&
    typeof raw === 'object' &&
    'success' in raw &&
    (raw as ApiError).success === false &&
    'error' in raw
  ) {
    return raw as ApiError;
  }

  return {
    success: false,
    error: {
      code: 'NETWORK_OR_SERVER_ERROR',
      message:
        'Unable to reach the Aurelia Developments service at this moment. Please try again.',
    },
  };
}

/**
 * Contract-locked RTK Query BaseQuery adapter.
 * Transparently switches between contract-compatible mock adapter and live `${VITE_API_BASE_URL}/api/v1`
 * without altering any component, hook, or DTO shape.
 */
export const contractBaseQuery: BaseQueryFn<
  ContractRequestArgs,
  ApiSuccess<unknown>,
  ApiError
> = async (args, api, extraOptions) => {
  if (useMockApi) {
    const { payload } = await executeMockRequest(args);
    if (payload.success) {
      return { data: payload };
    }
    return { error: payload };
  }

  const cleanParams: Record<string, string | number | boolean> = {};
  if (args.params) {
    for (const [key, value] of Object.entries(args.params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value as string | number | boolean;
      }
    }
  }

  const result = await rawFetchBaseQuery(
    {
      url: args.url,
      method: args.method ?? 'GET',
      params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
      body: args.body,
    },
    api,
    extraOptions
  );

  if (result.error) {
    return { error: normalizeApiError(result.error.data) };
  }

  const envelope = result.data as ApiResponse<unknown>;
  if (envelope && typeof envelope === 'object' && 'success' in envelope) {
    if (envelope.success) {
      return { data: envelope };
    }
    return { error: envelope };
  }

  return {
    error: {
      success: false,
      error: {
        code: 'MALFORMED_CONTRACT_RESPONSE',
        message: 'Unexpected response format received from server.',
      },
    },
  };
};
