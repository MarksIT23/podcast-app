import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Play, Headphones } from 'lucide-react';
import { fetchPodcasts, fetchCategories } from '../services/data';

const categoryColors = {
  Technology: { bg: 'rgba(29,185,84,0.12)', text: '#1DB954' },
  Science: { bg: 'rgba(59,130,246,0.12)', text: '#60A5FA' },
  Business: { bg: 'rgba(249,115,22,0.12)', text: '#FB923C' },
  Entertainment: { bg: 'rgba(236,72,153,0.12)', text: '#F472B6' },
  Education: { bg: 'rgba(234,179,8,0.12)', text: '#FDE047' },
  Health: { bg: 'rgba(139,92,246,0.12)', text: '#A78BFA' },
};

export default function PodcastsPage() {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    Promise.all([
      fetchPodcasts({ pageSize: 50 }),
      fetchCategories(),
    ]).then(([podRes, catRes]) => {
      setPodcasts(podRes.data);
      setCategories(catRes.data);
      setLoading(false);
    });
  }, []);

  const filtered = podcasts.filter(p => {
    const matchesSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.host?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.categories?.some(c => c.name === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">All Podcasts</h1>
            <p className="text-sm text-[var(--text-tertiary)]">Browse our full collection</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-accent-purple)] transition-colors"
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !categoryFilter
                  ? 'bg-[var(--color-accent-purple)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--text-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent-purple)]'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setCategoryFilter(cat.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat.name
                    ? 'bg-[var(--color-accent-purple)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--text-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent-purple)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent-purple)] border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Headphones size={48} className="mx-auto mb-4 text-[var(--text-tertiary)] opacity-50" />
            <p className="text-[var(--text-tertiary)]">No podcasts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((podcast, i) => {
              const catStyle = categoryColors[podcast.categories?.[0]?.name] || categoryColors.Technology;
              return (
                <motion.div
                  key={podcast.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => navigate(`/podcast/${podcast.id}`)}
                  className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden cursor-pointer hover:bg-[var(--color-surface-hover)] transition-all"
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${podcast.title}`}
                >
                  <div className="aspect-[3/1] overflow-hidden">
                    <img
                      src={podcast.coverImage}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-2"
                      style={{ background: catStyle.bg, color: catStyle.text }}
                    >
                      {podcast.categories?.[0]?.name || podcast.categories?.[0]}
                    </span>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{podcast.title}</h3>
                    <p className="text-xs text-[var(--text-tertiary)] mb-2">{podcast.host}</p>
                    <p className="text-xs text-[var(--text-tertiary)] line-clamp-2">{podcast.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1"><Play size={12} />{podcast.plays?.toLocaleString()}</span>
                      <span>{podcast.episodes} eps</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
