/**
 * Container — centered, max-width wrapper with responsive padding.
 */
export default function Container({
  children,
  className = '',
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`mx-auto w-full max-w-[var(--max-width)] px-4 md:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
