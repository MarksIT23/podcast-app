import { Search, X } from 'lucide-react';

/**
 * SearchInput — debounced search input with clear button.
 * Props: value, onChange, placeholder, className
 */
export default function SearchInput({ value = '', onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-9 pr-9 py-2 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all duration-200 focus:border-[var(--color-accent-purple)] focus:shadow-[var(--glow-purple)] ${className}`}
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange?.('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Clear search"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
