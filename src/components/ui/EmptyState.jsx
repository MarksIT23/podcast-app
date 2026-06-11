/**
 * EmptyState — displayed when a list/table has no data.
 * Props: icon (component), title, message, action (ReactNode - typically a Button)
 */
export default function EmptyState({ icon: Icon, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center mb-4" aria-hidden="true">
          <Icon size={28} className="text-[var(--text-tertiary)]" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-card text-[var(--text-primary)] mb-2">{title}</h3>
      {message && <p className="text-body text-[var(--text-tertiary)] max-w-sm mb-6">{message}</p>}
      {action}
    </div>
  );
}
