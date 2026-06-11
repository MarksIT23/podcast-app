import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — page navigation with page size selector.
 * Props: page, totalPages, pageNumbers[], onPageChange, pageSize, onPageSizeChange, total
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  pageNumbers = [],
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  total = 0,
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      <p className="text-small text-[var(--text-tertiary)]">
        Showing {start}–{end} of {total}
      </p>

      <div className="flex items-center gap-2">
        {/* Page size selector */}
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--text-secondary)] outline-none"
            aria-label="Page size"
          >
            {[10, 25, 50].map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange?.(p)}
              className={`w-8 h-8 rounded-[var(--radius-md)] text-small font-medium transition-colors ${
                p === page
                  ? 'bg-[var(--color-accent-purple)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-hover)]'
              }`}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
