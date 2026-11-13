import clsx from 'clsx';
import { Check, CircleDot } from 'lucide-react';
import { formatDateEditorial } from '@/lib/format';
import type { ConstructionUpdateDTO } from '@/types/api';

const STAGES = [
  { label: 'Foundation', threshold: 15 },
  { label: 'Structure', threshold: 35 },
  { label: 'Exterior', threshold: 60 },
  { label: 'Interiors', threshold: 80 },
  { label: 'Landscaping', threshold: 92 },
  { label: 'Handover', threshold: 100 },
];

export function ConstructionTimeline({
  overallProgress,
  updates,
}: {
  overallProgress: number;
  updates: ConstructionUpdateDTO[];
}) {
  const safeProgress = Math.min(100, Math.max(0, overallProgress));

  return (
    <div className="space-y-10">
      {/* Overall Engineering Progress Ledger */}
      <div className="border border-[var(--border-hairline)] bg-elevated p-6 sm:p-10 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-bronze">
              Verified Site Certification
            </p>
            <h3 className="font-serif text-3xl text-ink mt-1">
              Overall Construction Completion
            </h3>
          </div>
          <div className="font-serif text-5xl text-ink tabular-nums">
            {safeProgress}%
          </div>
        </div>

        {/* Restrained Architectural Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={safeProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall construction progress"
          className="h-2 w-full bg-stone overflow-hidden"
        >
          <div
            style={{ width: `${safeProgress}%` }}
            className="h-full bg-ink transition-all duration-700"
          />
        </div>

        {/* Six Construction Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
          {STAGES.map((stage, idx) => {
            const prevThreshold = idx === 0 ? 0 : STAGES[idx - 1].threshold;
            const completed = safeProgress >= stage.threshold;
            const current = !completed && safeProgress >= prevThreshold;

            return (
              <div
                key={stage.label}
                className={clsx(
                  'p-3.5 border text-xs space-y-2',
                  completed
                    ? 'border-ink bg-canvas text-ink'
                    : current
                      ? 'border-bronze bg-elevated text-ink'
                      : 'border-[var(--border-hairline)] text-ink-muted'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="tabular-nums text-[10px] tracking-[0.16em] uppercase">
                    0{idx + 1}
                  </span>
                  {completed ? (
                    <Check className="w-3.5 h-3.5 text-bronze" strokeWidth={1.75} />
                  ) : current ? (
                    <CircleDot className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
                  ) : null}
                </div>
                <p className="font-medium tracking-[0.06em]">{stage.label}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  {completed ? 'Completed' : current ? 'In Progress' : 'Scheduled'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dated Milestone Reports */}
      {updates.length > 0 && (
        <div className="space-y-6">
          {updates.map((update) => {
            const leadPhoto = update.media.find((m) => m.type === 'IMAGE');
            return (
              <article
                key={update.id}
                className="grid grid-cols-1 lg:grid-cols-12 border border-[var(--border-hairline)] bg-elevated"
              >
                <div
                  className={clsx(
                    'p-6 sm:p-8 flex flex-col justify-between gap-4',
                    leadPhoto ? 'lg:col-span-7' : 'lg:col-span-12'
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                      <time dateTime={update.date}>{formatDateEditorial(update.date)}</time>
                      <span>·</span>
                      <span className="text-bronze tabular-nums">
                        {update.progressPercent}% Milestone
                      </span>
                    </div>
                    <h4 className="font-serif text-2xl text-ink">{update.title}</h4>
                    <p className="text-sm text-ink-secondary leading-relaxed max-w-2xl">
                      {update.description}
                    </p>
                  </div>
                </div>
                {leadPhoto && (
                  <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-[var(--border-hairline)]">
                    <img
                      src={leadPhoto.url}
                      alt={leadPhoto.alt ?? update.title}
                      loading="lazy"
                      className="w-full h-full max-h-64 lg:max-h-none object-cover aspect-[16/10]"
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
