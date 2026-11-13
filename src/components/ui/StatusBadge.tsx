import clsx from 'clsx';
import {
  CheckCircle2,
  Clock,
  Compass,
  Lock,
  MinusCircle,
  Slash,
} from 'lucide-react';
import { formatProjectStatus, formatUnitStatus } from '@/lib/format';
import type { ProjectStatus, UnitStatus } from '@/types/api';

export function ProjectStatusBadge({
  status,
  invert = false,
}: {
  status: ProjectStatus;
  invert?: boolean;
}) {
  const Icon =
    status === 'COMPLETED'
      ? CheckCircle2
      : status === 'UNDER_CONSTRUCTION'
        ? Clock
        : Compass;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1 text-[11px] font-medium tracking-[0.16em] uppercase border',
        invert
          ? 'bg-[#171614]/80 text-[#F3EFE7] border-[#F3EFE7]/25 backdrop-blur-[2px]'
          : 'bg-elevated text-ink border-[var(--border-strong)]'
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 text-bronze" strokeWidth={1.5} aria-hidden="true" />
      <span>{formatProjectStatus(status)}</span>
    </span>
  );
}

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  const config = {
    AVAILABLE: {
      icon: CheckCircle2,
      style:
        'bg-[var(--status-available-bg)] text-[var(--status-available-fg)] border-[var(--status-available-border)]',
    },
    RESERVED: {
      icon: Lock,
      style:
        'bg-[var(--status-reserved-bg)] text-[var(--status-reserved-fg)] border-[var(--status-reserved-border)]',
    },
    SOLD: {
      icon: Slash,
      style:
        'bg-[var(--status-sold-bg)] text-[var(--status-sold-fg)] border-[var(--status-sold-border)] pattern-diagonal-subtle',
    },
    UNAVAILABLE: {
      icon: MinusCircle,
      style:
        'bg-[var(--status-unavailable-bg)] text-[var(--status-unavailable-fg)] border-[var(--status-unavailable-border)] pattern-diagonal-subtle',
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-[0.15em] uppercase border',
        config.style
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
      <span>{formatUnitStatus(status)}</span>
    </span>
  );
}
