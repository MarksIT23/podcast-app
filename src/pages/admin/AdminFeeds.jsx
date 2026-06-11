import { useState, useEffect } from 'react';
import { PageHeader, Card, Button, DataTable, LoadingSkeleton, StatusBadge, Pagination, Input } from '../../components/ui';
import { fetchFeeds, createFeed, deleteFeed, fetchCategories, fetchPodcasts, ingestFeed, ingestAllFeeds, createPodcast } from '../../services/data';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../components/ui/Toast';
import { Plus, Trash2, RefreshCw, Rss, Play } from 'lucide-react';

export default function AdminFeeds() {
  const addToast = useToast();
  const [feeds, setFeeds] = useState([]);
  const [total, setTotal] = useState(0);
  const [initialLoad, setInitialLoad] = useState(() => !sessionStorage.getItem('af_loaded'));
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPodcastId, setNewPodcastId] = useState('');
  const [categories, setCategories] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [adding, setAdding] = useState(false);
  const [ingesting, setIngesting] = useState(null); // feed ID being ingested, or 'all'
  const [newPodcastTitle, setNewPodcastTitle] = useState('');
  const [newPodcastHost, setNewPodcastHost] = useState('');

  const NEW_PODCAST_VALUE = '__new__';

  const pagination = usePagination({ totalItems: total, initialPageSize: 15 });

  const loadFeeds = (isInitial = false) => {
    if (!isInitial) setRefreshing(true);
    fetchFeeds({ page: pagination.page, pageSize: pagination.pageSize, status: statusFilter })
      .then((res) => {
        setFeeds(res.data);
        setTotal(res.total);
      })
      .catch(() => addToast('Failed to load feeds.', 'error'))
      .finally(() => { setRefreshing(false); setInitialLoad(false); sessionStorage.setItem('af_loaded', '1'); });
  };

  useEffect(() => { loadFeeds(true); }, []);

  useEffect(() => {
    if (!initialLoad) loadFeeds(false);
  }, [pagination.page, pagination.pageSize, statusFilter]);

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data || [])).catch(() => {});
    fetchPodcasts({ pageSize: 200 }).then((res) => setPodcasts(res.data || [])).catch(() => {});
  }, []);

  const handleAdd = async () => {
    if (!newUrl.trim()) { addToast('Feed URL is required.', 'error'); return; }
    setAdding(true);
    try {
      let effectivePodcastId = newPodcastId || null;

      // If user selected "Create New Podcast", create it first
      if (newPodcastId === NEW_PODCAST_VALUE) {
        if (!newPodcastTitle.trim()) { addToast('Podcast title is required.', 'error'); setAdding(false); return; }
        const created = await createPodcast({
          title: newPodcastTitle.trim(),
          host: newPodcastHost.trim() || undefined,
        });
        effectivePodcastId = created.data.id;
      }

      await createFeed(newUrl.trim(), newCategory || null, effectivePodcastId);
      addToast('Feed added successfully.', 'success');
      setNewUrl('');
      setNewCategory('');
      setNewPodcastId('');
      setNewPodcastTitle('');
      setNewPodcastHost('');
      setShowAdd(false);
      pagination.setPage(1);
      // Refresh podcast list if we created one
      if (newPodcastId === NEW_PODCAST_VALUE) {
        fetchPodcasts({ pageSize: 200 }).then((res) => setPodcasts(res.data || [])).catch(() => {});
      }
      loadFeeds();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to add feed.';
      addToast(msg, 'error');
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFeed(id);
      addToast('Feed deleted.', 'success');
      loadFeeds();
    } catch {
      addToast('Failed to delete feed.', 'error');
    }
  };

  const handleIngestNow = async (id) => {
    setIngesting(id);
    try {
      await ingestFeed(id);
      addToast('Ingestion started. Check the Jobs log for results.', 'success');
      loadFeeds();
    } catch (err) {
      addToast(err?.response?.data?.error || 'Ingestion failed to start.', 'error');
    }
    setIngesting(null);
  };

  const handleIngestAll = async () => {
    setIngesting('all');
    try {
      const res = await ingestAllFeeds();
      addToast(`${res.message || 'Ingestion triggered.'} Check jobs for results.`, 'success');
      loadFeeds();
    } catch (err) {
      addToast(err?.response?.data?.error || 'Bulk ingestion failed to start.', 'error');
    }
    setIngesting(null);
  };

  const statusColor = (s) => {
    switch (s) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  const columns = [
    { key: 'url', label: 'Feed URL', render: (v) => (
      <span className="text-small font-mono text-[var(--text-primary)] truncate max-w-[240px] inline-block align-middle" title={v}>{v}</span>
    )},
    { key: 'podcast', label: 'Podcast', render: (_, row) => (
      <span className="text-small">{row.podcast?.title || '-'}</span>
    )},
    { key: 'category', label: 'Category', render: (v) => <span className="text-small">{v || '-'}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={statusColor(v)}>{v}</StatusBadge> },
    { key: 'lastFetched', label: 'Last Fetched', render: (v) => (
      <span className="text-small text-[var(--text-secondary)]">{v ? new Date(v).toLocaleString() : 'Never'}</span>
    )},
    { key: '_count', label: 'Jobs', render: (v) => (
      <span className="text-small font-mono">{v?.jobs ?? 0}</span>
    )},
    { key: 'id', label: '', render: (v, row) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleIngestNow(v)}
          disabled={ingesting === v}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--color-accent-purple-light)] hover:bg-[var(--color-accent-purple)]/10 transition-colors disabled:opacity-40"
          aria-label="Ingest now"
          title="Ingest now"
        >
          <Play size={14} className={ingesting === v ? 'animate-pulse' : ''} />
        </button>
        <button
          onClick={() => handleDelete(v)}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
          aria-label="Delete feed"
          title="Delete feed"
        >
          <Trash2 size={14} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Feed Manager"
        description="Manage RSS feeds and monitor ingestion."
        actions={
          <Button variant="primary" size="md" onClick={() => setShowAdd(true)}>
            <Plus size={16} aria-hidden="true" /> Add Feed
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); pagination.setPage(1); }}
          className="px-3 py-2 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-secondary)] outline-none cursor-pointer focus:border-[var(--color-accent-purple)]"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="suspended">Suspended</option>
        </select>
        <Button variant="ghost" size="sm" onClick={loadFeeds}>
          <RefreshCw size={14} aria-hidden="true" /> Refresh
        </Button>
        <Button variant="secondary" size="sm" onClick={handleIngestAll} disabled={ingesting === 'all'}>
          <Play size={14} className={ingesting === 'all' ? 'animate-pulse' : ''} aria-hidden="true" />
          {ingesting === 'all' ? 'Ingesting...' : 'Ingest All'}
        </Button>
      </div>

      {/* Add feed form */}
      {showAdd && (
        <Card variant="elevated" className="p-5">
          <h3 className="text-card font-semibold mb-4">Add New Feed</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[300px]">
              <Input
                label="RSS Feed URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
              />
            </div>
            <div>
              <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Category (optional)</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2.5 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] outline-none cursor-pointer focus:border-[var(--color-accent-purple)] min-w-[160px]"
              >
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Link to Podcast (optional)</label>
              <select
                value={newPodcastId}
                onChange={(e) => setNewPodcastId(e.target.value)}
                className="px-3 py-2.5 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] outline-none cursor-pointer focus:border-[var(--color-accent-purple)] min-w-[200px]"
              >
                <option value="">Not linked</option>
                {podcasts.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                <option value={NEW_PODCAST_VALUE}>─── Create New Podcast ───</option>
              </select>
            </div>
            {newPodcastId === NEW_PODCAST_VALUE && (
              <div className="w-full flex flex-wrap gap-4 mt-1">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    label="New Podcast Title"
                    value={newPodcastTitle}
                    onChange={(e) => setNewPodcastTitle(e.target.value)}
                    placeholder="My Podcast"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <Input
                    label="Host (optional)"
                    value={newPodcastHost}
                    onChange={(e) => setNewPodcastHost(e.target.value)}
                    placeholder="Host name"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="primary" size="md" onClick={handleAdd} disabled={adding}>
                {adding ? <RefreshCw size={16} className="animate-spin" /> : <Rss size={16} />}
                {adding ? 'Adding...' : 'Add Feed'}
              </Button>
              <Button variant="ghost" size="md" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Feed list */}
      {initialLoad ? (
        <LoadingSkeleton variant="table-row" count={5} />
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden">
          <div className="p-5">
            <DataTable
              columns={columns}
              data={feeds}
              emptyMessage="No feeds found. Add one above to get started."
            />
          </div>
          {total > pagination.pageSize && (
            <div className="px-5 pb-5">
              <Pagination pagination={pagination} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
