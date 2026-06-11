import { useState } from 'react';

/**
 * Simple Tooltip — hover/focus tooltip.
 * Props: content, children, position ('top'|'bottom'|'left'|'right')
 */
const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export default function Tooltip({ content, children, position = 'top', className = '' }) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-[var(--z-tooltip)] px-2 py-1 text-caption text-white bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-dropdown)] whitespace-nowrap pointer-events-none ${positionStyles[position] || positionStyles.top} ${className}`}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
