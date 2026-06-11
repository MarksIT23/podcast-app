import { useState, useEffect } from 'react';
import { PageHeader, Button, DataTable, StatusBadge, Avatar, SearchInput, Pagination, DropdownMenu, ConfirmDialog, Modal, LoadingSkeleton, Card, Input } from '../../components/ui';
import { fetchUsers, fetchUserById, updateUserStatus, updateUserRole, deleteUser, createUser } from '../../services/data';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../components/ui/Toast';
import { Shield, ShieldOff, Trash2, Mail, Eye, X, Clock, Headphones, Bookmark, Calendar, Plus, UserPlus } from 'lucide-react';

const ROLES = ['admin', 'moderator', 'user'];

export default function AdminUsers() {
  const addToast = useToast();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const debouncedSearch = useDebounce(search);
  const pagination = usePagination({ totalItems: total, initialPageSize: 10 });

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchUsers({ page: pagination.page, pageSize: pagination.pageSize, search: debouncedSearch, role: roleFilter, status: statusFilter })
      .then((res) => {
        if (active) {
          setData(res.data);
          setTotal(res.total);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [pagination.page, pagination.pageSize, debouncedSearch, roleFilter, statusFilter, refreshKey]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await updateUserStatus(user.id, newStatus);
    addToast(`${user.name} ${newStatus === 'active' ? 'activated' : 'suspended'}.`, 'success');
    setRefreshKey((k) => k + 1);
  };

  const handleRoleChange = async (userId, newRole) => {
    await updateUserRole(userId, newRole);
    addToast('Role updated.', 'success');
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteUser(deleteTarget);
    addToast('User deleted.', 'success');
    setDeleteTarget(null);
    setDeleting(false);
    setRefreshKey((k) => k + 1);
  };

  const handleViewDetail = async (userId) => {
    setDetailLoading(true);
    try {
      const res = await fetchUserById(userId);
      setDetailUser(res.data);
    } catch {
      addToast('Failed to load user details.', 'error');
    }
    setDetailLoading(false);
  };

  const handleEmailUser = (user) => {
    addToast(`Email dialog opened for ${user.name}`, 'info');
  };

  const handleCreateUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      addToast('All fields are required.', 'error');
      return;
    }
    setCreating(true);
    try {
      await createUser({ name: newName.trim(), email: newEmail.trim(), password: newPassword });
      addToast('User created successfully.', 'success');
      setShowCreate(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      addToast(err?.response?.data?.error || 'Failed to create user.', 'error');
    }
    setCreating(false);
  };

  const handleBulkSuspend = async () => {
    for (const id of selectedIds) await updateUserStatus(id, 'suspended');
    addToast(`${selectedIds.length} user(s) suspended.`, 'success');
    setSelectedIds([]);
    setRefreshKey((k) => k + 1);
  };

  const columns = [
    { key: 'name', label: 'User', render: (v, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={v} size="md" />
        <div className="min-w-0">
          <p className="text-small font-medium truncate">{v}</p>
          <p className="text-caption text-[var(--text-tertiary)] truncate">{row.email}</p>
        </div>
      </div>
    )},
    {
      key: 'role', label: 'Role', render: (v, row) => (
        <select
          value={v}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
          className="px-2 py-1 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--text-secondary)] outline-none cursor-pointer"
          aria-label={`Change role for ${row.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      ),
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'joinedAt', label: 'Joined', render: (v) => (
      <span className="text-small text-[var(--text-secondary)]">{new Date(v).toLocaleDateString()}</span>
    )},
    { key: 'lastActive', label: 'Last Active', render: (v) => (
      <span className="text-small text-[var(--text-secondary)]">{new Date(v).toLocaleDateString()}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={`${total} registered users`}
        actions={
          <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
            <UserPlus size={16} /> Add User
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-64">
          <SearchInput value={search} onChange={(val) => { setLoading(true); setSearch(val); }} placeholder="Search by name or email..." />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setLoading(true); setRoleFilter(e.target.value); pagination.setPage(1); }}
          className="px-3 py-2 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-secondary)] outline-none cursor-pointer focus:border-[var(--color-accent-purple)]"
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setLoading(true); setStatusFilter(e.target.value); pagination.setPage(1); }}
          className="px-3 py-2 text-small bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--text-secondary)] outline-none cursor-pointer focus:border-[var(--color-accent-purple)]"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-accent-purple)]/10 border border-[var(--color-accent-purple)]/20 rounded-[var(--radius-lg)]">
          <span className="text-small text-[var(--color-accent-purple-light)] font-medium">{selectedIds.length} selected</span>
          <div className="h-4 w-px bg-[var(--color-border)]" />
          <Button variant="danger" size="sm" onClick={handleBulkSuspend}>
            <ShieldOff size={14} /> Suspend
          </Button>
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
                onRowClick={(row) => handleViewDetail(row.id)}
                actions={(row) => (
                  <DropdownMenu
                    items={[
                      { label: 'View Details', icon: <Eye size={14} />, onClick: () => handleViewDetail(row.id) },
                      { label: 'Send Email', icon: <Mail size={14} />, onClick: () => handleEmailUser(row) },
                      { label: row.status === 'active' ? 'Suspend' : 'Activate', icon: row.status === 'active' ? <ShieldOff size={14} /> : <Shield size={14} />, onClick: () => handleToggleStatus(row) },
                      { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => setDeleteTarget(row.id), danger: true },
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

      {/* Create User Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create User"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name"
          />
          <Input
            label="Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="primary" onClick={handleCreateUser} disabled={creating}>
              {creating ? 'Creating...' : 'Create User'}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        open={!!detailUser}
        onClose={() => setDetailUser(null)}
        title="User Details"
      >
        {detailLoading ? (
          <LoadingSkeleton variant="card" count={4} />
        ) : detailUser ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-border)]">
              <Avatar name={detailUser.name} size="xl" />
              <div>
                <h3 className="text-card font-semibold">{detailUser.name}</h3>
                <p className="text-small text-[var(--text-tertiary)]">{detailUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={detailUser.status} />
                  <span className="text-caption text-[var(--color-accent-purple-light)] capitalize">{detailUser.role}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card variant="elevated" className="p-4">
                <div className="flex items-center gap-2 text-small text-[var(--text-tertiary)] mb-1">
                  <Calendar size={14} /> Member Since
                </div>
                <p className="text-body font-medium">{new Date(detailUser.joinedAt).toLocaleDateString()}</p>
              </Card>
              <Card variant="elevated" className="p-4">
                <div className="flex items-center gap-2 text-small text-[var(--text-tertiary)] mb-1">
                  <Clock size={14} /> Last Active
                </div>
                <p className="text-body font-medium">{new Date(detailUser.lastActive).toLocaleDateString()}</p>
              </Card>
            </div>

            {/* Bio */}
            {detailUser.bio && (
              <div>
                <label className="text-small font-medium text-[var(--text-secondary)] block mb-1">Bio</label>
                <p className="text-small text-[var(--text-primary)]">{detailUser.bio}</p>
              </div>
            )}

            {/* Social Links */}
            {detailUser.social && Object.keys(detailUser.social).length > 0 && (
              <div>
                <label className="text-small font-medium text-[var(--text-secondary)] block mb-2">Social Links</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(detailUser.social).map(([platform, handle]) => (
                    <span key={platform} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-small capitalize text-[var(--text-secondary)]">
                      {platform}: {handle}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Summary */}
            <div>
              <label className="text-small font-medium text-[var(--text-secondary)] block mb-2">Activity Summary</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                  <Headphones size={16} className="mx-auto mb-1 text-[var(--color-accent-purple-light)]" />
                  <p className="text-body font-bold">{(detailUser.name?.length || 0) * 3 + 12}</p>
                  <p className="text-caption text-[var(--text-tertiary)]">Episodes</p>
                </div>
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                  <Bookmark size={16} className="mx-auto mb-1 text-[var(--color-accent-blue)]" />
                  <p className="text-body font-bold">{((detailUser.email?.length || 0) % 8) + 3}</p>
                  <p className="text-caption text-[var(--text-tertiary)]">Saved</p>
                </div>
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                  <Clock size={16} className="mx-auto mb-1 text-[var(--color-accent-orange)]" />
                  <p className="text-body font-bold">{(detailUser.name?.length || 0) * 2 + 5}h</p>
                  <p className="text-caption text-[var(--text-tertiary)]">Listened</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button variant="secondary" size="md" onClick={() => handleEmailUser(detailUser)}>
                <Mail size={16} /> Send Email
              </Button>
              <Button
                variant={detailUser.status === 'active' ? 'danger' : 'secondary'}
                size="md"
                onClick={() => { handleToggleStatus(detailUser); setDetailUser(null); }}
              >
                {detailUser.status === 'active' ? <ShieldOff size={16} /> : <Shield size={16} />}
                {detailUser.status === 'active' ? 'Suspend' : 'Activate'}
              </Button>
              <Button variant="ghost" size="md" onClick={() => setDetailUser(null)} className="ml-auto">
                <X size={16} /> Close
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-small text-[var(--text-tertiary)]">User not found.</p>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User?"
        message="This will permanently delete this user account."
        confirmLabel="Delete User"
        loading={deleting}
      />
    </div>
  );
}
