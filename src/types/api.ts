/**
 * AURELIA DEVELOPMENTS — SHARED API CONTRACT v1
 * Contract Status: Authoritative & Immutable across Frontend and Backend.
 * Do not add, rename, or remove DTO fields, enum values, or envelopes without incrementing to v2.
 */

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedData<T> = {
  items: T[];
  pagination: Pagination;
};

export type ProjectStatus = 'PLANNED' | 'UNDER_CONSTRUCTION' | 'COMPLETED';

export type MediaType = 'IMAGE' | 'VIDEO' | 'PANORAMA' | 'DOCUMENT';

export type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'UNAVAILABLE';

export type LeadType =
  | 'GENERAL_INQUIRY'
  | 'UNIT_INQUIRY'
  | 'PRICING_REQUEST'
  | 'BROCHURE_REQUEST'
  | 'CONTACT_REQUEST';

export type PreferredContactMethod = 'PHONE' | 'EMAIL' | 'WHATSAPP';

export type MediaDTO = {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  mimeType?: string;
};

export type ProjectDTO = {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  status: ProjectStatus;
  location: {
    address: string;
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  priceFrom?: number;
  currency: string;
  totalUnits: number;
  availableUnits: number;
  propertyTypes: string[];
  bedrooms: number[];
  amenities: string[];
  heroMedia?: MediaDTO;
  gallery: MediaDTO[];
  videos: MediaDTO[];
  virtualTourUrl?: string;
  brochureUrl?: string;
  constructionProgress: number;
  createdAt: string;
  updatedAt: string;
};

export type FloorPlanDTO = {
  id: string;
  projectId: string;
  unitId?: string;
  name: string;
  imageUrl: string;
  pdfUrl?: string;
  areaSqFt?: number;
  bedrooms?: number;
  bathrooms?: number;
};

export type UnitDTO = {
  id: string;
  projectId: string;
  unitNumber: string;
  floor: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  price: number;
  currency: string;
  orientation?: string;
  view?: string;
  status: UnitStatus;
  floorPlan?: FloorPlanDTO;
  media: MediaDTO[];
  createdAt: string;
  updatedAt: string;
};

export type ConstructionUpdateDTO = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  progressPercent: number;
  date: string;
  media: MediaDTO[];
};

export type LeadCreateRequest = {
  type: LeadType;
  fullName: string;
  email: string;
  phone: string;
  country?: string;
  preferredContactMethod?: PreferredContactMethod;
  projectId?: string;
  unitId?: string;
  budgetRange?: string;
  preferredVisitDate?: string;
  preferredVisitTime?: string;
  message?: string;
  consent: boolean;
};

export type SiteVisitCreateRequest = {
  fullName: string;
  email: string;
  phone: string;
  projectId: string;
  unitId?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  consent: boolean;
};

export type BrochureCreateRequest = {
  fullName: string;
  email: string;
  phone?: string;
  projectId: string;
  consent: boolean;
};

/**
 * Authoritative Query Parameter Contract (Frontend TRD Section 4)
 */
export type ProjectsQueryParams = {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: ProjectStatus;
  sort?: string;
  page?: number;
  limit?: number;
};

export type UnitsQueryParams = {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  floor?: number;
  status?: UnitStatus;
  sort?: string;
  page?: number;
  limit?: number;
};
