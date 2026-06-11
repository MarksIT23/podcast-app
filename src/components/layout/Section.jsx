/**
 * Section — full-width section wrapper with vertical spacing.
 *
 * Props:
 *   padding: vertical padding (default: 'section' = py-20)
 *   background: optional bg class
 *   id: optional section ID for anchor links
 *   container: wraps children in Container (default: true)
 */
import Container from './Container';

const paddingMap = {
  none: 'py-0',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  section: 'py-16 md:py-20 lg:py-24',
  lg: 'py-20 md:py-28 lg:py-32',
  xl: 'py-24 md:py-36 lg:py-40',
};

export default function Section({
  children,
  className = '',
  padding = 'section',
  background,
  id,
  container = true,
  ...props
}) {
  const paddingClass = paddingMap[padding] || paddingMap.section;

  return (
    <section
      id={id}
      className={`${paddingClass} ${background || ''} ${className}`}
      {...props}
    >
      {container ? <Container>{children}</Container> : children}
    </section>
  );
}
