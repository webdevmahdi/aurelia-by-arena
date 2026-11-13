import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ConversionDrawer } from '@/components/conversion/ConversionDrawer';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ComparisonTrayAndDrawer } from '@/features/comparison/ComparisonTrayAndDrawer';

export function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-ivory"
      >
        Skip to main content
      </a>

      <SiteHeader />

      <motion.main
        id="main-content"
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>

      <SiteFooter />

      <ComparisonTrayAndDrawer />
      <ConversionDrawer />
    </div>
  );
}
