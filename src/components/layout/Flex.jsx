/**
 * Flex — flexbox container with common props.
 *
 * Props:
 *   direction: row (default) | col | row-reverse | col-reverse
 *   align: items alignment (center, start, end, stretch)
 *   justify: content alignment (center, between, around, evenly)
 *   gap: gap size (2, 4, 6, 8, 10, 12)
 *   wrap: wrap (default) | nowrap
 */
export default function Flex({
  children,
  className = '',
  direction = 'row',
  align,
  justify,
  gap,
  wrap = 'wrap',
  as: Component = 'div',
  ...props
}) {
  const directions = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const alignItems = {
    center: 'items-center',
    start: 'items-start',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyMap = {
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
    end: 'justify-end',
  };

  const gapMap = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };

  const classes = [
    'flex',
    directions[direction] || 'flex-row',
    align ? alignItems[align] || '' : '',
    justify ? justifyMap[justify] || '' : '',
    gap ? gapMap[gap] || '' : '',
    wrap === 'nowrap' ? 'flex-nowrap' : 'flex-wrap',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
