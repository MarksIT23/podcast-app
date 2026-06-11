/**
 * Badge — Spotify-dark accent pill labels.
 * Variants: green (default), purple, blue, orange, pink, yellow, neutral, success, warning, danger
 */

const variantMap = {
  green:   { bg: 'rgba(29,185,84,0.15)',   text: '#1DB954',  border: 'rgba(29,185,84,0.3)' },
  purple:  { bg: 'rgba(139,92,246,0.15)',  text: '#A78BFA',  border: 'rgba(139,92,246,0.3)' },
  blue:    { bg: 'rgba(59,130,246,0.15)',  text: '#60A5FA',  border: 'rgba(59,130,246,0.3)' },
  orange:  { bg: 'rgba(249,115,22,0.15)', text: '#FB923C',  border: 'rgba(249,115,22,0.3)' },
  pink:    { bg: 'rgba(236,72,153,0.15)', text: '#F472B6',  border: 'rgba(236,72,153,0.3)' },
  yellow:  { bg: 'rgba(234,179,8,0.15)',  text: '#FDE047',  border: 'rgba(234,179,8,0.3)' },
  success: { bg: 'rgba(29,185,84,0.15)',   text: '#1DB954',  border: 'rgba(29,185,84,0.3)' },
  warning: { bg: 'rgba(234,179,8,0.15)',  text: '#FDE047',  border: 'rgba(234,179,8,0.3)' },
  danger:  { bg: 'rgba(239,68,68,0.15)',  text: '#F87171',  border: 'rgba(239,68,68,0.3)' },
  neutral: { bg: 'rgba(255,255,255,0.07)',text: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.12)' },
};

const dotColors = {
  green: '#1DB954', purple: '#A78BFA', blue: '#60A5FA',
  orange: '#FB923C', pink: '#F472B6', yellow: '#FDE047',
  success: '#1DB954', warning: '#FDE047', danger: '#F87171',
  neutral: 'rgba(255,255,255,0.4)',
};

const sizeStyles = {
  sm: { padding: '3px 10px', fontSize: '0.68rem' },
  md: { padding: '5px 12px', fontSize: '0.78rem' },
  lg: { padding: '7px 16px', fontSize: '0.875rem' },
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
  style: extraStyle = {},
  ...props
}) {
  const v = variantMap[variant] || variantMap.neutral;
  const s = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${className}`}
      style={{
        background: v.bg,
        color: v.text,
        border: `1px solid ${v.border}`,
        padding: s.padding,
        fontSize: s.fontSize,
        letterSpacing: '0.02em',
        lineHeight: 1.4,
        ...extraStyle,
      }}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColors[variant] || dotColors.neutral }}
        />
      )}
      {children}
    </span>
  );
}
