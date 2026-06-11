import { motion } from 'framer-motion';

/**
 * Button — Spotify-themed with green primary, ghost, danger variants.
 */

const variantStyles = {
  primary: {
    background: '#1DB954',
    color: '#000',
    border: '1px solid #1DB954',
    '--hover-bg': '#1ED760',
    '--hover-shadow': '0 0 40px rgba(29,185,84,0.55)',
    '--shadow': '0 0 24px rgba(29,185,84,0.35)',
  },
  secondary: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid transparent',
  },
  dark: {
    background: '#282828',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  danger: {
    background: '#EF4444',
    color: '#fff',
    border: '1px solid #EF4444',
    '--shadow': '0 0 20px rgba(239,68,68,0.35)',
  },
};

const sizeStyles = {
  sm: { padding: '7px 18px', fontSize: '0.78rem', height: '32px', borderRadius: '999px' },
  md: { padding: '10px 24px', fontSize: '0.875rem', height: '38px', borderRadius: '999px' },
  lg: { padding: '14px 36px', fontSize: '0.95rem', height: '48px', borderRadius: '999px' },
};

const SUCCESS_VARIANT = {
  background: '#1DB954',
  color: '#000',
  border: '1px solid #1DB954',
  '--hover-bg': '#1ED760',
  '--hover-shadow': '0 0 40px rgba(29,185,84,0.55)',
  '--shadow': '0 0 24px rgba(29,185,84,0.35)',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  as: Component = 'button',
  href,
  ...props
}) {
  const allVariants = { ...variantStyles, success: SUCCESS_VARIANT };
  const vs = allVariants[variant] || allVariants.primary;
  const ss = sizeStyles[size] || sizeStyles.md;
  const isDisabled = disabled || loading;

  const baseStyle = {
    ...vs,
    ...ss,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 700,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.45 : 1,
    width: fullWidth ? '100%' : undefined,
    transition: 'all 0.2s ease',
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    boxShadow: vs['--shadow'] || 'none',
  };

  const handleMouseEnter = (e) => {
    if (isDisabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.background = '#1ED760';
      e.currentTarget.style.transform = 'scale(1.04)';
      e.currentTarget.style.boxShadow = '0 0 40px rgba(29,185,84,0.55)';
    } else if (variant === 'secondary') {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
      e.currentTarget.style.color = '#fff';
    } else if (variant === 'dark') {
      e.currentTarget.style.background = '#333';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
    } else if (variant === 'danger') {
      e.currentTarget.style.background = '#DC2626';
      e.currentTarget.style.boxShadow = '0 0 30px rgba(239,68,68,0.5)';
    } else if (variant === 'ghost') {
      e.currentTarget.style.color = '#fff';
      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
    }
  };

  const handleMouseLeave = (e) => {
    if (isDisabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.background = '#1DB954';
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 0 24px rgba(29,185,84,0.35)';
    } else if (variant === 'secondary') {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
    } else if (variant === 'dark') {
      e.currentTarget.style.background = '#282828';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
    } else if (variant === 'danger') {
      e.currentTarget.style.background = '#EF4444';
      e.currentTarget.style.boxShadow = '0 0 20px rgba(239,68,68,0.35)';
    } else if (variant === 'ghost') {
      e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
      e.currentTarget.style.background = 'transparent';
    }
  };

  if (Component === 'a' && href) {
    return (
      <motion.a
        href={href}
        style={baseStyle}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileTap={isDisabled ? {} : { scale: 0.96 }}
        {...props}
      >
        {loading && <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />}
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      style={baseStyle}
      className={className}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={isDisabled ? {} : { scale: 0.96 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
