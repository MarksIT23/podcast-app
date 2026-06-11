import { useState, useEffect } from 'react';

import { PageHeader, Card, Button, Switch, Input, Tabs, LoadingSkeleton } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { fetchSettings, updateSettings } from '../../services/data';
import { Save, RefreshCw, Eye, EyeOff, Server, Activity, CheckCircle, Wifi } from 'lucide-react';

function SettingSection({ title, description, children }) {
  return (
    <Card variant="elevated" className="p-6">
      <h3 className="text-card font-semibold mb-1">{title}</h3>
      {description && <p className="text-small text-[var(--text-tertiary)] mb-6">{description}</p>}
      <div className="space-y-5">{children}</div>
    </Card>
  );
}

function SaveButton({ onClick, label = 'Save Changes', saving = false }) {
  return (
    <Button variant="primary" size="md" onClick={onClick} disabled={saving}>
      {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
      {saving ? 'Saving...' : label}
    </Button>
  );
}

function TestConnectionButton({ label = 'Test Connection' }) {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);
  const addToast = useToast();

  const handleTest = async () => {
    setTesting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus('success');
      addToast(data.message || 'Connection successful!', 'success');
    } catch {
      setStatus('error');
      addToast('Connection failed: server unreachable.', 'error');
    }
    setTesting(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={handleTest} disabled={testing}>
        {testing ? <RefreshCw size={14} className="animate-spin" /> : <Wifi size={14} />}
        {testing ? 'Testing...' : label}
      </Button>
      {status === 'success' && <CheckCircle size={16} className="text-[var(--color-success)]" />}
    </div>
  );
}

const DEFAULTS = {
  general: { siteName: 'Podora', description: 'Modern podcast platform', maintenance: false, registration: true },
  integrations: { openaiKey: '', stripeKey: '', analyticsId: '' },
  moderation: { autoModerate: true, contentFilter: 'medium', reportThreshold: 3 },
  security: { twoFactor: false, passwordMinLength: 8, sessionTimeout: 60, rateLimiting: true },
};

export default function AdminSettings() {
  const addToast = useToast();
  const [saving, setSaving] = useState({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settings, setSettings] = useState(DEFAULTS);

  const [auditLog] = useState([
    { action: 'Settings updated', user: 'Sarah Chen', timestamp: '2026-06-08T10:30:00Z', detail: 'Updated general settings' },
    { action: 'User suspended', user: 'David Kim', timestamp: '2026-06-07T14:15:00Z', detail: 'Suspended user #5 (Emily Park)' },
    { action: 'Podcast created', user: 'Sarah Chen', timestamp: '2026-06-07T11:00:00Z', detail: 'Created "Data Deep Dive"' },
    { action: 'Role changed', user: 'David Kim', timestamp: '2026-06-06T09:00:00Z', detail: 'Promoted Sophie Martin to moderator' },
    { action: 'Analytics exported', user: 'Sarah Chen', timestamp: '2026-06-05T16:45:00Z', detail: 'Exported 30d analytics CSV' },
  ]);

  useEffect(() => {
    fetchSettings()
      .then((res) => {
        const merged = { ...DEFAULTS };
        for (const [key, value] of Object.entries(res.data || {})) {
          if (value && typeof value === 'object') {
            merged[key] = { ...DEFAULTS[key], ...value };
          }
        }
        setSettings(merged);
      })
      .catch(() => {
        // Backend unavailable — use defaults silently
      })
      .finally(() => setLoadingSettings(false));
  }, []);

  const updateSetting = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = async (section) => {
    setSaving((prev) => ({ ...prev, [section]: true }));
    try {
      await updateSettings({ [section]: settings[section] });
      addToast(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved.`, 'success');
    } catch {
      addToast('Failed to save settings.', 'error');
    }
    setSaving((prev) => ({ ...prev, [section]: false }));
  };

  const tabs = [
    {
      id: 'general',
      label: 'General',
      content: (
        <div className="space-y-6">
          <SettingSection title="Site Settings" description="Configure your platform name and description.">
            <Input
              label="Site Name"
              value={settings.general.siteName}
              onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
              placeholder="Podora"
            />
            <div>
              <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Description</label>
              <textarea
                value={settings.general.description}
                onChange={(e) => updateSetting('general', 'description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 text-body bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none resize-none focus:border-[var(--color-accent-purple)] transition-all"
                aria-label="Site description"
              />
            </div>
            <div className="pt-2">
              <Switch
                label="Allow user registration"
                checked={settings.general.registration}
                onChange={(v) => updateSetting('general', 'registration', v)}
              />
            </div>
            <div className="pt-2">
              <Switch
                label="Maintenance mode"
                description="Show a maintenance page to users"
                checked={settings.general.maintenance}
                onChange={(v) => updateSetting('general', 'maintenance', v)}
              />
              {settings.general.maintenance && (
                <p className="text-small text-[var(--color-warning)] mt-2 flex items-center gap-1">
                  <Server size={14} /> Site will be inaccessible to regular users.
                </p>
              )}
            </div>
          </SettingSection>
          <SaveButton onClick={() => handleSave('general')} saving={saving.general} />
        </div>
      ),
    },
    {
      id: 'integrations',
      label: 'Integrations',
      content: (
        <div className="space-y-6">
          <SettingSection title="API Keys" description="Configure external service integrations.">
            <div className="relative">
              <Input
                label="OpenAI API Key"
                type={showApiKey ? 'text' : 'password'}
                value={settings.integrations.openaiKey}
                onChange={(e) => updateSetting('integrations', 'openaiKey', e.target.value)}
                placeholder="sk-..."
                helperText="Used for AI-powered summaries"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-[calc(50%-4px)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                aria-label="Toggle API key visibility"
              >
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <Input
              label="Stripe Secret Key"
              type="password"
              value={settings.integrations.stripeKey}
              onChange={(e) => updateSetting('integrations', 'stripeKey', e.target.value)}
              placeholder="sk_live_..."
            />
            <Input
              label="Google Analytics ID"
              value={settings.integrations.analyticsId}
              onChange={(e) => updateSetting('integrations', 'analyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
            <TestConnectionButton onTest={() => {}} label="Test OpenAI Connection" />
          </SettingSection>
          <SaveButton onClick={() => handleSave('integrations')} saving={saving.integrations} />
        </div>
      ),
    },
    {
      id: 'moderation',
      label: 'Moderation',
      content: (
        <div className="space-y-6">
          <SettingSection title="Content Moderation" description="Manage content filtering and moderation rules.">
            <Switch
              label="Auto-moderation"
              description="Automatically flag potentially inappropriate content"
              checked={settings.moderation.autoModerate}
              onChange={(v) => updateSetting('moderation', 'autoModerate', v)}
            />
            <div>
              <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Content Filter Sensitivity</label>
              <select
                value={settings.moderation.contentFilter}
                onChange={(e) => updateSetting('moderation', 'contentFilter', e.target.value)}
                className="w-full px-4 py-2.5 text-body bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent-purple)]"
                aria-label="Content filter sensitivity"
              >
                <option value="low">Low — Only flag explicit content</option>
                <option value="medium">Medium — Flag sensitive content</option>
                <option value="high">High — Maximum filtering</option>
              </select>
            </div>
            <div>
              <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Report Threshold</label>
              <input
                type="number"
                value={settings.moderation.reportThreshold}
                onChange={(e) => updateSetting('moderation', 'reportThreshold', Number(e.target.value))}
                min={1}
                max={20}
                className="w-24 px-3 py-2 text-body bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent-purple)]"
                aria-label="Report threshold"
              />
              <p className="text-caption text-[var(--text-tertiary)] mt-1">Reports needed before auto-flagging content</p>
            </div>
          </SettingSection>
          <SaveButton onClick={() => handleSave('moderation')} saving={saving.moderation} />
        </div>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      content: (
        <div className="space-y-6">
          <SettingSection title="Security Settings" description="Configure platform security and access control.">
            <Switch
              label="Require 2FA for Admin accounts"
              description="Admins must set up two-factor authentication"
              checked={settings.security.twoFactor}
              onChange={(v) => updateSetting('security', 'twoFactor', v)}
            />
            <Switch
              label="Rate limiting"
              description="Protect against brute force and DDoS attacks"
              checked={settings.security.rateLimiting}
              onChange={(v) => updateSetting('security', 'rateLimiting', v)}
            />
            <div>
              <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Minimum Password Length</label>
              <input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => updateSetting('security', 'passwordMinLength', Number(e.target.value))}
                min={6}
                max={32}
                className="w-24 px-3 py-2 text-body bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent-purple)]"
                aria-label="Minimum password length"
              />
            </div>
            <div>
              <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                min={15}
                max={480}
                step={15}
                className="w-24 px-3 py-2 text-body bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent-purple)]"
                aria-label="Session timeout in minutes"
              />
            </div>
          </SettingSection>

          <SettingSection title="Audit Log" description="Recent security and administrative events.">
            <div className="space-y-3">
              {auditLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-[var(--color-border)] last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-purple)]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity size={14} className="text-[var(--color-accent-purple-light)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-small text-[var(--text-primary)]">{entry.action}</p>
                    <p className="text-caption text-[var(--text-tertiary)]">{entry.detail} · by {entry.user}</p>
                  </div>
                  <span className="text-caption text-[var(--text-tertiary)] shrink-0">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-3">
              <Button variant="ghost" size="sm">View Full Audit Log</Button>
            </div>
          </SettingSection>
          <SaveButton onClick={() => handleSave('security')} saving={saving.security} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage platform configuration." />

      <Tabs tabs={tabs} defaultTab="general" />
    </div>
  );
}
