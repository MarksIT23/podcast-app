import { motion } from 'framer-motion';

/**
 * Card component with glass effect, shadows, and hover lift.
 *
 * Variants:
 *   default — dark surface with border
 *   glass   — glassmorphism with backdrop-blur
 *   elevated — deeper shadow, more prominent
 */

const variantStyles = {
  default:
    'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)]',
  glass:
    'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)] shadow-[var(--shadow-card)]',
  elevated:
    'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card-hover)]',
};

export default function Card({
  children,
  variant = 'default',
  className = '',
  hover = true,
  padding = true,
  ...props
}) {
  const baseStyles = 'rounded-[var(--radius-xl)] transition-all duration-300';
  const paddingStyles = padding ? 'p-5 md:p-6' : '';
  const hoverStyles = hover
    ? 'hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]'
    : '';

  const classes = `${baseStyles} ${variantStyles[variant] || variantStyles.default} ${paddingStyles} ${hoverStyles} ${className}`;

  return (
    <motion.div
      className={classes}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}
