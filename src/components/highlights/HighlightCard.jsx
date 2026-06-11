import { Play, Clock, Tag, Bookmark, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Badge from '../ui/Badge';

const typeConfig = {
  key_point:   { label: 'Key Point',   color: '#3B82F6', emoji: '🎯' },
  quote:       { label: 'Quote',       color: '#8B5CF6', emoji: '💬' },
  summary:     { label: 'Summary',     color: '#1DB954', emoji: '📝' },
  sentiment_shift: { label: 'Sentiment', color: '#F97316', emoji: '📊' },
};

const confidenceBadge = (score) => {
  if (score >= 0.7) return { variant: 'success', label: 'High' };
  if (score >= 0.4) return { variant: 'warning', label: 'Medium' };
  return { variant: 'neutral', label: 'Low' };
};

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')} min`;
}

export default function HighlightCard({
  highlight,
  variant = 'compact',
  onPlay,
  onSave,
  saved = false,
}) {
  const {
    id,
    title = 'Highlight',
    description = '',
    startTime = 0,
    endTime = 0,
    confidence = 0,
    tags = [],
    episode,
    collection,
    segments = [],
  } = highlight || {};

  const [isSaved, setIsSaved] = useState(saved);
  const duration = endTime - startTime;
  const conf = confidenceBadge(confidence);
  const typeInfo = segments[0] ? typeConfig[segments[0].label] || typeConfig.key_point : typeConfig.key_point;

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSave) onSave(id, !isSaved);
  };

  const handlePlay = () => {
    if (onPlay) onPlay(highlight);
  };

  const parsedTags = typeof tags === 'string' ? JSON.parse(tags || '[]') : tags;

  if (variant === 'compact') {
    return (
      <div
        className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
        style={{
          background: '#181818',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: typeInfo.color, width: '100%' }} />

        <div style={{ padding: '16px 18px 18px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>{typeInfo.emoji}</span>
              <Badge variant={conf.variant} size="sm">{conf.label}</Badge>
            </div>
            <button
              onClick={handleSave}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? typeInfo.color : 'rgba(255,255,255,0.4)',
                padding: 4, borderRadius: 6, transition: 'color 0.2s',
              }}
            >
              <Bookmark size={16} fill={isSaved ? typeInfo.color : 'none'} />
            </button>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>
            {title}
          </h3>

          {/* Description */}
          {variant === 'compact' && description && (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {description}
            </p>
          )}

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
            {duration > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> {formatDuration(duration)}
              </span>
            )}
            {episode?.title && (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                {episode.title}
              </span>
            )}
          </div>

          {/* Tags */}
          {parsedTags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {parsedTags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem',
                    background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Play button overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            <button
              onClick={handlePlay}
              style={{
                width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: typeInfo.color, color: '#000', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'transform 0.2s',
              }}
            >
              <Play size={22} fill="#000" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant
  return (
    <div
      className="rounded-xl transition-all duration-300"
      style={{
        background: '#181818',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>{typeInfo.emoji}</span>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', margin: 0 }}>
              {title}
            </h2>
            {episode?.title && (
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>
                From: {episode.title}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge variant={conf.variant} size="sm">{conf.label}</Badge>
          <button
            onClick={handleSave}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? typeInfo.color : 'rgba(255,255,255,0.4)',
              padding: 6, borderRadius: 6, transition: 'color 0.2s',
            }}
          >
            <Bookmark size={18} fill={isSaved ? typeInfo.color : 'none'} />
          </button>
        </div>
      </div>

      {description && (
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 16 }}>
          {description}
        </p>
      )}

      {/* Episode context */}
      {episode && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
            borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Clock size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                {formatDuration(duration)}
              </span>
            </div>
          </div>
          <button
            onClick={handlePlay}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              background: typeInfo.color, color: '#000', fontWeight: 600, fontSize: '0.85rem',
            }}
          >
            <Play size={16} fill="#000" /> Play Clip
          </button>
        </div>
      )}

      {/* Segments list */}
      {segments.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 500 }}>
            Segments ({segments.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {segments.map((seg, i) => {
              const segType = typeConfig[seg.label] || typeConfig.key_point;
              return (
                <div
                  key={seg.id || i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    borderRadius: 8, background: 'rgba(255,255,255,0.03)', fontSize: '0.82rem',
                  }}
                >
                  <span>{segType.emoji}</span>
                  <span style={{ color: segType.color, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {segType.label}
                  </span>
                  {seg.text && (
                    <span style={{ color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {seg.text}
                    </span>
                  )}
                  <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                    {formatDuration(seg.endTime - seg.startTime)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags */}
      {parsedTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {parsedTags.map((tag, i) => (
            <span
              key={i}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: '0.72rem',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Listen to full episode */}
      {episode && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <a
            href={`/episode/${episode.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem',
              color: typeInfo.color, textDecoration: 'none', fontWeight: 500,
            }}
          >
            Listen to full episode <ChevronRight size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
