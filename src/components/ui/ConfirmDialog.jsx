import Modal from './Modal';
import Button from './Button';

/**
 * ConfirmDialog — confirms destructive actions.
 * Props: open, onClose, onConfirm, title, message, confirmLabel, loading
 */
export default function ConfirmDialog({
  open = false,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title={title}>
      <div className="py-2">
        <p className="text-body text-[var(--text-secondary)]">{message}</p>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="danger"
          size="md"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Deleting...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
