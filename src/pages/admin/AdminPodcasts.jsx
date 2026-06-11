import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, DataTable, StatusBadge, SearchInput, Pagination, DropdownMenu, ConfirmDialog, LoadingSkeleton, Tooltip } from '../../components/ui';
import { fetchPodcasts, deletePodcast, duplicatePodcast, bulkUpdatePodcasts, fetchCategories } from '../../services/data';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../components/ui/Toast';
import { Plus, Edit, Copy, Archive, Trash2, Eye, EyeOff, CheckCircle, XCircle, Filter } from 'lucide-react';

export default function AdminPodcasts() {
  const navigate = useNavigate();
  const addToast = useToast();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  const debouncedSearch = useDebounce(search);
  const pagination = usePagination({ totalItems: total, initialPageSize: 10 });

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchPodcasts({ page: pagination.page, pageSize: pagination.pageSize, search: debouncedSearch, category, status })
      .then((res) => {
        if (active) {
          setData(res.data);
          setTotal(res.total);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [pagination.page, pagination.pageSize, debouncedSearch, category, status, refreshKey]);

  useEffect(() => {
    fetchCategories().then(res => setCategories(res.data));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deletePodcast(deleteTarget);
    addToast('Podcast deleted.', 'success');
    setDeleteTarget(null);
    setDeleting(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDuplicate = async (id) => {
    await duplicatePodcast(id);
    addToast('Podcast duplicated.', 'success');
    setRefreshKey((k) => k + 1);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) await deletePodcast(id);
    addToast(`${selectedIds.length} podcast(s) deleted.`, 'success');
    setSelectedIds([]);
    setRefreshKey((k) => k + 1);
  };

  const handleBulkStatus = async (newStatus) => {
    await bulkUpdatePodcasts(selectedIds, { status: newStatus });
    addToast(`${selectedIds.length} podcast(s) ${newStatus === 'published' ? 'published' : newStatus === 'archived' ? 'archived' : 'drafted'}.`, 'success');
    setSelectedIds([]);
    setRefreshKey((k) => k + 1);
  };

  const handleBulkCategory = async (categoryId) => {
    if (!categoryId) return;
    await bulkUpdatePodcasts(selectedIds, { categoryIds: [categoryId] });
    const catName = categories.find((c) => c.id === categoryId)?.name || categoryId;
    addToast(`Category changed to "${catName}" for ${selectedIds.length} podcast(s).`, 'success');
    setSelectedIds([]);
    setRefreshKey((k) => k + 1);
  };

  const handleQuickToggleStatus = async (row) => {
    const newStatus = row.status === 'published' ? 'draft' : 'published';
    await bulkUpdatePodcasts([row.id], { status: newStatus });
    addToast(`${row.title} ${newStatus === 'published' ? 'published' : 'drafted'}.`, 'success');
    setRefreshKey((k) => k + 1);
  };

  const columns = [
    { key: 'title', label: 'Title', render: (v, row) => (
      <div className="flex items-center gap-3">
        <img src={row.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover ring-1 ring-[var(--color-border)] bg-[var(--color-surface)]" aria-hidden="true" loading="lazy" />
        <div className="min-w-0">
          <p className="text-small font-medium truncate">{v}</p>
          <p className="text-caption text-[var(--text-tertiary)]">{row.host}</p>
        </div>
      </div>
    )},
    { key: 'category', label: 'Category', render: (v, row) => (
      <span className="text-small">{row.categories?.[0]?.name || row.categories?.[0] || ''}</span>
    )},
    { key: 'episodes', label: 'Episodes', sortable: true, render: (v) => (
      <span className="text-small font-mono">{v}</span>
    )},
    { key: 'plays', label: 'Plays', sortable: true, render: (v) => (
      <span className="text-small font-mono">{v?.toLocaleString()}</span>
    )},
    { key: 'rating', label: 'Rating', render: (v) => (
      <span className="text-small">{v ? `${v}/5` : '-'}</span>
    )},
    { key: 'status', label: 'Status', render: (v, row) => (
      <div className="flex items-center gap-2">
        <StatusBadge status={v} />
        <Tooltip content={v === 'published' ? 'Draft' : 'Publish'}>
          <button
            onClick={(e) => { e.stopPropagation(); handleQuickToggleStatus(row); }}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label={`Toggle ${row.title} status`}
          >
            {v === 'published' ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </Tooltip>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Podcasts"
        description={`${total} total podcasts`}
        actions={
          <Button variant="primary" size="md" onClick={() => navigate('/admin/podcasts/new')}>
            <Plus size={16} aria-hidden="true" /> Create Podcast
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <SearchInput value={search} onChange={(val) => { setLoading(true); setSearch(val); }} placeholder="Search by title or host..." />
        </div>
        <select
          value={category}
          onChange={(e) => { setLoading(true); setCategory(e.target.value); pagination.setPage(1); }}
          className="px-3 py-2 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-secondary)] outline-none cursor-pointer focus:border-[var(--color-accent-purple)]"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setLoading(true); setStatus(e.target.value); pagination.setPage(1); }}
          className="px-3 py-2 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-secondary)] outline-none cursor-pointer focus:border-[var(--color-accent-purple)]"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 text-small border rounded-[var(--radius-lg)] transition-colors flex items-center gap-1.5 ${
            showFilters || category || status ? 'border-[var(--color-accent-purple)] text-[var(--color-accent-purple-light)] bg-[var(--color-accent-purple)]/10' : 'border-[var(--color-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-[var(--color-accent-purple)]/10 border border-[var(--color-accent-purple)]/20 rounded-[var(--radius-lg)]">
          <span className="text-small text-[var(--color-accent-purple-light)] font-medium">{selectedIds.length} selected</span>
          <div className="h-4 w-px bg-[var(--color-border)]" />
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <Trash2 size={14} aria-hidden="true" /> Delete
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleBulkStatus('published')}>
            <CheckCircle size={14} aria-hidden="true" /> Publish
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleBulkStatus('draft')}>
            <XCircle size={14} aria-hidden="true" /> Draft
          </Button>
          <select
            value=""
            onChange={(e) => { const val = e.target.value; if (val) handleBulkCategory(val); }}
            className="px-2 py-1.5 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-secondary)] outline-none cursor-pointer focus:border-[var(--color-accent-purple)]"
            aria-label="Change category"
          >
            <option value="">Change Category...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="ml-auto">
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSkeleton variant="table-row" count={5} />
      ) : (
        <>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden">
            <div className="p-5">
              <DataTable
                columns={columns}
                data={data}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={(row) => row.id && navigate(`/admin/podcasts/${row.id}/edit`)}
                actions={(row) => (
                  <DropdownMenu
                    items={[
                      { label: 'Edit', icon: <Edit size={14} />, onClick: () => row.id && navigate(`/admin/podcasts/${row.id}/edit`) },
                      { label: 'Duplicate', icon: <Copy size={14} />, onClick: () => row.id && handleDuplicate(row.id) },
                      { label: row.status === 'published' ? 'Unpublish' : 'Publish', icon: row.status === 'published' ? <Archive size={14} /> : <Eye size={14} />, onClick: () => row.id && handleQuickToggleStatus(row) },
                      { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => row.id && setDeleteTarget(row.id), danger: true },
                    ]}
                  />
                )}
              />
            </div>
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            pageNumbers={pagination.pageNumbers}
            onPageChange={(p) => { setLoading(true); pagination.goTo(p); }}
            pageSize={pagination.pageSize}
            onPageSizeChange={(s) => { setLoading(true); pagination.changePageSize(s); }}
            total={total}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Podcast?"
        message="This will permanently delete this podcast and all its episodes."
        confirmLabel="Delete Podcast"
        loading={deleting}
      />
    </div>
  );
}
