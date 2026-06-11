import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumbs — navigation trail.
 * Props: items [{label, href?}], className
 */
export default function Breadcrumbs({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label + i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-[var(--text-tertiary)]" aria-hidden="true" />}
              {isLast ? (
                <span className="text-small text-[var(--text-secondary)]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href || '#'}
                  className="text-small text-[var(--text-tertiary)] hover:text-[var(--color-accent-purple-light)] transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
