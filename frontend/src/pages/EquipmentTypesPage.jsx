import React, { useState, useEffect } from 'react';
import { equipmentService } from '../services/equipmentService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PlusIcon } from '../components/common/Icons';

export const EquipmentTypesPage = () => {
  const { showSuccess, showError } = useToast();

  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Vehicle',
    description: '',
  });

  const categories = [
    'Vehicle',
    'Communication Equipment',
    'Protective Equipment',
    'General Equipment',
  ];

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const data = await equipmentService.getAll();
      setEquipmentList(data || []);
    } catch (err) {
      showError('Failed to load equipment catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({ name: '', category: 'Vehicle', description: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) {
      showError('Please complete all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedItem) {
        await equipmentService.update(selectedItem.id, formData);
        showSuccess(`Equipment '${formData.name}' updated successfully!`);
      } else {
        await equipmentService.create(formData);
        showSuccess(`Equipment '${formData.name}' cataloged successfully!`);
      }

      setIsFormModalOpen(false);
      fetchEquipment();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      setIsSubmitting(true);
      await equipmentService.delete(selectedItem.id);
      showSuccess(`Equipment '${selectedItem.name}' removed from catalog`);
      setIsDeleteModalOpen(false);
      fetchEquipment();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete equipment type');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipment Catalog & Categories</h1>
          <p className="page-description">
            Define standardized equipment classifications, tactical assets, and specifications.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusIcon className="w-4 h-4" />
          <span>Add Equipment Item</span>
        </button>
      </div>

      <div className="table-card">
        {isLoading ? (
          <LoadingSpinner text="Fetching equipment classifications..." />
        ) : equipmentList.length === 0 ? (
          <EmptyState title="No equipment classified" description="Define your first equipment category item." />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Equipment ID</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Description / Specifications</th>
                  <th>Date Cataloged</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipmentList.map((eq) => (
                  <tr key={eq.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                      EQ-{String(eq.id).padStart(3, '0')}
                    </td>
                    <td style={{ fontWeight: 700, color: '#f8fafc' }}>{eq.name}</td>
                    <td>
                      <span className="badge badge-primary">{eq.category}</span>
                    </td>
                    <td style={{ maxWidth: '350px', whiteSpace: 'normal', color: '#94a3b8' }}>
                      {eq.description || 'N/A'}
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {eq.createdAt ? new Date(eq.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(eq)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenDelete(eq)}
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
        )}
      </div>

      {/* Add / Edit Equipment Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedItem ? `Edit Equipment: ${selectedItem.name}` : 'Catalog New Equipment Type'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleFormSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (selectedItem ? 'Update Equipment' : 'Catalog Equipment')}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Equipment Model / Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Tactical Drone MQ-9"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Classification Category *</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Specifications / Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Enter military specifications, tactical capabilities, or maintenance notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Equipment Type"
        message={`Are you sure you want to remove '${selectedItem?.name}' from the equipment catalog?`}
        confirmText="Remove from Catalog"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
