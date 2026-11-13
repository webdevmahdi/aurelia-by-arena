import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageCircle, Scale, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { setComparisonOpen } from '@/features/comparison/comparisonSlice';
import { buildWhatsAppConciergeUrl } from '@/lib/format';

const NAV_ITEMS = [
  { to: '/projects', label: 'Developments' },
  { to: '/search', label: 'Residences' },
  { to: '/about', label: 'Ethos' },
  { to: '/contact', label: 'Private Sales' },
];

export function SiteHeader() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const compareCount = useAppSelector((s) => s.comparison.items.length);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 transition-colors duration-300 border-b',
        scrolled
          ? 'bg-canvas/95 backdrop-blur-md border-[var(--border-hairline)]'
          : 'bg-canvas border-[var(--border-hairline)]'
      )}
    >
      <div className="container-wide h-20 flex items-center justify-between gap-6">
        {/* Brand Monogram & Wordmark */}
        <Link to="/" className="group inline-flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="w-9 h-9 border border-ink flex items-center justify-center font-serif text-lg tracking-wider bg-obsidian text-ivory group-hover:bg-bronze group-hover:border-bronze transition-colors"
          >
            A
          </span>
          <div>
            <span className="block font-serif text-xl tracking-[0.22em] uppercase text-ink leading-none">
              Aurelia
            </span>
            <span className="block text-[9px] uppercase tracking-[0.28em] text-ink-muted mt-1">
              Developments
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-9">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'text-xs uppercase tracking-[0.18em] py-1 transition-colors relative',
                  isActive
                    ? 'text-ink font-medium after:content-[""] after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-bronze'
                    : 'text-ink-secondary hover:text-ink'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Conversion Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {compareCount > 0 && (
            <button
              type="button"
              onClick={() => dispatch(setComparisonOpen(true))}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-[var(--border-strong)] text-xs uppercase tracking-[0.15em] text-ink hover:border-ink transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
              <span className="tabular-nums">Compare ({compareCount})</span>
            </button>
          )}

          <a
            href={buildWhatsAppConciergeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[var(--border-hairline)] text-xs uppercase tracking-[0.15em] text-ink-secondary hover:border-ink hover:text-ink transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => dispatch(openConversionModal({ mode: 'SITE_VISIT' }))}
            className="px-5 py-2.5 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors cursor-pointer"
          >
            Schedule a Visit
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {compareCount > 0 && (
            <button
              type="button"
              onClick={() => dispatch(setComparisonOpen(true))}
              aria-label={`Open residence comparison (${compareCount})`}
              className="px-2.5 py-2 border border-[var(--border-strong)] text-xs tabular-nums text-ink"
            >
              <Scale className="w-4 h-4 inline mr-1 text-bronze" strokeWidth={1.5} />
              {compareCount}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="p-2.5 border border-[var(--border-strong)] text-ink"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Architectural Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-[var(--border-hairline)] bg-elevated overflow-hidden"
          >
            <div className="container-wide py-8 space-y-8">
              <nav aria-label="Mobile Primary" className="flex flex-col divide-y divide-[var(--border-hairline)]">
                <NavLink
                  to="/"
                  end
                  className="py-3.5 font-serif text-2xl text-ink"
                >
                  Home
                </NavLink>
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="py-3.5 font-serif text-2xl text-ink"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    dispatch(openConversionModal({ mode: 'SITE_VISIT' }));
                  }}
                  className="py-3.5 px-5 bg-ink text-ivory text-xs uppercase tracking-[0.18em]"
                >
                  Schedule a Site Visit
                </button>
                <a
                  href={buildWhatsAppConciergeUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-5 border border-ink text-ink text-xs uppercase tracking-[0.18em] text-center"
                >
                  WhatsApp Sales Concierge
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
