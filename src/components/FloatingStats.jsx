import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, Headphones, BarChart3, Sparkles } from 'lucide-react';

const stats = [
  { icon: Mic, label: 'Podcasts Available', value: 1000, suffix: '+', color: 'var(--color-accent-purple)' },
  { icon: Headphones, label: 'Episodes Indexed', value: 50000, suffix: '+', color: 'var(--color-accent-blue)' },
  { icon: BarChart3, label: 'Monthly Plays', value: 500, suffix: 'K+', color: 'var(--color-accent-orange)' },
  { icon: Sparkles, label: 'AI Highlights', value: 10, suffix: 'K+', color: 'var(--color-accent-purple-light)' },
];

function AnimatedCounter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    let animationId;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isInView, target, duration]);

  const display = target >= 1000
    ? `${(count / 1000).toFixed(count >= 1000 ? 0 : 1)}`
    : count.toString();

  return <span ref={ref}>{display}{suffix}</span>;
}

export default function FloatingStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.15, duration: 0.6, ease: 'easeOut' }}
            className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
          >
            {/* Floating animation */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4 + index * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.3,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>

              <p className="text-display font-bold mb-1" style={{ color: stat.color }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>

              <p className="text-small text-[var(--text-secondary)]">
                {stat.label}
              </p>
            </motion.div>

            {/* Glow on hover */}
            <div
              className="absolute inset-0 rounded-[var(--radius-xl)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: `0 0 30px ${stat.color}20`, inset: '0 0 30px rgba(0,0,0,0.2)' }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
