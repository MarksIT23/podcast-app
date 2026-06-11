import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, StatCard, Card, Badge, Button, LoadingSkeleton } from '../../components/ui';
import { Sparkles, Mic, Headphones, Clock, Plus, ArrowRight, Activity, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchAnalytics, fetchRecentActivity, fetchAdminHighlights } from '../../services/data';
import { staggerContainer, staggerItem } from '../../animations';

export default function EditorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingHighlights, setPendingHighlights] = useState([]);
  const [topPodcasts, setTopPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAnalytics('12m'),
      fetchRecentActivity(),
      fetchAdminHighlights({ status: 'pending', pageSize: 5 }),
      import('../../services/data').then(mod => mod.fetchPodcasts({ pageSize: 20 })),
    ]).then(([anRes, actRes, hlRes, podsRes]) => {
      setStats(anRes.data);
      setRecentActivity(actRes.data.filter(a => ['podcast_created', 'episode_published', 'podcast_updated'].includes(a.type)));
      setPendingHighlights(hlRes.data || []);
      setTopPodcasts([...podsRes.data].sort((a, b) => b.plays - a.plays).slice(0, 5));
      setLoading(false);
    }).catch(err => {
      console.error('[EditorDashboard] Data load failed:', err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Editor Dashboard" description="Content management overview." />
        <LoadingSkeleton variant="card" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Editor Dashboard"
        description="Review content and manage the platform."
        actions={
          <div className="flex gap-3">
            <Button variant="ghost" size="md" onClick={() => navigate('/admin/highlights')}>
              <Sparkles size={16} aria-hidden="true" /> Review Highlights
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate('/admin/podcasts/new')}>
              <Plus size={16} aria-hidden="true" /> Create Podcast
            </Button>
          </div>
        }
      />

      {/* Stats Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-4 gap-4"
      >
        <motion.div variants={staggerItem}>
          <StatCard label="Pending Highlights" value={pendingHighlights.length} icon={Sparkles} color="var(--color-accent-purple)" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard label="Total Podcasts" value={stats?.totalPodcasts || 0} icon={Mic} color="var(--color-accent-blue)" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard label="Total Episodes" value={stats?.totalEpisodes || 0} icon={Headphones} color="var(--color-accent-orange)" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard label="Total Plays" value={(stats?.totalPlays || 0).toLocaleString()} icon={Activity} color="var(--color-success)" />
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Highlights Queue */}
        <Card variant="elevated" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-card font-semibold flex items-center gap-2">
              <ListChecks size={16} className="text-[var(--color-accent-purple-light)]" /> Review Queue
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/highlights')}>
              View Queue <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {pendingHighlights.length > 0 ? (
              pendingHighlights.map((hl) => (
                <div 
                  key={hl.id} 
                  className="flex items-center gap-4 px-3 py-3 rounded-[var(--radius-lg)] border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer group"
                  onClick={() => hl.id && navigate(`/admin/highlights/${hl.id}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-purple)]/10 flex items-center justify-center shrink-0">
                    <Sparkles size={18} className="text-[var(--color-accent-purple-light)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-small font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--color-accent-purple-light)] transition-colors">
                      {hl.title}
                    </p>
                    <p className="text-caption text-[var(--text-tertiary)] truncate">
                      Episode: {hl.episode?.title || 'Unknown Episode'}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <Badge variant="neutral" size="sm">
                      {Math.round(hl.confidence * 100)}% Match
                    </Badge>
                    <ArrowRight size={14} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-[var(--text-tertiary)]">Queue is empty. Everything reviewed!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Content Activity */}
        <Card variant="elevated">
          <h3 className="text-card font-semibold mb-4 flex items-center gap-2">
            <Clock size={16} className="text-[var(--color-accent-blue)]" /> Recent Changes
          </h3>
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((item) => {
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0 mt-0.5">
                    <Activity size={12} className="text-[var(--text-tertiary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-small text-[var(--text-secondary)]">
                      <span className="text-[var(--text-primary)] font-medium">{item.user}</span> {item.detail}
                    </p>
                    <p className="text-caption text-[var(--text-tertiary)]">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Performing Podcasts */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-card font-semibold flex items-center gap-2">
            <Mic size={16} className="text-[var(--color-accent-blue-light)]" /> Top Content
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/podcasts')}>
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topPodcasts.map((p) => (
            <div key={p.id} className="text-center p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-blue)]/30 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/podcasts/${p.id}`)}>
              <img src={p.coverImage} alt="" className="w-16 h-16 rounded-xl mx-auto mb-3 object-cover shadow-lg group-hover:scale-105 transition-transform" />
              <p className="text-caption font-semibold text-[var(--text-primary)] truncate">{p.title}</p>
              <p className="text-[0.65rem] text-[var(--text-tertiary)]">{(p.plays || 0).toLocaleString()} plays</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
