import Badge from './Badge';

/**
 * StatusBadge — maps status strings to Badge variants.
 * active→success, suspended→danger, published→success, draft→warning, archived→neutral
 */
const statusMap = {
  active: 'success',
  suspended: 'danger',
  published: 'success',
  draft: 'warning',
  archived: 'neutral',
  pending: 'warning',
  error: 'danger',
};

export default function StatusBadge({ status = 'active', className = '' }) {
  const variant = statusMap[status] || 'neutral';
  return (
    <Badge variant={variant} size="sm" dot className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
