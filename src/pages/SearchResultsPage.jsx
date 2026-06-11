import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Headphones, Search, ArrowLeft } from 'lucide-react';
import { searchPodcasts, fetchCategories } from '../services/data';

const categoryColors = {
  Technology: { bg: 'rgba(29,185,84,0.12)', text: '#1DB954' },
  Science: { bg: 'rgba(59,130,246,0.12)', text: '#60A5FA' },
  Business: { bg: 'rgba(249,115,22,0.12)', text: '#FB923C' },
  Entertainment: { bg: 'rgba(236,72,153,0.12)', text: '#F472B6' },
  Education: { bg: 'rgba(234,179,8,0.12)', text: '#FDE047' },
  Health: { bg: 'rgba(139,92,246,0.12)', text: '#A78BFA' },
};

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    fetchCategories().then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    setLoading(true);
    searchPodcasts(query).then(res => {
      setResults(res.data);
      setLoading(false);
    });
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const filtered = categoryFilter
    ? results.filter(p => p.categories?.some(c => c.name === categoryFilter))
    : results;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Home
        </button>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search podcasts..."
              className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[var(--color-accent-purple)] transition-colors"
            />
          </div>
        </form>

        {query && (
          <p className="text-sm text-[var(--text-tertiary)] mb-6">
            {loading ? 'Searching...' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`}
          </p>
        )}

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
            <p className="text-[var(--text-tertiary)]">
              {query ? 'No podcasts found matching your search.' : 'Enter a search term to find podcasts.'}
            </p>
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
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/podcast/${podcast.id}`)}
                  className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 cursor-pointer hover:bg-[var(--color-surface-hover)] transition-all"
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${podcast.title}`}
                >
                  <div className="flex gap-4">
                    <img
                      src={podcast.coverImage}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover ring-1 ring-[var(--color-border)] shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{podcast.title}</h3>
                      <p className="text-xs text-[var(--text-tertiary)] mb-2">{podcast.host}</p>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: catStyle.bg, color: catStyle.text }}
                      >
                        {podcast.categories?.[0]?.name || podcast.categories?.[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1"><Play size={12} />{podcast.plays?.toLocaleString()}</span>
                    <span>{podcast.episodes} eps</span>
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
