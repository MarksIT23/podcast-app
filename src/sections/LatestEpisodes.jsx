import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container } from '../components/layout';
import { Play, Clock, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { fetchLatestEpisodes } from '../services/public';
import { useAudio } from '../components/AudioPlayer';

gsap.registerPlugin(ScrollTrigger);

const categoryColors = {
  Technology: { bg: 'rgba(29,185,84,0.12)', text: '#1DB954', border: 'rgba(29,185,84,0.25)' },
  Science:    { bg: 'rgba(59,130,246,0.12)', text: '#60A5FA', border: 'rgba(59,130,246,0.25)' },
  Business:   { bg: 'rgba(249,115,22,0.12)', text: '#FB923C', border: 'rgba(249,115,22,0.25)' },
  Entertainment:{ bg: 'rgba(236,72,153,0.12)', text: '#F472B6', border: 'rgba(236,72,153,0.25)' },
};

export default function LatestEpisodes() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const rowRefs = useRef([]);
  const [episodes, setEpisodes] = useState([]);
  const { play } = useAudio();

  useEffect(() => {
    fetchLatestEpisodes({ pageSize: 10 })
      .then((res) => setEpisodes(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (episodes.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 85%' },
        }
      );

      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        gsap.fromTo(
          row,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0,
            duration: 0.55,
            ease: 'power3.out',
            delay: i * 0.08,
            scrollTrigger: { trigger: row, start: 'top 90%' },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [episodes]);

  if (episodes.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="discover"
      style={{ padding: '80px 0' }}
      aria-label="Latest episodes"
    >
      <Container>
        {/* Header */}
        <div ref={headerRef} style={{ opacity: 0, marginBottom: '48px' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p
                style={{
                  color: '#FB923C',
                  fontSize: '0.72rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                ✦ Fresh Releases
              </p>
              <h2
                className="font-black"
                style={{
                  color: '#fff',
                  fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                  fontFamily: 'Poppins, sans-serif',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                }}
              >
                Latest <span style={{ color: '#FB923C' }}>Episodes</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginTop: '12px' }}>
                Stay up to date with the newest releases across all your favorite podcasts.
              </p>
            </div>
            <a
              href="#"
              className="flex items-center gap-1.5 text-sm font-semibold flex-shrink-0 transition-all duration-200"
              style={{ color: '#FB923C' }}
              onMouseEnter={(e) => { e.currentTarget.style.gap = '10px'; }}
              onMouseLeave={(e) => { e.currentTarget.style.gap = '6px'; }}
            >
              View All <ChevronRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Episode list */}
        <div className="space-y-3" role="feed" aria-label="Episode list">
          {episodes.map((ep, i) => {
            const catStyle = categoryColors[ep.category] || categoryColors.Technology;
            return (
              <div
                key={ep.id || i}
                ref={(el) => (rowRefs.current[i] = el)}
                className="group flex items-center gap-5 md:gap-6"
                style={{
                  background: '#181818',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  opacity: 0,
                }}
                tabIndex={0}
                role="article"
                aria-label={`${ep.title} by ${ep.host || ep.podcastTitle}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#282828';
                  e.currentTarget.style.borderColor = `${ep.category === 'Business' ? '#FB923C' : '#1DB954'}25`;
                  e.currentTarget.style.transform = 'translateX(6px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#181818';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Rank number */}
                <span
                  className="hidden md:block font-black w-6 text-center flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.9rem', fontFamily: 'Poppins' }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>

                {/* Cover art */}
                <div
                  className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden"
                  style={{
                    background: `${catStyle.text}15`,
                    border: `1px solid ${catStyle.text}20`,
                  }}
                  aria-hidden="true"
                >
                  {ep.coverImage ? (
                    <img src={ep.coverImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎙️</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3
                      className="font-semibold truncate transition-colors duration-200"
                      style={{ color: '#fff', fontSize: '0.95rem' }}
                    >
                      {ep.title}
                    </h3>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: catStyle.bg,
                        color: catStyle.text,
                        border: `1px solid ${catStyle.border}`,
                      }}
                    >
                      {ep.category}
                    </span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {ep.host || ep.podcastTitle || 'Unknown Host'}
                  </p>
                  <div
                    className="flex items-center gap-4 text-xs"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Calendar size={11} aria-hidden="true" /> {ep.date || 'TBD'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} aria-hidden="true" /> {ep.duration ? `${Math.floor(Number(ep.duration) / 60)} min` : '?'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp size={11} aria-hidden="true" /> {ep.plays || '0'}
                    </span>
                  </div>
                </div>

                {/* Play button */}
                <button
                  onClick={(e) => { e.stopPropagation(); play(ep); }}
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    background: catStyle.text,
                    boxShadow: `0 0 20px ${catStyle.text}40`,
                    transform: 'scale(0.85)',
                    opacity: 0,
                    color: '#000',
                  }}
                  ref={(el) => {
                    if (!el) return;
                    const row = el.closest('[role="article"]');
                    row?.addEventListener('mouseenter', () => {
                      el.style.transform = 'scale(1)';
                      el.style.opacity = '1';
                    });
                    row?.addEventListener('mouseleave', () => {
                      el.style.transform = 'scale(0.85)';
                      el.style.opacity = '0';
                    });
                  }}
                  aria-label={`Play ${ep.title}`}
                >
                  <Play size={18} fill="black" color="black" />
                </button>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
