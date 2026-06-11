import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, StatCard, Card, Badge, Avatar, Button, LoadingSkeleton } from '../../components/ui';
import { Users, Headphones, TrendingUp, Plus, BarChart3, DollarSign, Activity, Clock, Mic, Rss } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchAnalytics, fetchRecentActivity } from '../../services/data';
import { staggerContainer, staggerItem } from '../../animations';

function MiniLineChart({ data, color = 'var(--color-accent-purple)', height = 60 }) {
  if (!data || !data.length) return null;
  const w = 240;
  const h = height;
  const maxVal = Math.max(...data.map((d) => d.value));
  const points = data.map((d) => d.value);
  const pathD = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - (v / maxVal) * h;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" role="img" aria-label="Chart">
      <defs>
        <linearGradient id={`grad-${color.replace(/\W/g, '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L ${w} ${h} L 0 ${h} Z`} fill={`url(#grad-${color.replace(/\W/g, '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (
        <circle cx={(points.length - 1) / (points.length - 1) * w} cy={h - (points[points.length - 1] / maxVal) * h} r="3" fill={color} />
      )}
    </svg>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);
  const [topPodcasts, setTopPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAnalytics('12m'),
      fetchRecentActivity(),
      import('../../services/data').then(mod => mod.fetchUsers({ pageSize: 5 })),
      import('../../services/data').then(mod => mod.fetchPodcasts({ pageSize: 20 })),
    ]).then(([anRes, actRes, usersRes, podsRes]) => {
      setAnalytics(anRes.data);
      setRecentActivity(actRes.data);
      setRecentSignups(usersRes.data);
      setTopPodcasts([...podsRes.data].sort((a, b) => b.plays - a.plays).slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Admin Dashboard" description="Platform overview and key metrics." />
        <LoadingSkeleton variant="card" count={4} />
      </div>
    );
  }

  const activityIcons = {
    signup: Users,
    podcast_created: Mic,
    episode_published: Headphones,
    milestone: TrendingUp,
    podcast_updated: Activity,
    report: BarChart3,
  };
  const activityColors = {
    signup: 'var(--color-success)',
    podcast_created: 'var(--color-accent-purple)',
    episode_published: 'var(--color-accent-blue)',
    milestone: 'var(--color-accent-orange)',
    podcast_updated: 'var(--color-info)',
    report: 'var(--text-tertiary)',
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and key metrics."
        actions={
          <Button variant="primary" size="md" onClick={() => navigate('/admin/podcasts/new')}>
            <Plus size={16} aria-hidden="true" /> Create Podcast
          </Button>
        }
      />

      {/* Row 1: 3 key KPIs — focused on what matters */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={staggerItem}>
          <StatCard label="Total Users" value={(analytics?.totalUsers || 0).toLocaleString()} change="+12.5%" trend="up" icon={Users} color="var(--color-accent-purple)" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard label="Total Plays" value={(analytics?.totalPlays || 0).toLocaleString()} change="+18.3%" trend="up" icon={Headphones} color="var(--color-accent-blue)" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard label="Revenue" value={`$${(analytics?.totalRevenue || 0).toLocaleString()}`} change={`+${analytics?.revenueGrowth || 0}%`} trend="up" icon={DollarSign} color="var(--color-success)" />
        </motion.div>
      </motion.div>

      {/* Feed Ingestion Health */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-card font-semibold flex items-center gap-2">
            <Rss size={16} className="text-[var(--color-accent-purple-light)]" /> Feed Ingestion
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/feeds')}>
            Manage Feeds
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]">
            <p className="text-[1.25rem] font-bold text-[var(--text-primary)]">{analytics?.totalFeeds ?? 0}</p>
            <p className="text-caption text-[var(--text-tertiary)]">Total Feeds</p>
          </div>
          <div className="text-center p-3 rounded-[var(--radius-lg)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
            <p className="text-[1.25rem] font-bold text-[var(--color-success)]">{analytics?.feedsByStatus?.active ?? 0}</p>
            <p className="text-caption text-[var(--text-tertiary)]">Active</p>
          </div>
          <div className="text-center p-3 rounded-[var(--radius-lg)] bg-[var(--color-accent-orange)]/10 border border-[var(--color-accent-orange)]/20">
            <p className="text-[1.25rem] font-bold text-[var(--color-accent-orange)]">{analytics?.feedsByStatus?.pending ?? 0}</p>
            <p className="text-caption text-[var(--text-tertiary)]">Pending</p>
          </div>
          <div className="text-center p-3 rounded-[var(--radius-lg)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20">
            <p className="text-[1.25rem] font-bold text-[var(--color-danger)]">{analytics?.feedsByStatus?.failed ?? 0}</p>
            <p className="text-caption text-[var(--text-tertiary)]">Failed</p>
          </div>
        </div>
        {analytics?.lastIngestion && (
          <p className="text-caption text-[var(--text-tertiary)] mt-3 text-right">
            Last ingestion: {new Date(analytics.lastIngestion).toLocaleString()}
            {analytics?.failedJobs > 0 && (
              <span className="text-[var(--color-danger)] ml-2">({analytics.failedJobs} failed jobs)</span>
            )}
          </p>
        )}
      </Card>

      {/* Row 2: Trend charts (2/3) + This week (1/3) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Combined trends — user growth + revenue side by side */}
        <Card variant="elevated" className="lg:col-span-2 p-0">
          <div className="grid sm:grid-cols-2 divide-x divide-[var(--color-border)]">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-card font-semibold">User Growth</h3>
                  <p className="text-caption text-[var(--text-tertiary)]">Last 12 months</p>
                </div>
                <Badge variant="success" size="sm" dot>+18.2%</Badge>
              </div>
              <div className="h-16">
                <MiniLineChart data={analytics?.userGrowth} color="var(--color-accent-purple)" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-card font-semibold">Revenue Trend</h3>
                  <p className="text-caption text-[var(--text-tertiary)]">Monthly revenue</p>
                </div>
                <Badge variant="success" size="sm" dot>+22.4%</Badge>
              </div>
              <div className="h-16">
                <MiniLineChart data={analytics?.revenueByMonth} color="var(--color-success)" />
              </div>
            </div>
          </div>
        </Card>

        {/* This week's plays — compact */}
        <Card variant="elevated">
          <h3 className="text-card font-semibold mb-3">This Week</h3>
          <div className="flex items-end justify-between gap-1 h-20">
            {(analytics?.weeklyPlays || []).map((d) => {
              const maxVal = Math.max(...(analytics?.weeklyPlays || []).map((x) => x.value));
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1 cursor-help" title={`${d.label}: ${d.value.toLocaleString()} plays`}>
                  <div
                    className="w-full rounded-[var(--radius-sm)] bg-gradient-to-t from-[var(--color-accent-purple)]/70 to-[var(--color-accent-purple-light)]/50 transition-all"
                    style={{ height: `${(d.value / maxVal) * 100}%` }}
                  />
                  <span className="text-caption text-[var(--text-tertiary)]">{d.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-center text-small text-[var(--text-tertiary)]">
            {(analytics?.weeklyPlays || []).reduce((s, d) => s + d.value, 0).toLocaleString()} total plays
          </div>
        </Card>
      </div>

      {/* Row 3: Top Podcasts (2/3) + Recent Activity (1/3) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Podcasts */}
        <Card variant="elevated" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-card font-semibold flex items-center gap-2">
              <Headphones size={16} className="text-[var(--color-accent-purple-light)]" /> Top Performing Podcasts
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/podcasts')}>
              Manage Podcasts
            </Button>
          </div>
          <div className="space-y-1">
            {topPodcasts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer" tabIndex={0} role="button" aria-label={`${p.title} — ${p.plays.toLocaleString()} plays`}>
                <span className={`text-caption w-5 font-mono ${i < 3 ? 'text-[var(--color-accent-purple-light)]' : 'text-[var(--text-tertiary)]'}`}>{i + 1}</span>
                <img src={p.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover ring-1 ring-[var(--color-border)] bg-[var(--color-surface)]" aria-hidden="true" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="text-small font-medium truncate">{p.title}</p>
                  <p className="text-caption text-[var(--text-tertiary)]">{p.host}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-small text-[var(--text-secondary)]">{p.plays.toLocaleString()}</p>
                  <p className="text-caption text-[var(--text-tertiary)]">plays</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card variant="elevated">
          <h3 className="text-card font-semibold mb-4 flex items-center gap-2">
            <Clock size={16} className="text-[var(--color-accent-blue)]" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((item) => {
              const Icon = activityIcons[item.type] || Activity;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: (activityColors[item.type] || 'var(--text-tertiary)') + '20' }}>
                    <Icon size={13} style={{ color: activityColors[item.type] || 'var(--text-tertiary)' }} aria-hidden="true" />
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

      {/* Row 4: Recent Signups — full width compact table */}
      <Card variant="elevated" className="p-0">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-card font-semibold flex items-center gap-2">
            <Users size={16} className="text-[var(--color-accent-purple-light)]" /> Recent Signups
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
            View All
          </Button>
        </div>
        <div className="divide-y divide-[var(--color-border)]/50">
          {recentSignups.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-surface-hover)] transition-colors">
              <Avatar name={u.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-small font-medium truncate">{u.name}</p>
                <p className="text-caption text-[var(--text-tertiary)]">{u.email}</p>
              </div>
              <Badge variant={u.status === 'active' ? 'success' : 'neutral'} size="sm">{u.status}</Badge>
              <span className="text-caption text-[var(--text-tertiary)] hidden sm:block">{new Date(u.joinedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
