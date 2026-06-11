import { forwardRef } from 'react';

/**
 * Input — Spotify-dark themed input with optional icon and label.
 */
const Input = forwardRef(function Input(
  {
    variant = 'default',
    size = 'md',
    className = '',
    label,
    error,
    helperText,
    icon,
    style: extraStyle = {},
    ...props
  },
  ref
) {
  const isSearch = variant === 'search';

  const sizeMap = {
    sm: { padding: icon ? '6px 12px 6px 36px' : '6px 12px', fontSize: '0.78rem', height: '32px' },
    md: { padding: icon ? '10px 16px 10px 40px' : '10px 16px', fontSize: '0.875rem', height: '42px' },
    lg: { padding: icon ? '13px 20px 13px 44px' : '13px 20px', fontSize: '1rem', height: '50px' },
  };

  const s = sizeMap[size] || sizeMap.md;

  const baseInputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: isSearch ? '999px' : '12px',
    padding: s.padding,
    fontSize: s.fontSize,
    height: s.height,
    color: '#fff',
    outline: 'none',
    transition: 'all 0.2s ease',
    ...extraStyle,
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#1DB954';
    e.target.style.background = 'rgba(255,255,255,0.08)';
    e.target.style.boxShadow = '0 0 0 3px rgba(29,185,84,0.12)';
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.background = 'rgba(255,255,255,0.06)';
    e.target.style.boxShadow = 'none';
    props.onBlur?.(e);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          className="text-sm font-medium"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          style={baseInputStyle}
          className="placeholder-white/25"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs" style={{ color: '#F87171' }}>{error}</span>
      )}
    </div>
  );
});

export default Input;
