import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Clock, Headphones, ArrowLeft, Calendar, Shuffle, Plus, Check, Disc, ListMusic } from 'lucide-react';
import { fetchPodcastById, fetchEpisodes, fetchSavedPodcasts, savePodcast, unsavePodcast, fetchPlaylists, addEpisodeToPlaylist } from '../services/data';
import { useAudio } from '../components/AudioPlayer';
import { Button } from '../components/ui';

gsap.registerPlugin(ScrollTrigger);

const categoryColors = {
  Technology: { bg: 'rgba(29,185,84,0.15)', text: '#1DB954', border: 'rgba(29,185,84,0.3)', accent: '#1DB954', gradient: 'from-emerald-500/20' },
  Science: { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA', border: 'rgba(59,130,246,0.3)', accent: '#60A5FA', gradient: 'from-blue-500/20' },
  Business: { bg: 'rgba(249,115,22,0.15)', text: '#FB923C', border: 'rgba(249,115,22,0.3)', accent: '#FB923C', gradient: 'from-orange-500/20' },
  Entertainment: { bg: 'rgba(236,72,153,0.15)', text: '#F472B6', border: 'rgba(236,72,153,0.3)', accent: '#F472B6', gradient: 'from-pink-500/20' },
  Education: { bg: 'rgba(234,179,8,0.15)', text: '#FDE047', border: 'rgba(234,179,8,0.3)', accent: '#FDE047', gradient: 'from-yellow-500/20' },
  Health: { bg: 'rgba(139,92,246,0.15)', text: '#A78BFA', border: 'rgba(139,92,246,0.3)', accent: '#A78BFA', gradient: 'from-purple-500/20' },
};

export default function PodcastDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [pickerEpisodeId, setPickerEpisodeId] = useState(null);
  const { play } = useAudio();

  const openPlaylistPicker = async (episodeId) => {
    try {
      const res = await fetchPlaylists();
      setPlaylists(res.data || []);
    } catch {
      setPlaylists([]);
    }
    setPickerEpisodeId(episodeId);
    setShowPlaylistPicker(true);
  };

  const heroRef = useRef(null);
  const coverRef = useRef(null);
  const infoRef = useRef(null);
  const actionsRef = useRef(null);
  const statsRef = useRef(null);
  const sectionRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchPodcastById(id),
      fetchEpisodes({ podcastId: id, pageSize: 100 }),
      fetchSavedPodcasts(),
    ]).then(([podRes, epRes, savedRes]) => {
      setPodcast(podRes.data);
      setEpisodes(epRes.data);
      const savedIds = new Set((savedRes.data || []).map(p => p.id));
      setIsFollowing(savedIds.has(podRes.data.id));
      setLoading(false);
    }).catch(() => {
      navigate('/');
    });
  }, [id, navigate]);

  // GSAP animations
  useEffect(() => {
    if (loading || !podcast) return;

    const ctx = gsap.context(() => {
      // Hero entrance — stagger: cover first, then info, then actions, then stats
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(coverRef.current,
        { scale: 0.6, opacity: 0, rotation: -8 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
      );
      tl.fromTo(infoRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
        '-=0.3'
      );
      tl.fromTo(actionsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        '-=0.2'
      );
      tl.fromTo(statsRef.current.children,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
        '-=0.2'
      );

      // Cover float animation (gentle hover)
      gsap.to(coverRef.current, {
        y: -6,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1.5,
      });

      // Episode list stagger
      const items = listRef.current?.children;
      if (items && items.length > 0) {
        gsap.fromTo(items,
          { y: 24, opacity: 0, scale: 0.98 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Section header line expand
      const headerLine = sectionRef.current?.querySelector('.header-line');
      if (headerLine) {
        gsap.fromTo(headerLine,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [loading, podcast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--color-accent-purple)] border-t-transparent animate-spin" />
          <p className="text-caption text-[var(--text-tertiary)] animate-pulse">Loading podcast...</p>
        </div>
      </div>
    );
  }

  if (!podcast) return null;

  const catStyle = categoryColors[podcast.categories?.[0]?.name] || categoryColors.Technology;
  const gradient = `linear-gradient(160deg, ${catStyle.accent}15 0%, ${catStyle.accent}08 40%, transparent 70%)`;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero section */}
      <div ref={heroRef} className="relative overflow-hidden" style={{ background: gradient }}>
        {/* Decorative orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: catStyle.accent }} />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: catStyle.accent }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10 md:pb-14">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-8 w-fit"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back
          </button>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            {/* Cover image */}
            <div ref={coverRef} className="shrink-0 relative" style={{ opacity: 0 }}>
              <div
                className="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden ring-2 ring-white/5 shadow-2xl"
                style={{
                  boxShadow: `0 0 60px ${catStyle.accent}30, 0 25px 60px rgba(0,0,0,0.5)`,
                }}
              >
                <img
                  src={podcast.coverImage}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Glow ring */}
              <div
                className="absolute -inset-3 rounded-[2rem] opacity-40"
                style={{
                  background: `radial-gradient(circle, ${catStyle.accent}20 0%, transparent 70%)`,
                }}
              />
            </div>

            {/* Info */}
            <div ref={infoRef} className="flex-1 min-w-0 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}
                >
                  {podcast.categories?.[0]?.name}
                </span>
                {podcast.featured && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-purple)]/15 text-[var(--color-accent-purple-light)] border border-[var(--color-accent-purple)]/30">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-2 leading-tight">
                {podcast.title}
              </h1>
              <p className="text-base md:text-lg text-[var(--text-secondary)] mb-4">
                by <span className="text-[var(--text-primary)] font-medium">{podcast.host}</span>
              </p>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-6 max-w-xl mx-auto md:mx-0 line-clamp-3">
                {podcast.description}
              </p>

              {/* Actions */}
              <div ref={actionsRef} className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => episodes.length > 0 && play(episodes[0])}
                  disabled={episodes.length === 0}
                  className="gap-2"
                >
                  <Play size={16} fill="currentColor" />
                  Play Latest Episode
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="gap-2"
                  onClick={async () => {
                    if (isFollowing) {
                      await unsavePodcast(id);
                      setIsFollowing(false);
                    } else {
                      await savePodcast(id);
                      setIsFollowing(true);
                    }
                  }}
                >
                  {isFollowing ? <Check size={16} /> : <Plus size={16} />}
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>

              {/* Stats row */}
              <div ref={statsRef} className="flex flex-wrap items-center justify-center md:justify-start gap-5 md:gap-8 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${catStyle.accent}15` }}>
                    <Headphones size={15} style={{ color: catStyle.accent }} />
                  </div>
                  <div className="text-left">
                    <p className="text-[var(--text-primary)] font-semibold">{podcast.plays?.toLocaleString() || '0'}</p>
                    <p className="text-caption text-[var(--text-tertiary)]">plays</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${catStyle.accent}15` }}>
                    <Clock size={15} style={{ color: catStyle.accent }} />
                  </div>
                  <div className="text-left">
                    <p className="text-[var(--text-primary)] font-semibold">{episodes.length}</p>
                    <p className="text-caption text-[var(--text-tertiary)]">episodes</p>
                  </div>
                </div>
                {podcast.rating > 0 && (
                  <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${catStyle.accent}15` }}>
                      <span style={{ color: catStyle.accent }}>★</span>
                    </div>
                    <div className="text-left">
                      <p className="text-[var(--text-primary)] font-semibold">{podcast.rating}</p>
                      <p className="text-caption text-[var(--text-tertiary)]">rating</p>
                    </div>
                  </div>
                )}
                {podcast.language && (
                  <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${catStyle.accent}15` }}>
                      <span className="text-xs" style={{ color: catStyle.accent }}>A</span>
                    </div>
                    <div className="text-left">
                      <p className="text-[var(--text-primary)] font-semibold">{podcast.language}</p>
                      <p className="text-caption text-[var(--text-tertiary)]">language</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes section */}
      <div ref={sectionRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Episodes</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-tertiary)]">
              {episodes.length}
            </span>
            <div className="header-line h-0.5 w-20 rounded-full ml-2 origin-left" style={{ background: `linear-gradient(90deg, ${catStyle.accent}, transparent)` }} />
          </div>
          {episodes.length > 1 && (
            <button
              onClick={() => { /* shuffle play */ }}
              className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--color-accent-purple-light)] transition-colors"
            >
              <Shuffle size={14} />
              Shuffle Play
            </button>
          )}
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-16">
            <Disc size={48} className="mx-auto text-[var(--text-tertiary)]/30 mb-4" />
            <p className="text-sm text-[var(--text-tertiary)]">No episodes yet. Check back soon!</p>
          </div>
        ) : (
          <div ref={listRef} className="space-y-2">
            {episodes.map((ep, i) => (
              <div
                key={ep.id}
                className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-light)] transition-all duration-300 cursor-pointer"
                tabIndex={0}
                role="button"
                onClick={() => play(ep)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(ep); } }}
                aria-label={`Play ${ep.title}`}
              >
                {/* Episode number */}
                <div className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-[var(--text-tertiary)] group-hover:hidden">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div
                    className="hidden group-hover:flex w-8 h-8 rounded-lg items-center justify-center transition-all duration-300"
                    style={{ background: catStyle.accent }}
                  >
                    <Play size={13} className="text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>

                {/* Mobile play button */}
                <div
                  className="sm:hidden w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-accent-purple)]/15 group-hover:bg-[var(--color-accent-purple)] transition-colors"
                  onClick={(e) => { e.stopPropagation(); play(ep); }}
                >
                  <Play size={16} className="text-[var(--color-accent-purple-light)] group-hover:text-white ml-0.5" fill="currentColor" />
                </div>
                <button
                  className="sm:hidden p-1.5 rounded-lg self-center shrink-0"
                  onClick={(e) => { e.stopPropagation(); openPlaylistPicker(ep.id); }}
                  title="Add to Playlist"
                >
                  <ListMusic size={14} className="text-[var(--text-tertiary)]" />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--color-accent-purple-light)] transition-colors">
                    {ep.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mt-0.5">
                    {ep.date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(ep.date).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {ep.duration || `${Math.floor(Math.random() * 40) + 15}:00`}
                    </span>
                    {ep.plays > 0 && (
                      <span>{ep.plays.toLocaleString()} plays</span>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); openPlaylistPicker(ep.id); }}
                    className="p-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[var(--color-surface-hover)]"
                    title="Add to Playlist"
                  >
                    <ListMusic size={15} className="text-[var(--text-tertiary)] hover:text-[var(--color-accent-purple-light)]" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); play(ep); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-200"
                    style={{ background: `${catStyle.accent}15`, color: catStyle.accent }}
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playlist picker modal */}
      {showPlaylistPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPlaylistPicker(false)}
        >
          <div
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Add to Playlist</h3>
              <button
                onClick={() => setShowPlaylistPicker(false)}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {playlists.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] py-2">No playlists yet. Create one in your library.</p>
              ) : (
                playlists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={async () => {
                      await addEpisodeToPlaylist(pl.id, pickerEpisodeId);
                      setShowPlaylistPicker(false);
                    }}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <span className="text-lg">{pl.emoji || '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{pl.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{pl.episodeCount || 0} episodes</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => { setShowPlaylistPicker(false); }}
              className="w-full mt-4 py-2 rounded-xl text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
