import { AlertCircle, RotateCcw } from 'lucide-react';
import type { ApiError } from '@/types/api';

export function LoadingPlate({ label = 'Retrieving architectural ledger…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="py-20 px-6 border border-[var(--border-hairline)] bg-elevated/60 flex flex-col items-center justify-center text-center gap-4"
    >
      <div className="w-12 h-px bg-bronze animate-pulse" aria-hidden="true" />
      <p className="text-xs uppercase tracking-[0.22em] text-ink-muted">{label}</p>
    </div>
  );
}

export function EmptyLedgerState({
  title,
  description,
  onReset,
  resetLabel = 'Clear Active Filters',
}: {
  title: string;
  description: string;
  onReset?: () => void;
  resetLabel?: string;
}) {
  return (
    <div className="py-20 px-8 border border-[var(--border-hairline)] bg-elevated text-center max-w-2xl mx-auto space-y-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-bronze">No Matching Records</p>
      <h3 className="font-serif text-3xl text-ink">{title}</h3>
      <p className="text-sm text-ink-secondary leading-relaxed max-w-md mx-auto">{description}</p>
      {onReset && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-6 py-3 border border-ink text-ink text-xs uppercase tracking-[0.18em] hover:bg-ink hover:text-ivory transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            {resetLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export function ErrorRetryState({
  error,
  onRetry,
}: {
  error?: ApiError | unknown;
  onRetry?: () => void;
}) {
  const apiErr =
    error && typeof error === 'object' && 'error' in error
      ? (error as ApiError).error
      : undefined;

  return (
    <div
      role="alert"
      className="py-16 px-8 border border-[var(--status-sold-border)] bg-[var(--status-sold-bg)]/45 max-w-2xl mx-auto text-center space-y-4"
    >
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--status-sold-fg)]">
        <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
        <span>{apiErr?.code ?? 'SERVICE_INTERRUPTION'}</span>
      </div>
      <h3 className="font-serif text-2xl text-ink">Unable to Retrieve Portfolio Data</h3>
      <p className="text-sm text-ink-secondary max-w-md mx-auto">
        {apiErr?.message ??
          'A temporary connection issue occurred while loading architectural records.'}
      </p>
      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            Retry Request
          </button>
        </div>
      )}
    </div>
  );
}
