import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, Button, Input, Avatar, Switch, Card, ConfirmDialog, StatCard } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { changePassword, deleteUser } from '../../services/data';
import { Save, Camera, Moon, Sun, Palette, Trash2, Download, Globe, Headphones, Clock, Award } from 'lucide-react';

const ACCENT_COLORS = [
  { name: 'Purple', value: '#8B3DFF', var: '--color-accent-purple' },
  { name: 'Blue', value: '#00A8FF', var: '--color-accent-blue' },
  { name: 'Orange', value: '#FF7A00', var: '--color-accent-orange' },
  { name: 'Green', value: '#22C55E', var: '--color-success' },
  { name: 'Pink', value: '#EC4899', var: '--color-accent-pink' },
];

const THEMES = [
  { id: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright' },
  { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easier on the eyes' },
];

export default function UserProfile() {
  const { user, updateProfile, logout } = useAuth();
  const addToast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'light');
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0].name);
  const [notifications, setNotifications] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    push: user?.preferences?.notifications?.push ?? false,
    digest: user?.preferences?.notifications?.digest ?? true,
  });
  const [socialTwitter, setSocialTwitter] = useState(user?.social?.twitter || '');
  const [socialGithub, setSocialGithub] = useState(user?.social?.github || '');
  const [socialLinkedin, setSocialLinkedin] = useState(user?.social?.linkedin || '');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name,
        bio,
        social: { twitter: socialTwitter, github: socialGithub, linkedin: socialLinkedin },
        preferences: { theme, notifications, accentColor },
      });
      addToast('Profile updated successfully!', 'success');
    } catch {
      addToast('Failed to update profile.', 'error');
    }
    setSaving(false);
  };

  const handlePasswordSave = async () => {
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }
    try {
      await changePassword(user.id, currentPassword, newPassword);
      addToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to change password.';
      addToast(msg, 'error');
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportData = () => {
    const data = {
      profile: { name: user?.name, email: user?.email, bio },
      preferences: { theme, notifications },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'podcastai-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported successfully!', 'success');
  };

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const activityStats = [
    { label: 'Total Listening Time', value: '843 hrs', icon: Clock, color: 'var(--color-accent-purple)' },
    { label: 'Episodes Completed', value: '342', icon: Headphones, color: 'var(--color-accent-blue)' },
    { label: 'Listening Streak', value: '12 days', icon: Award, color: 'var(--color-accent-orange)' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Profile Settings" description="Manage your account, appearance, and preferences." />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Activity Stats */}
          <div className="grid grid-cols-3 gap-4">
            {activityStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} change="" trend="up" icon={stat.icon} color={stat.color} />
            ))}
          </div>

          {/* Profile Section */}
          <Card variant="elevated">
            <h3 className="text-card font-semibold mb-6">Profile Information</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Avatar name={user?.name} size="xl" />
                <button
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-accent-purple)] flex items-center justify-center text-white hover:bg-[var(--color-accent-purple-light)] transition-colors"
                  aria-label="Change avatar"
                >
                  <Camera size={12} aria-hidden="true" />
                </button>
              </div>
              <div>
                <p className="text-body font-medium">{user?.name}</p>
                <p className="text-small text-[var(--text-tertiary)]">{user?.email}</p>
                <p className="text-caption text-[var(--text-tertiary)]">Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              <div>
                <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Email</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 text-body bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-tertiary)] cursor-not-allowed"
                  aria-label="Email address (read-only)"
                />
                <p className="text-caption text-[var(--text-tertiary)] mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="text-small font-medium text-[var(--text-secondary)] block mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-body bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none resize-none focus:border-[var(--color-accent-purple)] focus:shadow-[var(--glow-purple)] transition-all duration-200"
                  aria-label="Bio"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Twitter"
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  placeholder="@username"
                  icon={<Globe size={14} />}
                />
                <Input
                  label="GitHub"
                  value={socialGithub}
                  onChange={(e) => setSocialGithub(e.target.value)}
                  placeholder="username"
                  icon={<Globe size={14} />}
                />
                <Input
                  label="LinkedIn"
                  value={socialLinkedin}
                  onChange={(e) => setSocialLinkedin(e.target.value)}
                  placeholder="username"
                  icon={<Globe size={14} />}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" size="md" onClick={handleProfileSave} disabled={saving}>
                  <Save size={16} aria-hidden="true" /> {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="ghost" size="md" onClick={handleExportData}>
                  <Download size={16} aria-hidden="true" /> Export Data
                </Button>
              </div>
            </div>
          </Card>

          {/* Password Section */}
          <Card variant="elevated">
            <h3 className="text-card font-semibold mb-6">Change Password</h3>
            <div className="space-y-4 max-w-sm">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <Button variant="primary" size="md" onClick={handlePasswordSave}>
                Update Password
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Appearance */}
          <Card variant="elevated">
            <h3 className="text-card font-semibold mb-6 flex items-center gap-2">
              <Palette size={16} className="text-[var(--color-accent-purple-light)]" /> Appearance
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-small font-medium text-[var(--text-secondary)] block mb-3">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((t) => {
                    const Icon = t.icon;
                    const isActive = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border transition-all ${
                          isActive
                            ? 'border-[var(--color-accent-purple)] bg-[var(--color-accent-purple)]/10 text-[var(--color-accent-purple-light)]'
                            : 'border-[var(--color-border)] text-[var(--text-secondary)] hover:border-[var(--color-border-light)]'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-small">{t.label}</span>
                        <span className="text-caption">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-small font-medium text-[var(--text-secondary)] block mb-3">Accent Color</label>
                <div className="flex gap-3">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setAccentColor(c.name)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        accentColor === c.name ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface)] scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.value }}
                      aria-label={`${c.name} accent color${accentColor === c.name ? ' (active)' : ''}`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card variant="elevated">
            <h3 className="text-card font-semibold mb-6">Notifications</h3>
            <div className="space-y-5">
              <Switch
                label="Email notifications"
                description="Receive updates via email"
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
              />
              <Switch
                label="Push notifications"
                description="Browser push alerts"
                checked={notifications.push}
                onChange={() => handleNotificationChange('push')}
              />
              <Switch
                label="Weekly digest"
                description="Weekly summary of activity"
                checked={notifications.digest}
                onChange={() => handleNotificationChange('digest')}
              />
            </div>
          </Card>

          {/* Account */}
          <Card variant="elevated">
            <h3 className="text-card font-semibold mb-4">Account</h3>
            <div className="space-y-4">
              <div>
                <p className="text-small text-[var(--text-tertiary)]">
                  Role: <span className="text-[var(--color-accent-purple-light)] capitalize font-medium">{user?.role || 'user'}</span>
                </p>
                <p className="text-small text-[var(--text-tertiary)]">
                  User ID: <span className="text-[var(--text-secondary)]">{user?.id}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-border)]">
                <Button variant="ghost" size="sm" onClick={logout} className="text-[var(--color-danger)] hover:text-[var(--color-danger)] justify-start">
                  Sign Out
                </Button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-3 py-2 text-small text-[var(--text-tertiary)] hover:text-[var(--color-danger)] rounded-[var(--radius-md)] hover:bg-[var(--color-danger)]/10 transition-all"
                >
                  <Trash2 size={14} /> Delete Account
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          try {
            await deleteUser(user.id);
            addToast('Account deleted.', 'info');
          } catch {
            addToast('Failed to delete account.', 'error');
          }
          setShowDeleteConfirm(false);
          logout();
        }}
        title="Delete Account?"
        message="This action is permanent. All your data, saved podcasts, playlists, and history will be removed."
        confirmLabel="Delete My Account"
        variant="danger"
      />
    </div>
  );
}
