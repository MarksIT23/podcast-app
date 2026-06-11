import { motion } from 'framer-motion';

/* ============================================
   Reusable Framer Motion Animation Variants
   ============================================ */

/** Fade in from opacity 0 to 1 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

/** Slide up with fade */
export const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

/** Slide up with spring physics */
export const slideUpSpring = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20, mass: 1 },
  },
};

/** Scale in from smaller size */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/** Slide in from left */
export const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/** Slide in from right */
export const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/** Continuous floating motion */
export const floatAnimation = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Glow pulse effect */
export const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(139, 61, 255, 0.4)',
      '0 0 30px rgba(139, 61, 255, 0.6)',
      '0 0 20px rgba(139, 61, 255, 0.4)',
    ],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Stagger container — children animate in sequence */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/** Stagger item — used as child of staggerContainer */
export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/** Page transition — wrap route pages */
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

/** Hover scale effect for interactive elements */
export const hoverScale = {
  whileHover: { scale: 1.03, transition: { duration: 0.2 } },
  whileTap: { scale: 0.97 },
};

/** Counter animation — animates a number from 0 to target */
export const counterAnimation = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

/* ============================================
   Motion Component Helpers
   ============================================ */

/** Creates a motion.div with a fade-in + slide-up animation */
export const MotionSlideUp = ({ children, delay = 0, className, ...props }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={{
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: 'easeOut' } },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

/** Creates a staggered list where children animate one by one */
export const MotionStaggerList = ({ children, className, ...props }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={staggerContainer}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

/** A single item to be used inside MotionStaggerList */
export const MotionStaggerItem = ({ children, className, ...props }) => (
  <motion.div variants={staggerItem} className={className} {...props}>
    {children}
  </motion.div>
);

export default {
  fadeIn,
  slideUp,
  slideUpSpring,
  scaleIn,
  slideInLeft,
  slideInRight,
  floatAnimation,
  glowPulse,
  staggerContainer,
  staggerItem,
  pageTransition,
  hoverScale,
  counterAnimation,
  MotionSlideUp,
  MotionStaggerList,
  MotionStaggerItem,
};
