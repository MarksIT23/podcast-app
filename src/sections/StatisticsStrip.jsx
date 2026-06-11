import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mic, Headphones, BarChart3, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  {
    icon: Mic,
    label: 'Podcasts Available',
    value: 1000,
    display: '1K+',
    color: '#1DB954',
    glow: 'rgba(29,185,84,0.3)',
  },
  {
    icon: Headphones,
    label: 'Episodes Indexed',
    value: 50000,
    display: '50K+',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: BarChart3,
    label: 'Monthly Plays',
    value: 500,
    display: '500K+',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    icon: Sparkles,
    label: 'AI Highlights Created',
    value: 10,
    display: '10K+',
    color: '#F97316',
    glow: 'rgba(249,115,22,0.3)',
  },
];

export default function StatisticsStrip() {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        gsap.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.5)',
            delay: i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );

        // Number counter animation
        const numEl = card.querySelector('.stat-number');
        if (numEl) {
          const target = stats[i].value;
          let obj = { val: 0 };
          ScrollTrigger.create({
            trigger: card,
            start: 'top 88%',
            onEnter: () => {
              gsap.to(obj, {
                val: target,
                duration: 1.8,
                ease: 'power2.out',
                onUpdate: () => {
                  const v = Math.round(obj.val);
                  numEl.textContent = v >= 1000
                    ? `${(v / 1000).toFixed(0)}K+`
                    : `${v}+`;
                },
                onComplete: () => {
                  numEl.textContent = stats[i].display;
                },
              });
            },
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      style={{ padding: '0 0 80px 0' }}
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            ref={(el) => (cardRefs.current[i] = el)}
            className="group relative overflow-hidden"
            style={{
              background: '#181818',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '24px',
              transition: 'all 0.3s ease',
              cursor: 'default',
              opacity: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1f1f1f';
              e.currentTarget.style.borderColor = `${stat.color}40`;
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 20px 50px ${stat.glow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#181818';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Glow spot */}
            <div
              className="absolute top-0 left-0 w-24 h-24 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${stat.glow} 0%, transparent 70%)`,
                filter: 'blur(20px)',
                opacity: 0.6,
              }}
            />

            <div
              className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
              style={{
                background: `${stat.color}15`,
                border: `1px solid ${stat.color}25`,
              }}
            >
              <Icon size={22} style={{ color: stat.color }} />
            </div>

            <p
              className="stat-number font-black mb-1"
              style={{
                color: stat.color,
                fontSize: '2rem',
                fontFamily: 'Poppins, sans-serif',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              0+
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}
            >
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
