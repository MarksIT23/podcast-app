import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Headphones, ArrowLeft } from 'lucide-react';
import { fetchCategories, fetchPodcasts } from '../services/data';

const categoryColors = {
  Technology: { bg: 'rgba(29,185,84,0.15)', text: '#1DB954', border: 'rgba(29,185,84,0.3)' },
  Science: { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA', border: 'rgba(59,130,246,0.3)' },
  Business: { bg: 'rgba(249,115,22,0.15)', text: '#FB923C', border: 'rgba(249,115,22,0.3)' },
  Entertainment: { bg: 'rgba(236,72,153,0.15)', text: '#F472B6', border: 'rgba(236,72,153,0.3)' },
  Education: { bg: 'rgba(234,179,8,0.15)', text: '#FDE047', border: 'rgba(234,179,8,0.3)' },
  Health: { bg: 'rgba(139,92,246,0.15)', text: '#A78BFA', border: 'rgba(139,92,246,0.3)' },
};

const categoryGradients = {
  Technology: 'linear-gradient(135deg, rgba(29,185,84,0.3) 0%, rgba(0,0,0,0) 100%)',
  Science: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 100%)',
  Business: 'linear-gradient(135deg, rgba(249,115,22,0.3) 0%, rgba(0,0,0,0) 100%)',
  Entertainment: 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(0,0,0,0) 100%)',
  Education: 'linear-gradient(135deg, rgba(234,179,8,0.3) 0%, rgba(0,0,0,0) 100%)',
  Health: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0) 100%)',
};

export default function CategoryBrowsePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(res => {
      const found = res.data.find(c => c.slug === slug);
      setCategory(found || null);
    });
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    fetchPodcasts({ category: category.name, pageSize: 50 }).then(res => {
      setPodcasts(res.data);
      setLoading(false);
    });
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent-purple)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const catStyle = categoryColors[category?.name] || categoryColors.Technology;
  const gradient = categoryGradients[category?.name] || categoryGradients.Technology;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="relative" style={{ background: gradient }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Home
          </button>

          {category ? (
            <div>
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}
              >
                {category.name}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">{category.description}</h1>
              <p className="text-sm text-[var(--text-tertiary)]">{podcasts.length} podcasts</p>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Category not found</h1>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {podcasts.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">No podcasts in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {podcasts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/podcast/${p.id}`)}
                className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden cursor-pointer hover:bg-[var(--color-surface-hover)] transition-all"
                tabIndex={0}
                role="button"
                aria-label={`View ${p.title}`}
              >
                <div className="aspect-[3/1] overflow-hidden">
                  <img
                    src={p.coverImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{p.title}</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">{p.host}</p>
                  <p className="text-xs text-[var(--text-tertiary)] line-clamp-2">{p.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1"><Play size={12} />{p.plays?.toLocaleString()}</span>
                    <span>{p.episodes} eps</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
