# Aurelia Developments — Frontend Platform

Premium architectural real-estate sales and lead-generation frontend built strictly against **API Contract v1**.

## Technical Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS v4 + Architectural CSS Custom Property Tokens (`src/styles/tokens.css`)
- **Typography:** Cormorant Garamond (Display Editorial Serif) + Plus Jakarta Sans (Neutral UI/Body Sans)
- **State & Remote Data:** Redux Toolkit + RTK Query (`src/services/api/apiSlice.ts`)
- **Motion:** Framer Motion (route, drawer, lightbox, comparison transitions) + GSAP & ScrollTrigger (`src/hooks/useGsapAnimations.ts`) with full `prefers-reduced-motion` support
- **Forms & Validation:** React Hook Form + Zod

## Environment & Mock/Backend Switching

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SITE_URL=http://localhost:5173
VITE_USE_MOCK_API=true
```

- When `VITE_USE_MOCK_API=true` (default), RTK Query routes requests through the contract-compatible mock adapter (`src/services/api/mockAdapter.ts`) returning exact `ApiSuccess<T>` and `ApiError` envelopes.
- Set `VITE_USE_MOCK_API=false` once the backend is running at `${VITE_API_BASE_URL}/api/v1` — zero page or component rewrites are required.

## Scripts

```bash
npm run dev        # Start Vite dev server on 0.0.0.0:5173
npm run typecheck  # Strict TypeScript check
npm run build      # Production build
npm run preview    # Preview production build
```
