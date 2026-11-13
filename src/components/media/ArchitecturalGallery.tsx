import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { MediaDTO } from '@/types/api';

export function ArchitecturalGallery({
  media,
  heading = 'Architectural Plates',
}: {
  media: MediaDTO[];
  heading?: string;
}) {
  const images = media.filter((m) => m.type === 'IMAGE' || m.type === 'PANORAMA');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(() => {
    setActiveIndex((idx) =>
      idx === null ? null : (idx - 1 + images.length) % images.length
    );
  }, [images.length]);
  const showNext = useCallback(() => {
    setActiveIndex((idx) => (idx === null ? null : (idx + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, closeLightbox, showPrev, showNext]);

  if (images.length === 0) return null;

  return (
    <div>
      {/* Asymmetrical Architectural Monograph Plate Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
        {images.map((item, idx) => {
          const isLead = idx === 0;
          const colSpan = isLead
            ? 'md:col-span-8 md:row-span-2'
            : idx === 1 || idx === 2
              ? 'md:col-span-4'
              : 'md:col-span-6';

          return (
            <figure
              key={item.id}
              className={clsx(
                'group relative overflow-hidden bg-stone border border-[var(--border-hairline)]',
                colSpan
              )}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Open fullscreen plate: ${item.title ?? item.alt ?? heading}`}
                className="block w-full h-full text-left cursor-pointer"
              >
                <div
                  className={clsx(
                    'w-full overflow-hidden',
                    isLead ? 'aspect-[16/11] md:h-full' : 'aspect-[16/10]'
                  )}
                >
                  <img
                    src={item.url}
                    alt={item.alt ?? item.title ?? heading}
                    width={item.width ?? 1600}
                    height={item.height ?? 1066}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-[#171614]/80 via-[#171614]/35 to-transparent flex items-end justify-between gap-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-ivory/75 tabular-nums">
                      Plate {String(idx + 1).padStart(2, '0')}
                    </span>
                    {item.title && (
                      <span className="font-serif text-lg text-ivory">{item.title}</span>
                    )}
                  </div>
                  <span className="inline-flex items-center justify-center w-8 h-8 border border-ivory/35 text-ivory bg-[#171614]/55 group-hover:bg-bronze group-hover:border-bronze transition-colors">
                    <Expand className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                </div>
              </button>
            </figure>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Viewer */}
      <AnimatePresence>
        {activeIndex !== null && images[activeIndex] && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen architectural gallery viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-50 bg-[#171614]/96 text-ivory flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-on-dark)]">
              <div className="text-xs uppercase tracking-[0.22em] text-ivory-muted tabular-nums">
                Plate {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(images.length).padStart(2, '0')}
                {images[activeIndex].title ? ` — ${images[activeIndex].title}` : ''}
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close fullscreen gallery"
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--border-on-dark-strong)] text-xs uppercase tracking-[0.16em] hover:bg-ivory hover:text-ink transition-colors cursor-pointer"
              >
                <span>Close</span>
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center p-4 sm:p-10 overflow-hidden">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous image"
                  className="absolute left-4 sm:left-8 z-10 w-11 h-11 flex items-center justify-center border border-[var(--border-on-dark-strong)] bg-[#171614]/75 hover:bg-bronze hover:border-bronze transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}

              <motion.img
                key={images[activeIndex].id}
                initial={{ opacity: 0.3, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28 }}
                src={images[activeIndex].url}
                alt={images[activeIndex].alt ?? images[activeIndex].title ?? ''}
                className="max-h-[78vh] max-w-[88vw] object-contain border border-[var(--border-on-dark)]"
              />

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next image"
                  className="absolute right-4 sm:right-8 z-10 w-11 h-11 flex items-center justify-center border border-[var(--border-on-dark-strong)] bg-[#171614]/75 hover:bg-bronze hover:border-bronze transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {images[activeIndex].alt && (
              <div className="px-6 py-4 border-t border-[var(--border-on-dark)] text-center text-xs text-ivory-muted">
                {images[activeIndex].alt}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
