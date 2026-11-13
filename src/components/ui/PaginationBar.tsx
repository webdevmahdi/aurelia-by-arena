import clsx from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Pagination } from '@/types/api';

export function PaginationBar({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (nextPage: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;

  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-4 pt-10 mt-12 border-t border-[var(--border-hairline)]"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-ink-muted tabular-nums">
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} Total Records
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--border-strong)] text-xs uppercase tracking-[0.15em] disabled:opacity-35 hover:bg-ink hover:text-ivory transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === pagination.page ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className={clsx(
              'w-9 h-9 text-xs tabular-nums border transition-colors cursor-pointer',
              p === pagination.page
                ? 'bg-ink text-ivory border-ink'
                : 'border-[var(--border-hairline)] text-ink hover:border-ink'
            )}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--border-strong)] text-xs uppercase tracking-[0.15em] disabled:opacity-35 hover:bg-ink hover:text-ivory transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
}
