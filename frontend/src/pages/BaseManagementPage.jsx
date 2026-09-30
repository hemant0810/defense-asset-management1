import React, { useState, useEffect } from 'react';
import { baseService } from '../services/baseService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PlusIcon } from '../components/common/Icons';

export const BaseManagementPage = () => {
  const { showSuccess, showError } = useToast();

  const [bases, setBases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBase, setSelectedBase] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', location: '' });

  const fetchBases = async () => {
    try {
      setIsLoading(true);
      const data = await baseService.getAll();
      setBases(data || []);
    } catch (err) {
      showError('Failed to load operational bases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBases();
  }, []);

  const handleOpenAdd = () => {
    setSelectedBase(null);
    setFormData({ name: '', location: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (base) => {
    setSelectedBase(base);
    setFormData({ name: base.name, location: base.location });
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (base) => {
    setSelectedBase(base);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      showError('Please complete all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedBase) {
        await baseService.update(selectedBase.id, formData);
        showSuccess(`Base '${formData.name}' updated successfully!`);
      } else {
        await baseService.create(formData);
        showSuccess(`Base '${formData.name}' established successfully!`);
      }

      setIsFormModalOpen(false);
      fetchBases();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBase) return;
    try {
      setIsSubmitting(true);
      await baseService.delete(selectedBase.id);
      showSuccess(`Base '${selectedBase.name}' decommissioned successfully`);
      setIsDeleteModalOpen(false);
      fetchBases();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete base');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Bases & Installations</h1>
          <p className="page-description">
            Register and manage military outposts, air bases, and naval command centers.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusIcon className="w-4 h-4" />
          <span>Add New Installation</span>
        </button>
      </div>

      <div className="table-card">
        {isLoading ? (
          <LoadingSpinner text="Fetching operational installations..." />
        ) : bases.length === 0 ? (
          <EmptyState title="No bases registered" description="Register your first military base to begin inventory allocation." />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Installation ID</th>
                  <th>Base Name</th>
                  <th>Geographic Location</th>
                  <th>Established Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bases.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                      BASE-{String(b.id).padStart(3, '0')}
                    </td>
                    <td style={{ fontWeight: 700, color: '#f8fafc' }}>{b.name}</td>
                    <td>{b.location}</td>
                    <td style={{ color: '#94a3b8' }}>
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(b)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenDelete(b)}
                        >
                          Decommission
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Base Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedBase ? `Edit Base: ${selectedBase.name}` : 'Establish New Installation'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleFormSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (selectedBase ? 'Update Base' : 'Establish Base')}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Base Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Forward Operating Base Bravo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Geographic Location / Sector *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Helmand Province Sector 4"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Decommission Operational Base"
        message={`Are you sure you want to decommission base '${selectedBase?.name}'? Active assets and historical transaction records will remain archived.`}
        confirmText="Decommission Base"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
