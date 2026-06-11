import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, MoreHorizontal, Search } from 'lucide-react';
import { Container } from '../components/layout';
import { fetchPublicPodcasts } from '../services/public';

gsap.registerPlugin(ScrollTrigger);

const categoryColors = {
  Technology: { bg: 'rgba(29,185,84,0.15)', border: 'rgba(29,185,84,0.3)', text: '#1DB954' },
  Science:     { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#60A5FA' },
  Business:    { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', text: '#FB923C' },
  Entertainment:{ bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', text: '#F472B6' },
  Education:   { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.3)', text: '#FDE047' },
  Health:      { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', text: '#A78BFA' },
};

const cardGradients = [
  'linear-gradient(135deg, rgba(29,185,84,0.2) 0%, rgba(59,130,246,0.1) 100%)',
  'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.1) 100%)',
  'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(236,72,153,0.1) 100%)',
  'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(139,92,246,0.1) 100%)',
  'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(249,115,22,0.1) 100%)',
  'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 100%)',
];



function PodcastCard({ podcast, gradient, index }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const catStyle = categoryColors[podcast.categories?.[0]?.name] || categoryColors.Technology;
  const [imgError, setImgError] = useState(false);
  const eps = podcast?.episodes ?? podcast?.episodeCount ?? podcast?.feedEpisodes ?? 0;

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/podcast/${podcast.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/podcast/${podcast.id}`); } }}
      tabIndex={0}
      role="button"
      aria-label={`View ${podcast.title}`}
      className="group relative overflow-hidden"
      style={{
        background: '#181818',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#282828';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#181818';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Album art */}
      <div
        className="relative mb-5 flex items-center justify-center"
        style={{
          height: '160px',
          borderRadius: '12px',
          background: gradient,
          overflow: 'hidden',
        }}
      >
        {podcast.coverImage && !imgError ? (
          <img
            src={podcast.coverImage}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span style={{ fontSize: '3.5rem' }} aria-hidden="true">🎙️</span>
        )}

        {/* Play button — reveals on hover */}
        <div
          className="absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: '#1DB954',
            boxShadow: '0 8px 24px rgba(29,185,84,0.5)',
            transform: 'translateY(4px)',
            opacity: 0,
          }}
          ref={(el) => {
            if (!el) return;
            el.parentElement?.parentElement?.addEventListener('mouseenter', () => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            });
            el.parentElement?.parentElement?.addEventListener('mouseleave', () => {
              el.style.opacity = '0';
              el.style.transform = 'translateY(4px)';
            });
          }}
          aria-hidden="true"
        >
          <Play size={20} fill="black" color="black" />
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-3">
          <h3
            className="font-bold mb-1 truncate"
            style={{ color: '#fff', fontSize: '0.95rem', fontFamily: 'DM Sans, sans-serif' }}
          >
            {podcast.title}
          </h3>
          <p
            className="text-sm truncate"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {podcast.host}
          </p>
        </div>
        <button
          className="p-1 rounded-lg flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          aria-label="More options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between mt-3">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: catStyle.bg,
            border: `1px solid ${catStyle.border}`,
            color: catStyle.text,
          }}
        >
                    {podcast.categories?.[0]?.name || podcast.categories?.[0]}
        </span>
        <div className="flex items-center gap-3">
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>
            {eps} eps
          </span>
        </div>
      </div>
    </div>
  );
}

const categories = ['All', 'Technology', 'Science', 'Business', 'Entertainment', 'Education', 'Health'];

export default function FeaturedPodcasts() {
  const [allPodcasts, setAllPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    fetchPublicPodcasts({ pageSize: 50 })
      .then((res) => setAllPodcasts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [loading]);

  const filtered = allPodcasts.filter((p) => {
    const matchCategory = activeCategory === 'All' || p.categories?.some(c => c.name === activeCategory);
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.host || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (!loading && allPodcasts.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="podcasts"
      style={{ padding: '80px 0' }}
    >
      <Container>
        {/* Header */}
        <div ref={headerRef} style={{ opacity: loading ? 0 : 1 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p
                className="font-semibold mb-3"
                style={{
                  color: '#1DB954',
                  fontSize: '0.72rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                ✦ Curated For You
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
                Featured <span style={{ color: '#1DB954' }}>Podcasts</span>
              </h2>
              <p
                className="mt-3 max-w-lg"
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7 }}
              >
                Curated picks with AI-powered insights, smart recommendations, and detailed analytics.
              </p>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-7" role="tablist" aria-label="Filter by category">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  role="tab"
                  aria-selected={isActive}
                  className="text-sm font-semibold transition-all duration-200"
                  style={{
                    padding: '7px 20px',
                    borderRadius: '999px',
                    background: isActive ? '#fff' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#000' : 'rgba(255,255,255,0.6)',
                    border: isActive ? '1px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                    transform: isActive ? 'scale(1.04)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    }
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div
            className="relative mb-10"
            style={{ maxWidth: '480px' }}
          >
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search podcasts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm focus:outline-none"
              style={{
                background: '#282828',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                padding: '11px 20px 11px 40px',
                color: '#fff',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1DB954';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,185,84,0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label="Search podcasts by title or host"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20" role="status">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-[#1DB954] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((podcast, i) => (
              <PodcastCard
                key={podcast.id || i}
                podcast={podcast}
                index={i}
                gradient={cardGradients[i % cardGradients.length]}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20" role="status">
            <p className="text-2xl mb-3" aria-hidden="true">🎙️</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem' }}>
              No podcasts match your search.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="mt-4 text-sm font-semibold transition-colors duration-200"
              style={{ color: '#1DB954' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#1ED760'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#1DB954'; }}
            >
              Clear filters
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
