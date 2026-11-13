import { AnimatePresence, motion } from 'framer-motion';
import { Compass, ExternalLink, Play, X } from 'lucide-react';
import { useState } from 'react';
import type { MediaDTO } from '@/types/api';

export function VideoAndTourShowcase({
  videos,
  virtualTourUrl,
  projectName,
  fallbackPoster,
}: {
  videos: MediaDTO[];
  virtualTourUrl?: string;
  projectName: string;
  fallbackPoster?: string;
}) {
  const [activeEmbed, setActiveEmbed] = useState<{
    title: string;
    url: string;
    mimeType?: string;
  } | null>(null);

  if (videos.length === 0 && !virtualTourUrl) return null;

  const primaryVideo = videos[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {primaryVideo && (
        <div
          className={
            virtualTourUrl ? 'lg:col-span-7' : 'lg:col-span-12'
          }
        >
          <div className="relative group overflow-hidden border border-[var(--border-hairline)] bg-obsidian">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={primaryVideo.thumbnailUrl ?? fallbackPoster ?? '/media/hero-sanctuary.jpg'}
                alt={primaryVideo.alt ?? `${projectName} Architectural Film`}
                loading="lazy"
                className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-t from-[#171614]/85 via-[#171614]/25 to-transparent">
              <span className="text-[11px] uppercase tracking-[0.22em] text-brass">
                Architectural Film
              </span>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-ivory">
                    {primaryVideo.title ?? `${projectName} — Spatial Study`}
                  </h3>
                  <p className="text-xs text-ivory-muted mt-1">
                    Light progression, facade materiality, and interior acoustic calm
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveEmbed({
                      title: primaryVideo.title ?? `${projectName} Film`,
                      url: primaryVideo.url,
                      mimeType: primaryVideo.mimeType,
                    })
                  }
                  className="inline-flex items-center gap-2.5 px-5 py-3 bg-ivory text-ink text-xs uppercase tracking-[0.18em] hover:bg-bronze hover:text-ivory transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                  Watch Study
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {virtualTourUrl && (
        <div
          className={
            primaryVideo ? 'lg:col-span-5' : 'lg:col-span-12'
          }
        >
          <div className="h-full border border-[var(--border-hairline)] bg-elevated p-8 sm:p-10 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-bronze">
                <Compass className="w-4 h-4" strokeWidth={1.5} />
                <span>Remote Spatial Inspection</span>
              </div>
              <h3 className="font-serif text-3xl text-ink">
                Interactive Architectural Walkthrough
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Designed for international and remote buyers, explore principal salons, stone
                kitchens, subterranean thermal wellness suites, and terrace sightlines at your own
                pace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() =>
                  setActiveEmbed({
                    title: `${projectName} — Interactive Spatial Walkthrough`,
                    url: virtualTourUrl,
                    mimeType: 'text/html',
                  })
                }
                className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors cursor-pointer"
              >
                Launch Interactive Tour
              </button>
              <a
                href={virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 border border-[var(--border-strong)] text-xs uppercase tracking-[0.16em] text-ink hover:border-ink transition-colors"
              >
                <span>Open Full Window</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeEmbed && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={activeEmbed.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#171614]/95 text-ivory flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-on-dark)]">
              <span className="text-xs uppercase tracking-[0.2em] text-ivory">
                {activeEmbed.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveEmbed(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--border-on-dark-strong)] text-xs uppercase tracking-[0.16em] hover:bg-ivory hover:text-ink transition-colors cursor-pointer"
              >
                <span>Close</span>
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 p-4 sm:p-8">
              {activeEmbed.mimeType?.startsWith('video/') ? (
                <video
                  src={activeEmbed.url}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[82vh] object-contain mx-auto"
                />
              ) : (
                <iframe
                  src={activeEmbed.url}
                  title={activeEmbed.title}
                  className="w-full h-full border border-[var(--border-on-dark)] bg-obsidian"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
