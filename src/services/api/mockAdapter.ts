import { mockConstructionUpdates } from '@/data/mock/constructionUpdates';
import { mockFloorPlans } from '@/data/mock/floorPlans';
import { mockProjects } from '@/data/mock/projects';
import { mockUnits } from '@/data/mock/units';
import type {
  ApiError,
  ApiResponse,
  BrochureCreateRequest,
  ConstructionUpdateDTO,
  FloorPlanDTO,
  LeadCreateRequest,
  MediaDTO,
  PaginatedData,
  ProjectDTO,
  SiteVisitCreateRequest,
  UnitDTO,
} from '@/types/api';

const authorizedBrochureProjects = new Set<string>();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return message ? { success: true, data, message } : { success: true, data };
}

function fail(code: string, message: string, fields?: Record<string, string>): ApiError {
  return {
    success: false,
    error: fields ? { code, message, fields } : { code, message },
  };
}

function clampPagination(rawPage?: unknown, rawLimit?: unknown) {
  const parsedPage = Number(rawPage);
  const parsedLimit = Number(rawLimit);
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? Math.floor(parsedPage) : 1;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit >= 1
      ? Math.min(50, Math.floor(parsedLimit))
      : 12;
  return { page, limit };
}

function paginate<T>(items: T[], page: number, limit: number): PaginatedData<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function executeMockRequest(args: {
  url: string;
  method?: string;
  params?: Record<string, unknown>;
  body?: unknown;
}): Promise<{ status: number; payload: ApiResponse<unknown> }> {
  const method = (args.method ?? 'GET').toUpperCase();
  const cleanPath = args.url.replace(/^\/+/, '').split('?')[0];
  const params = args.params ?? {};

  await delay(180);

  // 1. GET /projects
  if (method === 'GET' && cleanPath === 'projects') {
    let filtered: ProjectDTO[] = [...mockProjects];

    if (typeof params.location === 'string' && params.location.trim() !== '') {
      const q = params.location.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.location.city.toLowerCase().includes(q) ||
          p.location.country.toLowerCase().includes(q) ||
          p.location.address.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      );
    }

    if (typeof params.status === 'string' && params.status !== '') {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    if (typeof params.propertyType === 'string' && params.propertyType !== '') {
      const pt = params.propertyType.toLowerCase();
      filtered = filtered.filter((p) =>
        p.propertyTypes.some((type) => type.toLowerCase() === pt)
      );
    }

    if (params.bedrooms !== undefined && params.bedrooms !== '') {
      const beds = Number(params.bedrooms);
      if (Number.isFinite(beds)) {
        filtered = filtered.filter((p) => p.bedrooms.some((b) => b >= beds));
      }
    }

    if (params.minPrice !== undefined && params.minPrice !== '') {
      const min = Number(params.minPrice);
      if (Number.isFinite(min)) {
        filtered = filtered.filter((p) => (p.priceFrom ?? 0) >= min);
      }
    }

    if (params.maxPrice !== undefined && params.maxPrice !== '') {
      const max = Number(params.maxPrice);
      if (Number.isFinite(max)) {
        filtered = filtered.filter((p) => (p.priceFrom ?? Infinity) <= max);
      }
    }

    const sort = typeof params.sort === 'string' ? params.sort : '';
    if (sort === 'price_asc') {
      filtered.sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
    } else if (sort === 'availability_desc') {
      filtered.sort((a, b) => b.availableUnits - a.availableUnits);
    } else if (sort === 'newest') {
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const { page, limit } = clampPagination(params.page, params.limit);
    return { status: 200, payload: ok(paginate(filtered, page, limit)) };
  }

  // 2. GET /projects/:projectId/units
  const projectUnitsMatch = cleanPath.match(/^projects\/([^/]+)\/units$/);
  if (method === 'GET' && projectUnitsMatch) {
    const projectId = decodeURIComponent(projectUnitsMatch[1]);
    const projectExists = mockProjects.some((p) => p.id === projectId);
    if (!projectExists) {
      return {
        status: 404,
        payload: fail('PROJECT_NOT_FOUND', 'The requested development could not be located.'),
      };
    }

    let units: UnitDTO[] = mockUnits.filter((u) => u.projectId === projectId);

    if (typeof params.propertyType === 'string' && params.propertyType !== '') {
      const pt = params.propertyType.toLowerCase();
      units = units.filter((u) => u.propertyType.toLowerCase() === pt);
    }

    if (params.bedrooms !== undefined && params.bedrooms !== '') {
      const beds = Number(params.bedrooms);
      if (Number.isFinite(beds)) {
        units = units.filter((u) => u.bedrooms === beds);
      }
    }

    if (params.bathrooms !== undefined && params.bathrooms !== '') {
      const baths = Number(params.bathrooms);
      if (Number.isFinite(baths)) {
        units = units.filter((u) => u.bathrooms >= baths);
      }
    }

    if (params.minPrice !== undefined && params.minPrice !== '') {
      const min = Number(params.minPrice);
      if (Number.isFinite(min)) {
        units = units.filter((u) => u.price >= min);
      }
    }

    if (params.maxPrice !== undefined && params.maxPrice !== '') {
      const max = Number(params.maxPrice);
      if (Number.isFinite(max)) {
        units = units.filter((u) => u.price <= max);
      }
    }

    if (params.minArea !== undefined && params.minArea !== '') {
      const minA = Number(params.minArea);
      if (Number.isFinite(minA)) {
        units = units.filter((u) => u.areaSqFt >= minA);
      }
    }

    if (params.maxArea !== undefined && params.maxArea !== '') {
      const maxA = Number(params.maxArea);
      if (Number.isFinite(maxA)) {
        units = units.filter((u) => u.areaSqFt <= maxA);
      }
    }

    if (params.floor !== undefined && params.floor !== '') {
      const fl = Number(params.floor);
      if (Number.isFinite(fl)) {
        units = units.filter((u) => u.floor === fl);
      }
    }

    if (typeof params.status === 'string' && params.status !== '') {
      units = units.filter((u) => u.status === params.status);
    }

    const sort = typeof params.sort === 'string' ? params.sort : '';
    if (sort === 'price_asc') {
      units.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      units.sort((a, b) => b.price - a.price);
    } else if (sort === 'area_desc') {
      units.sort((a, b) => b.areaSqFt - a.areaSqFt);
    } else if (sort === 'area_asc') {
      units.sort((a, b) => a.areaSqFt - b.areaSqFt);
    } else if (sort === 'floor_desc') {
      units.sort((a, b) => b.floor - a.floor);
    } else {
      units.sort((a, b) => a.floor - b.floor);
    }

    const { page, limit } = clampPagination(params.page, params.limit);
    return { status: 200, payload: ok(paginate(units, page, limit)) };
  }

  // 3. GET /projects/:projectId/floor-plans
  const floorPlansMatch = cleanPath.match(/^projects\/([^/]+)\/floor-plans$/);
  if (method === 'GET' && floorPlansMatch) {
    const projectId = decodeURIComponent(floorPlansMatch[1]);
    const plans: FloorPlanDTO[] = mockFloorPlans.filter((fp) => fp.projectId === projectId);
    return { status: 200, payload: ok(plans) };
  }

  // 4. GET /projects/:projectId/construction-updates
  const updatesMatch = cleanPath.match(/^projects\/([^/]+)\/construction-updates$/);
  if (method === 'GET' && updatesMatch) {
    const projectId = decodeURIComponent(updatesMatch[1]);
    const updates: ConstructionUpdateDTO[] = mockConstructionUpdates
      .filter((u) => u.projectId === projectId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { status: 200, payload: ok(updates) };
  }

  // 5. GET /projects/:projectId/brochure
  const brochureGetMatch = cleanPath.match(/^projects\/([^/]+)\/brochure$/);
  if (method === 'GET' && brochureGetMatch) {
    const projectId = decodeURIComponent(brochureGetMatch[1]);
    const project = mockProjects.find((p) => p.id === projectId);
    if (!project || !project.brochureUrl) {
      return {
        status: 404,
        payload: fail('BROCHURE_NOT_FOUND', 'No architectural dossier is registered for this development.'),
      };
    }
    if (!authorizedBrochureProjects.has(projectId)) {
      return {
        status: 403,
        payload: fail(
          'BROCHURE_REGISTRATION_REQUIRED',
          'Please register your contact details to unlock the architectural dossier.'
        ),
      };
    }

    const doc: MediaDTO = {
      id: `brochure-${project.id}`,
      type: 'DOCUMENT',
      url: project.brochureUrl,
      title: `${project.name} — Architectural Monograph & Floor Plates`,
      mimeType: 'text/html',
    };
    return {
      status: 200,
      payload: ok(doc, 'Architectural dossier unlocked for viewing and print.'),
    };
  }

  // 6. GET /projects/:slug
  const projectSlugMatch = cleanPath.match(/^projects\/([^/]+)$/);
  if (method === 'GET' && projectSlugMatch) {
    const slug = decodeURIComponent(projectSlugMatch[1]);
    const project = mockProjects.find((p) => p.slug === slug);
    if (!project) {
      return {
        status: 404,
        payload: fail(
          'PROJECT_NOT_FOUND',
          'We could not locate a development matching this address.'
        ),
      };
    }
    return { status: 200, payload: ok(project) };
  }

  // 7. GET /units/:unitId
  const unitDetailMatch = cleanPath.match(/^units\/([^/]+)$/);
  if (method === 'GET' && unitDetailMatch) {
    const unitId = decodeURIComponent(unitDetailMatch[1]);
    const unit = mockUnits.find((u) => u.id === unitId);
    if (!unit) {
      return {
        status: 404,
        payload: fail('UNIT_NOT_FOUND', 'The requested residence record could not be found.'),
      };
    }
    return { status: 200, payload: ok(unit) };
  }

  // 8. POST /leads & POST /contact-inquiries
  if (method === 'POST' && (cleanPath === 'leads' || cleanPath === 'contact-inquiries')) {
    const body = (args.body ?? {}) as Partial<LeadCreateRequest>;
    const fields: Record<string, string> = {};

    if (!body.fullName || body.fullName.trim().length < 2) {
      fields.fullName = 'Please enter your full name.';
    }
    if (!body.email || !isValidEmail(body.email)) {
      fields.email = 'Please provide a valid email address.';
    }
    if (!body.phone || body.phone.trim().length < 6) {
      fields.phone = 'Please provide a reachable telephone number.';
    }
    if (body.consent !== true) {
      fields.consent = 'Consent is required so a senior advisor may respond.';
    }

    if (Object.keys(fields).length > 0) {
      return {
        status: 400,
        payload: fail('VALIDATION_ERROR', 'Please review the highlighted fields.', fields),
      };
    }

    if (body.type === 'BROCHURE_REQUEST' && body.projectId) {
      authorizedBrochureProjects.add(body.projectId);
    }

    return {
      status: 201,
      payload: ok(
        {},
        'Your inquiry has been received by the Aurelia Private Sales Office. A dedicated advisor will respond shortly.'
      ),
    };
  }

  // 9. POST /site-visits
  if (method === 'POST' && cleanPath === 'site-visits') {
    const body = (args.body ?? {}) as Partial<SiteVisitCreateRequest>;
    const fields: Record<string, string> = {};

    if (!body.fullName || body.fullName.trim().length < 2) {
      fields.fullName = 'Please enter your full name.';
    }
    if (!body.email || !isValidEmail(body.email)) {
      fields.email = 'Please provide a valid email address.';
    }
    if (!body.phone || body.phone.trim().length < 6) {
      fields.phone = 'Please provide a telephone number for arrival coordination.';
    }
    if (!body.projectId) {
      fields.projectId = 'Please select a development.';
    }
    if (!body.preferredDate) {
      fields.preferredDate = 'Please select your preferred date.';
    }
    if (!body.preferredTime) {
      fields.preferredTime = 'Please choose a preferred time window.';
    }
    if (body.consent !== true) {
      fields.consent = 'Consent is required to process your appointment request.';
    }

    if (Object.keys(fields).length > 0) {
      return {
        status: 400,
        payload: fail('VALIDATION_ERROR', 'Please verify your site-visit details.', fields),
      };
    }

    return {
      status: 201,
      payload: ok(
        {},
        'Appointment request registered (Pending Confirmation). Our Private Sales Gallery will contact you to confirm availability for your requested window.'
      ),
    };
  }

  // 10. POST /brochure-requests
  if (method === 'POST' && cleanPath === 'brochure-requests') {
    const body = (args.body ?? {}) as Partial<BrochureCreateRequest>;
    const fields: Record<string, string> = {};

    if (!body.fullName || body.fullName.trim().length < 2) {
      fields.fullName = 'Please enter your full name.';
    }
    if (!body.email || !isValidEmail(body.email)) {
      fields.email = 'Please provide a valid email address.';
    }
    if (!body.projectId) {
      fields.projectId = 'Please select a development.';
    }
    if (body.consent !== true) {
      fields.consent = 'Consent is required to release private portfolio documentation.';
    }

    if (Object.keys(fields).length > 0) {
      return {
        status: 400,
        payload: fail('VALIDATION_ERROR', 'Please complete the required details.', fields),
      };
    }

    authorizedBrochureProjects.add(body.projectId!);

    return {
      status: 201,
      payload: ok(
        {},
        'Registration complete. Your architectural monograph is now authorized for viewing.'
      ),
    };
  }

  return {
    status: 404,
    payload: fail('ENDPOINT_NOT_FOUND', `Unhandled API route: ${method} /api/v1/${cleanPath}`),
  };
}
