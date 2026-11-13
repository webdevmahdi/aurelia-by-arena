import clsx from 'clsx';
import type { ReactNode } from 'react';

type SectionHeadingProps = {
  index?: string;
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
  invert?: boolean;
  className?: string;
};

export function SectionHeading({
  index,
  kicker,
  title,
  description,
  action,
  invert = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={clsx(
        'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end pb-10 border-b',
        invert ? 'border-[var(--border-on-dark)]' : 'border-[var(--border-hairline)]',
        className
      )}
    >
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center gap-3 text-[11px] font-medium tracking-[0.22em] uppercase">
          {index && (
            <span className={clsx('tabular-nums', invert ? 'text-brass' : 'text-bronze')}>
              {index}
            </span>
          )}
          {index && (
            <span
              className={clsx(
                'w-6 h-px',
                invert ? 'bg-[var(--border-on-dark-strong)]' : 'bg-[var(--border-strong)]'
              )}
              aria-hidden="true"
            />
          )}
          <span className={invert ? 'text-ivory-muted' : 'text-ink-muted'}>{kicker}</span>
        </div>
        <h2
          className={clsx(
            'font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.08] tracking-[-0.015em]',
            invert ? 'text-ivory' : 'text-ink'
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={clsx(
              'max-w-2xl text-base leading-relaxed',
              invert ? 'text-ivory-muted' : 'text-ink-secondary'
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="lg:col-span-4 lg:flex lg:justify-end">{action}</div>}
    </div>
  );
}
