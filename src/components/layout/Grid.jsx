/**
 * Grid — responsive 12-column grid layout.
 *
 * Props:
 *   cols: number of columns (default: 3)
 *   gap: gap size using spacing vars (default: 6 = 24px)
 *   tablet: columns on tablet
 *   mobile: columns on mobile
 */
export default function Grid({
  children,
  className = '',
  cols = 3,
  gap = 6,
  tablet,
  mobile,
  as: Component = 'div',
  ...props
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const gapMap = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };

  const desktop = gridCols[cols] || 'grid-cols-3';
  const tabletCols = tablet ? gridCols[tablet] || 'md:grid-cols-2' : 'md:grid-cols-2';
  const mobileCols = mobile ? gridCols[mobile] || 'grid-cols-1' : 'grid-cols-1';
  const gapClass = gapMap[gap] || 'gap-6';

  return (
    <Component
      className={`grid ${mobileCols} ${tabletCols} ${desktop} ${gapClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
