/**
 * LoadingSkeleton — pulse animation placeholders.
 * Variants: text, card, table-row, avatar
 */
const variantStyles = {
  text: 'h-4 w-full rounded',
  card: 'h-32 w-full rounded-[var(--radius-xl)]',
  'table-row': 'h-10 w-full rounded',
  avatar: 'w-10 h-10 rounded-full',
};

export default function LoadingSkeleton({ variant = 'text', count = 1, className = '' }) {
  const baseClass = 'bg-[var(--color-surface-hover)] animate-pulse';
  const variantClass = variantStyles[variant] || variantStyles.text;

  return (
    <div className="space-y-3" role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${baseClass} ${variantClass} ${className}`} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
