import { useId } from 'react';

/**
 * Switch — toggle component.
 * Props: label, description, checked, onChange, id, disabled
 */
export default function Switch({ label, description, checked, onChange, id, disabled = false }) {
  const defaultId = useId();
  const switchId = id || defaultId;

  return (
    <div className="flex items-start gap-3">
      <button
        id={switchId}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative w-10 h-6 rounded-full shrink-0 mt-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-black-deep)] ${
          checked ? 'bg-[var(--color-accent-purple)]' : 'bg-[var(--color-border)]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
          aria-hidden="true"
        />
      </button>
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={switchId} className="text-small text-[var(--text-secondary)] cursor-pointer select-none font-medium">
              {label}
            </label>
          )}
          {description && (
            <p className="text-caption text-[var(--text-tertiary)]">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
