import { useState, useEffect } from 'react';
import { PageHeader, Card, Button, DataTable, Modal, Input, LoadingSkeleton, Pagination } from '../../components/ui';
import { fetchHighlightCollections, createHighlightCollection, updateHighlightCollection, deleteHighlightCollection } from '../../services/data';
import { useToast } from '../../components/ui/Toast';
import { Plus, Edit3, Trash2, Palette } from 'lucide-react';

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true, render: (v, row) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 12, height: 12, borderRadius: 4, background: row.color || '#3B82F6', flexShrink: 0 }} />
      <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span>
    </div>
  )},
  { key: 'highlights', label: 'Highlights', sortable: true, render: (v, row) => (
    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
      {row._count?.highlights ?? 0}
    </span>
  )},
  { key: 'slug', label: 'Slug', sortable: true, render: (v) => (
    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', fontFamily: 'monospace' }}>{v}</span>
  )},
  { key: 'description', label: 'Description', sortable: false, render: (v) => (
    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', maxWidth: 250, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {v || '—'}
    </span>
  )},
];

export default function AdminHighlightCollections() {
  const addToast = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#3B82F6' });

  const loadCollections = () => {
    setLoading(true);
    fetchHighlightCollections()
      .then((res) => setCollections(res.data || []))
      .catch(() => addToast('Failed to load collections.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCollections(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ name: '', description: '', color: '#3B82F6' });
    setShowModal(true);
  };

  const openEdit = (col) => {
    setEditingId(col.id);
    setForm({ name: col.name, description: col.description || '', color: col.color || '#3B82F6' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { addToast('Name is required.', 'error'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await updateHighlightCollection(editingId, form);
        addToast('Collection updated.', 'success');
      } else {
        await createHighlightCollection(form);
        addToast('Collection created.', 'success');
      }
      setShowModal(false);
      loadCollections();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save collection.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (col) => {
    if (!confirm(`Delete collection "${col.name}"? Highlights will be unlinked.`)) return;
    try {
      await deleteHighlightCollection(col.id);
      addToast('Collection deleted.', 'success');
      loadCollections();
    } catch {
      addToast('Failed to delete collection.', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Highlight Collections"
        description="Organize highlights into themed collections"
        breadcrumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Collections' }]}
        actions={
          <Button variant="primary" onClick={openNew}>
            <Plus size={16} /> New Collection
          </Button>
        }
      />

      <Card>
        {loading ? (
          <LoadingSkeleton rows={5} columns={4} />
        ) : (
          <DataTable
            columns={[
              ...COLUMNS,
              {
                key: 'actions', label: 'Actions', sortable: false,
                render: (v, row) => (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(row)} style={actionBtnStyle}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(row)} style={actionBtnStyle}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={collections}
            emptyMessage="No collections yet. Create your first one!"
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Collection' : 'New Collection'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 500 }}>Name</label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Best of Tech"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 500 }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8, resize: 'vertical',
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 500 }}>Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                style={{ width: 40, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer', padding: 0 }}
              />
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{form.color}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {['#3B82F6', '#8B5CF6', '#1DB954', '#F97316', '#F472B6', '#FDE047'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 24, height: 24, borderRadius: 6, border: form.color === c ? '2px solid #fff' : '2px solid transparent',
                      background: c, cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const actionBtnStyle = {
  width: 30, height: 30, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
  background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
