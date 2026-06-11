import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, DataTable, LoadingSkeleton, Pagination } from '../../components/ui';
import { fetchAdminHighlights, approveHighlight, rejectHighlight, deleteHighlight } from '../../services/data';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../components/ui/Toast';
import { Sparkles, Check, X, Trash2, RefreshCw } from 'lucide-react';

const STATUS_COLORS = {
  pending: { bg: 'rgba(234,179,8,0.15)', text: '#FDE047' },
  approved: { bg: 'rgba(29,185,84,0.15)', text: '#1DB954' },
  rejected: { bg: 'rgba(239,68,68,0.15)', text: '#F87171' },
};

const CONFIDENCE_LABEL = (score) => {
  if (score >= 0.7) return { label: 'High', color: '#1DB954' };
  if (score >= 0.4) return { label: 'Medium', color: '#FDE047' };
  return { label: 'Low', color: 'rgba(255,255,255,0.4)' };
};

export default function AdminHighlights() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [highlights, setHighlights] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const pagination = usePagination({ totalItems: total, initialPageSize: 15 });

  const loadHighlights = useCallback((isInitial = false) => {
    if (!isInitial) setLoading(true);
    fetchAdminHighlights({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: statusFilter || undefined,
    })
      .then((res) => {
        setHighlights(res.data || []);
        setTotal(res.total || 0);
      })
      .catch((err) => {
        console.error('[AdminHighlights] Load failed:', err);
        addToast('Failed to load highlights.', 'error');
      })
      .finally(() => setLoading(false));
  }, [pagination.page, pagination.pageSize, statusFilter, addToast]);

  useEffect(() => { loadHighlights(true); }, []);
  useEffect(() => { if (!loading) loadHighlights(); }, [pagination.page, pagination.pageSize, statusFilter]);

  const handleApprove = async (id) => {
    try {
      await approveHighlight(id);
      addToast('Highlight approved.', 'success');
      loadHighlights(true);
    } catch { addToast('Failed to approve.', 'error'); }
  };

  const handleReject = async (id) => {
    try {
      await rejectHighlight(id);
      addToast('Highlight rejected.', 'success');
      loadHighlights(true);
    } catch { addToast('Failed to reject.', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this highlight?')) return;
    try {
      await deleteHighlight(id);
      addToast('Highlight deleted.', 'success');
      loadHighlights(true);
    } catch { addToast('Failed to delete.', 'error'); }
  };

  const actionBtnStyle = (color) => ({
    width: 30, height: 30, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
    background: 'transparent', color, cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
  });

  const columns = [
    { key: 'title', label: 'Title', sortable: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 500, color: '#fff', marginBottom: 2 }}>{v || 'Untitled'}</div>
        {row.episode?.title && (
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{row.episode.title}</div>
        )}
      </div>
    )},
    { key: 'confidence', label: 'Confidence', sortable: true, render: (v) => {
      const info = CONFIDENCE_LABEL(v);
      return <span style={{ color: info.color, fontWeight: 500, fontSize: '0.82rem' }}>{info.label}</span>;
    }},
    { key: 'status', label: 'Status', sortable: true, render: (v) => {
      const colors = STATUS_COLORS[v] || STATUS_COLORS.pending;
      return (
        <span style={{
          padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
          background: colors.bg, color: colors.text,
        }}>
          {v || 'pending'}
        </span>
      );
    }},
    {
      key: 'duration', label: 'Duration', sortable: false,
      render: (v, row) => {
        const dur = (row.endTime || 0) - (row.startTime || 0);
        if (dur <= 0) return <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>—</span>;
        const m = Math.floor(dur / 60);
        const s = dur % 60;
        return <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{m}:{s.toString().padStart(2, '0')}</span>;
      },
    },
    {
      key: 'tags', label: 'Tags', sortable: false,
      render: (v) => {
        const tags = typeof v === 'string' ? JSON.parse(v || '[]') : (v || []);
        if (tags.length === 0) return null;
        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map((t, i) => (
              <span key={i} style={{
                padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)',
              }}>{t}</span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (v, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {row.status === 'pending' && (
            <>
              <button onClick={() => handleApprove(row.id)} title="Approve" style={actionBtnStyle('#1DB954')}>
                <Check size={14} />
              </button>
              <button onClick={() => handleReject(row.id)} title="Reject" style={actionBtnStyle('#F87171')}>
                <X size={14} />
              </button>
            </>
          )}
          <button onClick={() => handleDelete(row.id)} title="Delete" style={actionBtnStyle('rgba(255,255,255,0.3)')}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="AI Highlights"
        description="Review, approve, and manage AI-generated episode highlights"
        breadcrumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Highlights' }]}
        actions={
          <Button variant="primary" onClick={() => navigate('/admin/highlights/new')}>
            <Sparkles size={16} /> New Highlight
          </Button>
        }
      />

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {['', 'pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); pagination.setPage(1); }}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                  background: statusFilter === s ? 'rgba(59,130,246,0.2)' : 'transparent',
                  color: statusFilter === s ? '#60A5FA' : 'rgba(255,255,255,0.5)',
                  fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => loadHighlights(true)}
            style={{
              padding: '8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {loading && highlights.length === 0 ? (
          <LoadingSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            columns={columns}
            data={highlights}
            emptyMessage="No highlights found. Run episode detection to generate them."
            onRowClick={(row) => row.id && navigate(`/admin/highlights/${row.id}`)}
          />
        )}

        {total > 0 && (
          <div style={{ marginTop: 16 }}>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goTo}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
