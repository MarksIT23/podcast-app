import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container } from '../components/layout';
import { Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const platforms = [
  { name: 'Spotify', icon: '🎵', color: '#1DB954', desc: 'Full sync' },
  { name: 'Apple Podcasts', icon: '🎙️', color: '#FC3C8F', desc: 'Import & export' },
  { name: 'YouTube', icon: '▶️', color: '#FF0000', desc: 'Video clips' },
  { name: 'RSS Feed', icon: '📡', color: '#F97316', desc: 'Auto-publish' },
  { name: 'Google Podcasts', icon: '🔊', color: '#4285F4', desc: 'Discovery' },
  { name: 'Amazon Music', icon: '🎧', color: '#FF9900', desc: 'Audience reach' },
];

export default function Integrations() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 85%' },
        }
      );

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 24, scale: 0.92 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.5,
            ease: 'back.out(1.4)',
            delay: i * 0.07,
            scrollTrigger: { trigger: card, start: 'top 90%' },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ padding: '80px 0' }}>
      <Container>
        {/* Header */}
        <div ref={headerRef} className="text-center mb-14" style={{ opacity: 0 }}>
          <p
            style={{
              color: '#1DB954',
              fontSize: '0.72rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            ✦ Seamless Connectivity
          </p>
          <h2
            className="font-black mb-4"
            style={{
              color: '#fff',
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            Platform <span style={{ color: '#1DB954' }}>Integrations</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
            Seamlessly connected to 6+ major podcast platforms. Import, sync, and manage all your content in one place.
          </p>
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {platforms.map((platform, i) => (
            <div
              key={platform.name}
              ref={(el) => (cardRefs.current[i] = el)}
              className="group flex flex-col items-center text-center cursor-pointer"
              style={{
                background: '#181818',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                padding: '28px 16px',
                transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1f1f1f';
                e.currentTarget.style.borderColor = `${platform.color}35`;
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 20px 50px ${platform.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#181818';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Icon container */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  background: `${platform.color}15`,
                  border: `1px solid ${platform.color}25`,
                }}
                aria-hidden="true"
              >
                {platform.icon}
              </div>

              <p
                className="font-semibold mb-1"
                style={{ color: '#fff', fontSize: '0.8rem' }}
              >
                {platform.name}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>
                {platform.desc}
              </p>

              {/* Connected badge */}
              <div
                className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: platform.color }}
              >
                <Check size={11} />
                Connected
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <div
            className="inline-flex items-center gap-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '999px',
              padding: '14px 32px',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
              More integrations coming soon
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(29,185,84,0.15)',
                color: '#1DB954',
                border: '1px solid rgba(29,185,84,0.25)',
              }}
            >
              Beta
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
