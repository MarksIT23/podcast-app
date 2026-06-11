import { Play, Clock, Headphones } from 'lucide-react';
import { useState } from 'react';

const categoryStyles = {
  Technology:    { bg: 'rgba(29,185,84,0.12)', text: '#1DB954', border: 'rgba(29,185,84,0.25)' },
  Science:       { bg: 'rgba(59,130,246,0.12)', text: '#60A5FA', border: 'rgba(59,130,246,0.25)' },
  Business:      { bg: 'rgba(249,115,22,0.12)', text: '#FB923C', border: 'rgba(249,115,22,0.25)' },
  Entertainment: { bg: 'rgba(236,72,153,0.12)', text: '#F472B6', border: 'rgba(236,72,153,0.25)' },
  Education:     { bg: 'rgba(234,179,8,0.12)',  text: '#FDE047', border: 'rgba(234,179,8,0.25)' },
  Health:        { bg: 'rgba(139,92,246,0.12)', text: '#A78BFA', border: 'rgba(139,92,246,0.25)' },
};

const cardGradients = {
  Technology:    'linear-gradient(135deg, rgba(29,185,84,0.2) 0%, rgba(59,130,246,0.1) 100%)',
  Science:       'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.1) 100%)',
  Business:      'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(236,72,153,0.1) 100%)',
  Entertainment: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(139,92,246,0.1) 100%)',
  Education:     'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(249,115,22,0.1) 100%)',
  Health:        'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 100%)',
};

export default function PodcastCard({ podcast }) {
  const {
    title = 'Featured Podcast',
    host = 'Podcast Host',
    category = 'Technology',
    duration = '45 min',
    episodes = '128 eps',
    coverImage = '',
  } = podcast || {};
  const [imgError, setImgError] = useState(false);

  const catStyle = categoryStyles[category] || categoryStyles.Technology;
  const gradient = cardGradients[category] || cardGradients.Technology;

  return (
    <div
      className="group relative overflow-hidden"
      style={{
        background: '#181818',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}
      tabIndex={0}
      role="article"
      aria-label={`${title} by ${host}, ${category}`}
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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
      }}
    >
      {/* Album art */}
      <div
        className="relative mb-5 flex items-center justify-center overflow-hidden"
        style={{ height: '160px', borderRadius: '12px', background: gradient }}
      >
        {coverImage && !imgError ? (
          <img
            src={coverImage}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span style={{ fontSize: '3.2rem' }} aria-hidden="true">🎙️</span>
        )}

        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', opacity: 0, transition: 'opacity 0.25s ease' }}
          ref={(el) => {
            if (!el) return;
            const card = el.parentElement?.parentElement;
            card?.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
            card?.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
          }}
          aria-hidden="true"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: '#1DB954',
              boxShadow: '0 0 24px rgba(29,185,84,0.6)',
              transform: 'scale(0.85)',
              transition: 'transform 0.2s ease',
            }}
            ref={(el) => {
              if (!el) return;
              const card = el.parentElement?.parentElement?.parentElement;
              card?.addEventListener('mouseenter', () => { el.style.transform = 'scale(1)'; });
              card?.addEventListener('mouseleave', () => { el.style.transform = 'scale(0.85)'; });
            }}
          >
            <Play size={18} fill="black" color="black" />
          </div>
        </div>

        {/* AI badge */}
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full"
          style={{
            background: 'rgba(29,185,84,0.2)',
            border: '1px solid rgba(29,185,84,0.35)',
            color: '#1DB954',
            backdropFilter: 'blur(8px)',
          }}
        >
          ✦ AI
        </div>

        {/* Duration */}
        <div
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-xs font-medium"
          style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '999px',
            padding: '4px 10px',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <Clock size={10} aria-hidden="true" />
          {duration}
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-3">
          <h3
            className="font-bold mb-1 truncate transition-colors duration-200"
            style={{ color: '#fff', fontSize: '0.95rem', lineHeight: 1.3 }}
          >
            {title}
          </h3>
          <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {host}
          </p>
        </div>
      </div>

      {/* Footer row */}
      <div
        className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: catStyle.bg, border: `1px solid ${catStyle.border}`, color: catStyle.text }}
        >
          {category}
        </span>
        <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
          <Headphones size={11} aria-hidden="true" />
          {episodes}
        </div>
      </div>
    </div>
  );
}
