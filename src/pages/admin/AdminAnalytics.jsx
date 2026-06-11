import { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Button, LoadingSkeleton, Tooltip } from '../../components/ui';
import { fetchAnalytics } from '../../services/data';
import { TrendingUp, Download, Users, Headphones, DollarSign, Clock, Monitor, Globe, Activity } from 'lucide-react';

const TIME_RANGES = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: '12m', label: '12M' },
];

const TREND_METRICS = [
  { id: 'users', label: 'User Growth', color: 'var(--color-accent-purple)', key: 'userGrowth' },
  { id: 'revenue', label: 'Revenue', color: 'var(--color-success)', key: 'revenueByMonth' },
  { id: 'plays', label: 'Plays', color: 'var(--color-accent-blue)', key: 'playsByMonth' },
];

/* ============================================
   Mini stat box — used inside the hero section
   ============================================ */
function MiniStat({ icon: Icon, label, value, change, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18' }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-caption text-[var(--text-tertiary)]">{label}</p>
        <p className="text-small font-semibold text-[var(--text-primary)]">{value}</p>
        {change && <p className="text-caption text-[var(--color-success)]">{change}</p>}
      </div>
    </div>
  );
}

/* ============================================
   BarChart — Flex-based, reliable bar rendering
   ============================================ */
function BarChart({ data, color = 'var(--color-accent-purple)', height = 140, showLabels = true, maxValue, previousData, previousColor }) {
  if (!data || !data.length) return null;
  const maxVal = maxValue || Math.max(...data.map((d) => d.value));
  const labels = data.map((d) => d.category || d.label || d.month || '');
  const chartH = showLabels ? height - 18 : height;

  return (
    <div style={{ position: 'relative' }}>
      {previousData && previousData.length > 0 && (
        <div className="flex items-end gap-[5px] overflow-hidden" style={{ height: chartH, position: 'absolute', inset: 0, opacity: 0.35 }}>
          {previousData.map((d, i) => {
            const rawPct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
            const pct = Math.min(rawPct, 100);
            return (
              <div key={i} className="flex-1 flex flex-col justify-end items-center" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{ height: `${pct}%`, backgroundColor: previousColor || color, minHeight: pct > 0 ? 2 : 0 }}
                  title={`${labels[i]}: ${d.value}`}
                />
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-end gap-[5px] overflow-hidden" style={{ height: chartH }}>
        {data.map((d, i) => {
          const rawPct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
          const barPct = Math.max(rawPct, d.value > 0 ? 4 : 0);
          return (
            <Tooltip key={i} content={`${labels[i] || d.country || d.type}: ${d.value.toLocaleString()}`}>
              <div
                className="rounded-[3px] cursor-help transition-all duration-300 hover:opacity-80"
                style={{
                  flex: '1 1 0px',
                  height: `${barPct}%`,
                  minHeight: d.value > 0 ? '5px' : '0',
                  backgroundColor: color,
                }}
              />
            </Tooltip>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex gap-[5px] mt-[3px]">
          {data.map((d, i) => (
            <span key={i} className="flex-1 text-[10px] text-[var(--text-tertiary)] text-center truncate leading-tight">
              {labels[i].slice(0, 5)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================
   Compact Donut
   ============================================ */
function CompactDonut({ data, size = 72 }) {
  if (!data || !data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  const colors = ['var(--color-accent-blue)', 'var(--color-accent-purple)', 'var(--color-accent-orange)', 'var(--color-success)', '#F59E0B'];
  const r = size / 2 - 6;
  const sw = 8;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={sw} />
        {data.map((d, i) => {
          const start = data.slice(0, i).reduce((s, x) => s + x.value, 0);
          const offset = -(start / total) * circumference;
          const length = (d.value / total) * circumference;
          return (
            <circle
              key={d.type || d.category}
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={sw}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={d.type || d.category} className="flex items-center gap-2 text-small">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-[var(--text-secondary)]">{d.type || d.category}</span>
            <span className="text-[var(--text-primary)] font-medium">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================
   Horizontal bar row — for countries, categories
   ============================================ */
function HorizontalBars({ data, color = 'var(--color-accent-blue)' }) {
  if (!data || !data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.country || d.category} className="space-y-1">
          <div className="flex justify-between text-small">
            <span className="text-[var(--text-secondary)]">{d.country || d.category}</span>
            <span className="text-[var(--text-primary)] font-medium">{Math.round((d.value / maxVal) * 100)}%</span>
          </div>
          <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(d.value / maxVal) * 100}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   Main Page
   ============================================ */
export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [trendMetric, setTrendMetric] = useState('users');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    fetchAnalytics(timeRange).then((res) => {
      setAnalytics(res.data);
      setLoading(false);
    });
  }, [timeRange]);

  const handleExport = () => {
    const csv = [
      'Metric,Value',
      `Total Users,${analytics?.totalUsers || 0}`,
      `Total Plays,${analytics?.totalPlays || 0}`,
      `Revenue,$${analytics?.totalRevenue || 0}`,
      `Avg Engagement,${analytics?.avgEngagement || 0}%`,
      `User Retention,${analytics?.userRetention || 0}%`,
      '',
      'Category,Plays',
      ...(analytics?.playsByCategory || []).map((c) => `${c.category},${c.value}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcastai-analytics-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics" description="Platform analytics and insights." />
        <LoadingSkeleton variant="card" count={6} />
      </div>
    );
  }

  const activeMetric = TREND_METRICS.find((m) => m.id === trendMetric);
  const chartData = analytics?.[activeMetric?.key];

  const getPreviousData = (data) => {
    if (!data || !compareMode) return null;
    return data.map((d) => ({ ...d, value: Math.round(d.value * (0.75 + Math.random() * 0.15)) }));
  };
  const previousChartData = getPreviousData(chartData);

  return (
    <div className="space-y-5">
      {/* ---- Header ---- */}
      <PageHeader
        title="Analytics"
        description="Platform analytics, trends, and performance metrics."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
              {TIME_RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setLoading(true);
                    setTimeRange(r.id);
                  }}
                  className={`px-2.5 py-1.5 text-small transition-colors ${
                    timeRange === r.id ? 'bg-[var(--color-accent-purple)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download size={16} /> Export CSV
            </Button>
          </div>
        }
      />

      {/* ---- Hero: Big metric + mini stats ---- */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Hero number — takes 2/5 */}
        <Card variant="elevated" className="lg:col-span-2 flex flex-col justify-center">
          <p className="text-caption text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Total Plays</p>
          <p className="text-[2rem] font-bold text-[var(--text-primary)] mt-1 leading-none" style={{ fontVariationSettings: "'wght' 700" }}>
            {(analytics?.totalPlays || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="success" size="sm">▲ +18.3%</Badge>
            <span className="text-caption text-[var(--text-tertiary)]">vs previous period</span>
          </div>
          {/* Mini sparkline */}
          <div className="mt-4">
            <BarChart data={analytics?.weeklyPlays} color="var(--color-accent-purple)" height={56} showLabels={false} />
          </div>
        </Card>

        {/* Mini stats grid — takes 3/5 */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MiniStat icon={Users} label="Total Users" value={(analytics?.totalUsers || 0).toLocaleString()} change="+12.5%" color="var(--color-accent-purple)" />
          <MiniStat icon={DollarSign} label="Revenue" value={`$${(analytics?.totalRevenue || 0).toLocaleString()}`} change={`+${analytics?.revenueGrowth || 0}%`} color="var(--color-success)" />
          <MiniStat icon={Clock} label="Avg Session" value={analytics?.avgSessionDuration || '0:00'} change="+3.2%" color="var(--color-accent-orange)" />
          <MiniStat icon={Headphones} label="Active Users" value={(analytics?.activeUsers || 0).toLocaleString()} color="var(--color-accent-blue)" />
          <MiniStat icon={Activity} label="Retention" value={`${analytics?.userRetention || 0}%`} color="var(--color-accent-purple)" />
          <MiniStat icon={Monitor} label="Engagement" value={`${analytics?.avgEngagement || 0}%`} color="var(--color-accent-orange)" />
        </div>
      </div>

      {/* ---- Trends: Tab-switched chart ---- */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-0.5">
            {TREND_METRICS.map((m) => (
              <button
                key={m.id}
                onClick={() => setTrendMetric(m.id)}
                className={`px-3 py-1.5 text-small rounded-[var(--radius-md)] transition-colors ${
                  trendMetric === m.id ? 'bg-[var(--color-accent-purple)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCompareMode((p) => !p)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[var(--radius-md)] transition-colors ${
                compareMode
                  ? 'bg-[var(--color-accent-purple)]/15 text-[var(--color-accent-purple-light)] border border-[var(--color-accent-purple)]/30'
                  : 'text-[var(--text-tertiary)] border border-transparent hover:text-[var(--text-secondary)]'
              }`}
            >
              {compareMode ? 'Compare: ON' : 'Compare'}
            </button>
            <Badge variant="success" size="sm" dot>
              {trendMetric === 'users' ? `+${Math.round(((analytics?.userGrowth?.[analytics.userGrowth.length - 1]?.value || 0) - (analytics?.userGrowth?.[0]?.value || 0)) / (analytics?.userGrowth?.[0]?.value || 1) * 100)}%` : `+${analytics?.revenueGrowth || 0}%`}
            </Badge>
          </div>
        </div>
        <BarChart data={chartData} color={activeMetric?.color || 'var(--color-accent-purple)'} height={220} previousData={previousChartData} previousColor="var(--color-accent-blue)" />
      </Card>

      {/* ---- Insights: Categories + Countries + Devices ---- */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card variant="elevated">
          <h3 className="text-card font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-[var(--color-accent-purple-light)]" /> Top Categories
          </h3>
          {(analytics?.playsByCategory || []).length > 0 && (
            <HorizontalBars data={analytics.playsByCategory.map((c) => ({ ...c, country: c.category }))} color="var(--color-accent-purple)" />
          )}
        </Card>

        <Card variant="elevated">
          <h3 className="text-card font-semibold mb-4 flex items-center gap-2">
            <Globe size={15} className="text-[var(--color-accent-blue)]" /> Top Countries
          </h3>
          <HorizontalBars data={analytics?.topCountries} color="var(--color-accent-blue)" />
        </Card>

        <Card variant="elevated">
          <h3 className="text-card font-semibold mb-4 flex items-center gap-2">
            <Monitor size={15} className="text-[var(--color-accent-orange)]" /> Devices
          </h3>
          <CompactDonut data={analytics?.devices} />
        </Card>
      </div>

      {/* ---- Bottom: Weekly + Retention ---- */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-card font-semibold flex items-center gap-2">
              <Activity size={15} className="text-[var(--color-accent-purple-light)]" /> Weekly Activity
            </h3>
            <Badge variant="purple" size="sm">{timeRange}</Badge>
          </div>
          <BarChart data={analytics?.weeklyPlays} color="var(--color-accent-purple)" height={160} showLabels={false} />
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] grid grid-cols-7 gap-1 text-center text-caption">
            {(analytics?.weeklyPlays || []).map((d) => (
              <div key={d.label}>
                <p className="text-[var(--text-primary)] font-medium">{d.value.toLocaleString()}</p>
                <p className="text-[var(--text-tertiary)] text-[10px]">{d.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated">
          <h3 className="text-card font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-[var(--color-accent-orange)]" /> Retention
          </h3>
          <div className="space-y-2.5">
            {(analytics?.retentionByWeek || []).map((d) => {
              const maxVal = analytics?.retentionByWeek?.[0]?.value || 100;
              return (
                <div key={d.week} className="flex items-center gap-3">
                  <span className="text-[11px] text-[var(--text-tertiary)] w-12 shrink-0">{d.week}</span>
                  <div className="flex-1 h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-purple-light)]" style={{ width: `${(d.value / maxVal) * 100}%` }} />
                  </div>
                  <span className="text-small text-[var(--text-secondary)] font-mono w-9 text-right">{d.value}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-small flex justify-between">
            <span className="text-[var(--text-tertiary)]">Overall retention</span>
            <span className="text-[var(--text-primary)] font-medium">{analytics?.userRetention || 0}%</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
