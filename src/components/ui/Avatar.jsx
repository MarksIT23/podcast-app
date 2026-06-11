/**
 * Avatar — displays user image or initials fallback.
 * Props: src, name, size (sm/md/lg/xl), className
 */
const sizeStyles = {
  sm: 'w-6 h-6 text-caption',
  md: 'w-8 h-8 text-small',
  lg: 'w-10 h-10 text-body',
  xl: 'w-14 h-14 text-card',
};

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizeStyles[size] || sizeStyles.md} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeStyles[size] || sizeStyles.md} rounded-full bg-[var(--color-accent-purple)]/20 flex items-center justify-center font-semibold text-[var(--color-accent-purple-light)] shrink-0 ${className}`}
      aria-label={name || 'Avatar'}
      role="img"
    >
      {initials || '?'}
    </div>
  );
}
