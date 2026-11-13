import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { LoadingPlate } from '@/components/ui/DataStates';

const HomePage = lazy(() => import('@/pages/Home/HomePage'));
const ProjectsPage = lazy(() => import('@/pages/Projects/ProjectsPage'));
const ProjectDetailPage = lazy(
  () => import('@/pages/ProjectDetail/ProjectDetailPage')
);
const ProjectUnitsPage = lazy(
  () => import('@/pages/Projects/ProjectUnitsPage')
);
const UnitDetailPage = lazy(() => import('@/pages/UnitDetail/UnitDetailPage'));
const SearchPage = lazy(() => import('@/pages/Search/SearchPage'));
const AboutPage = lazy(() => import('@/pages/About/AboutPage'));
const ContactPage = lazy(() => import('@/pages/Contact/ContactPage'));
const LegalPage = lazy(() => import('@/pages/Legal/LegalPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));

function PageFallback() {
  return (
    <div className="container-wide py-24">
      <LoadingPlate />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'projects',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: 'projects/:projectSlug',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ProjectDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'projects/:projectSlug/units',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ProjectUnitsPage />
          </Suspense>
        ),
      },
      {
        path: 'units/:unitId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <UnitDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'search',
        element: (
          <Suspense fallback={<PageFallback />}>
            <SearchPage />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: 'contact',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ContactPage />
          </Suspense>
        ),
      },
      {
        path: 'privacy',
        element: (
          <Suspense fallback={<PageFallback />}>
            <LegalPage variant="privacy" />
          </Suspense>
        ),
      },
      {
        path: 'terms',
        element: (
          <Suspense fallback={<PageFallback />}>
            <LegalPage variant="terms" />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<PageFallback />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
