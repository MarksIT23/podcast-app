import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, Button, Input, Switch, Card, Breadcrumbs, LoadingSkeleton, StatusBadge } from '../../components/ui';
import { Image, Rss } from 'lucide-react';
import { fetchPodcastById, createPodcast, updatePodcast, fetchCategories } from '../../services/data';
import { useToast } from '../../components/ui/Toast';
import { Save, ArrowLeft } from 'lucide-react';

export default function AdminPodcastForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const addToast = useToast();

  const [form, setForm] = useState({
    title: '',
    host: '',
    description: '',
    categoryIds: [],
    coverImage: 'https://picsum.photos/seed/podcast/400/400',
    status: 'draft',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [feeds, setFeeds] = useState([]);

  useEffect(() => {
    fetchCategories().then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchPodcastById(id).then((res) => {
        setForm({
          title: res.data.title,
          host: res.data.host,
          description: res.data.description,
          categoryIds: res.data.categoryIds || [],
          coverImage: res.data.coverImage,
          status: res.data.status,
        });
        setFeeds(res.data.feeds || []);
        setLoading(false);
      }).catch(() => {
        addToast('Podcast not found.', 'error');
        navigate('/admin/podcasts');
      });
    }
  }, [id, isEdit, navigate, addToast]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.host.trim()) errs.host = 'Host is required';
    if (!form.categoryIds.length) errs.categoryIds = 'At least one category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    // Build payload: send categoryIds array
    const payload = {
      title: form.title,
      host: form.host,
      description: form.description,
      coverImage: form.coverImage,
      status: form.status,
      categoryIds: form.categoryIds,
    };

    try {
      if (isEdit) {
        await updatePodcast(id, payload);
        addToast('Podcast updated successfully!', 'success');
      } else {
        await createPodcast(payload);
        addToast('Podcast created successfully!', 'success');
      }
      navigate('/admin/podcasts');
    } catch {
      addToast('Failed to save podcast.', 'error');
    }
    setSaving(false);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={isEdit ? 'Edit Podcast' : 'Create Podcast'} />
        <LoadingSkeleton variant="card" count={4} />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Podcasts', href: '/admin/podcasts' },
          { label: isEdit ? 'Edit Podcast' : 'Create Podcast' },
        ]}
        className="mb-2"
      />
      <PageHeader
        title={isEdit ? 'Edit Podcast' : 'Create Podcast'}
        description={isEdit ? `Editing "${form.title}"` : 'Add a new podcast to the platform.'}
        actions={
          <div className="flex gap-3">
            <Button variant="ghost" size="md" onClick={() => navigate('/admin/podcasts')}>
              <ArrowLeft size={16} aria-hidden="true" /> Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSubmit} disabled={saving}>
              <Save size={16} aria-hidden="true" /> {saving ? 'Saving...' : 'Save Podcast'}
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated">
            <h3 className="text-card font-semibold mb-6">Details</h3>
            <div className="space-y-4">
              <Input
                label="Podcast Title"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter podcast title"
                error={errors.title}
              />
              <Input
                label="Host Name"
                value={form.host}
                onChange={(e) => updateField('host', e.target.value)}
                placeholder="Enter host name"
                error={errors.host}
              />
              <div>
                <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your podcast..."
                  rows={4}
                  className="w-full px-4 py-2.5 text-body bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none resize-none focus:border-[var(--color-accent-purple)] focus:shadow-[var(--glow-purple)] transition-all duration-200"
                  aria-label="Podcast description"
                />
              </div>
              <div>
                <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const selected = form.categoryIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          const next = selected
                            ? form.categoryIds.filter((id) => id !== c.id)
                            : [...form.categoryIds, c.id];
                          setForm((prev) => ({ ...prev, categoryIds: next }));
                          if (errors.categoryIds) setErrors((prev) => ({ ...prev, categoryIds: undefined }));
                        }}
                        className={`px-3 py-1.5 text-small rounded-full border transition-all ${
                          selected
                            ? 'bg-[var(--color-accent-purple)]/15 border-[var(--color-accent-purple)] text-[var(--color-accent-purple-light)]'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--text-secondary)] hover:border-[var(--color-accent-purple)]/50'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                {errors.categoryIds && <p className="text-small text-[var(--color-danger)] mt-1">{errors.categoryIds}</p>}
              </div>
              <Input
                label="Cover Image URL"
                value={form.coverImage}
                onChange={(e) => updateField('coverImage', e.target.value)}
                placeholder="https://picsum.photos/seed/podcast/400/400"
                helperText="Enter a URL for the podcast cover image"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="elevated">
            <h3 className="text-card font-semibold mb-6">Status</h3>
            <Switch
              label="Published"
              checked={form.status === 'published'}
              onChange={(v) => updateField('status', v ? 'published' : 'draft')}
            />
            <p className="text-caption text-[var(--text-tertiary)] mt-2">
              {form.status === 'published' ? 'Podcast is visible to users.' : 'Podcast is in draft mode.'}
            </p>
          </Card>

          <Card variant="elevated">
            <h3 className="text-card font-semibold mb-4">Preview</h3>
            <div className="aspect-video rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-accent-purple)]/20 to-[var(--color-accent-blue)]/10 flex items-center justify-center mb-3 relative overflow-hidden">
              {form.coverImage ? (
                <img src={form.coverImage} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center" style={{ display: form.coverImage ? 'none' : 'flex' }}>
                <Image size={40} className="text-[var(--text-tertiary)]" />
              </div>
            </div>
            <p className="text-small font-medium truncate">{form.title || 'Podcast Title'}</p>
            <p className="text-caption text-[var(--text-tertiary)] truncate">{form.host || 'Host Name'}</p>
            <p className="text-caption text-[var(--text-tertiary)] mt-2">
              {form.categoryIds.length ? categories.filter(c => form.categoryIds.includes(c.id)).map(c => c.name).join(', ') : 'No category selected'}
            </p>
          </Card>
        </div>
      </div>

      {/* Linked Feeds (edit mode only) */}
      {isEdit && feeds.length > 0 && (
        <Card variant="elevated" className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Rss size={16} className="text-[var(--color-accent-purple-light)]" />
            <h3 className="text-card font-semibold">Linked Feeds</h3>
            <span className="text-caption text-[var(--text-tertiary)] ml-1">({feeds.length} feed{feeds.length > 1 ? 's' : ''})</span>
          </div>
          <div className="space-y-2">
            {feeds.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]">
                <div className="min-w-0 flex-1">
                  <p className="text-small font-mono text-[var(--text-primary)] truncate" title={f.url}>{f.url}</p>
                  <p className="text-caption text-[var(--text-tertiary)] mt-0.5">
                    {f.episodeCount} episode{f.episodeCount !== 1 ? 's' : ''}
                    {f.lastFetched ? ` · Last fetched: ${new Date(f.lastFetched).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <StatusBadge variant={f.status === 'active' ? 'success' : f.status === 'failed' ? 'danger' : 'warning'}>{f.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
