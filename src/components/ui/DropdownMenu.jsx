import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

/**
 * DropdownMenu — dropdown with items.
 * Props: trigger (ReactNode), items [{label, icon?, onClick?, danger?}], align ('left'|'right')
 */
export default function DropdownMenu({ trigger, items = [], align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {trigger || <MoreHorizontal size={16} aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-1 z-[var(--z-dropdown)] min-w-[160px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown)] py-1 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
            role="menu"
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-small transition-colors ${
                  item.danger
                    ? 'text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--text-primary)]'
                }`}
                role="menuitem"
              >
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
