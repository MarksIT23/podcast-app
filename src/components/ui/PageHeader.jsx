/**
 * PageHeader — title + optional description + actions slot.
 * Props: title, description, actions (ReactNode), className
 */
export default function PageHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-display mb-1">{title}</h1>
        {description && <p className="text-body text-[var(--text-secondary)]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
