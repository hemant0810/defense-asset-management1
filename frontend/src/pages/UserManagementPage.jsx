import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { baseService } from '../services/baseService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PlusIcon } from '../components/common/Icons';

export const UserManagementPage = () => {
  const { showSuccess, showError } = useToast();

  const [bases, setBases] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'LOGISTICS_OFFICER',
    baseId: '',
  });

  useEffect(() => {
    baseService.getAll().then((data) => setBases(data || [])).catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll({ page, size: 10, search: search.trim() || undefined });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showError('Failed to load user catalog');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: 'LOGISTICS_OFFICER',
      baseId: bases[0]?.id || '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      baseId: user.baseId || '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        baseId: formData.baseId ? Number(formData.baseId) : null,
      };

      if (selectedUser) {
        await userService.update(selectedUser.id, payload);
        showSuccess(`User '${formData.username}' updated successfully!`);
      } else {
        await userService.create(payload);
        showSuccess(`User '${formData.username}' created successfully!`);
      }

      setIsFormModalOpen(false);
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      await userService.delete(selectedUser.id);
      showSuccess(`User '${selectedUser.username}' deleted successfully`);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User & Role Management</h1>
          <p className="page-description">
            Administer officer credentials, military roles, and assigned operational installations.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusIcon className="w-4 h-4" />
          <span>Add New Operator</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="filter-card" style={{ gridTemplateColumns: '1fr' }}>
        <div className="form-group">
          <label className="form-label">Search Users</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by username, full name, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {isLoading ? (
          <LoadingSpinner text="Fetching operator directory..." />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="No users match your search query." />
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Clearance / Role</th>
                    <th>Assigned Installation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                        {u.username}
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${
                          u.role === 'ADMIN' ? 'badge-primary' :
                          u.role === 'BASE_COMMANDER' ? 'badge-warning' : 'badge-neutral'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.baseName || 'Global Command'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(u)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleOpenDelete(u)}
                            disabled={u.username === 'admin'}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedUser ? `Edit Operator: ${selectedUser.username}` : 'Register New Operator'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleFormSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (selectedUser ? 'Update Profile' : 'Create Operator')}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              type="text"
              className="form-control"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{selectedUser ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!selectedUser}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name & Rank *</label>
            <input
              type="text"
              className="form-control"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Security Role *</label>
            <select
              className="form-control"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="ADMIN">ADMIN (Full System Access)</option>
              <option value="BASE_COMMANDER">BASE_COMMANDER (Scoped to Base)</option>
              <option value="LOGISTICS_OFFICER">LOGISTICS_OFFICER (Purchases & Transfers)</option>
            </select>
          </div>

          {formData.role !== 'ADMIN' && (
            <div className="form-group">
              <label className="form-label">Assigned Base *</label>
              <select
                className="form-control"
                value={formData.baseId}
                onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                required
              >
                <option value="">Select Base</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Revoke Operator Access"
        message={`Are you sure you want to delete user '${selectedUser?.username}'? This action is permanent and recorded in the audit trail.`}
        confirmText="Revoke & Delete"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
