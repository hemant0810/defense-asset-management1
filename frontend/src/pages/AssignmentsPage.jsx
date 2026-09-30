import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { assignmentService } from '../services/assignmentService';
import { baseService } from '../services/baseService';
import { equipmentService } from '../services/equipmentService';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PlusIcon } from '../components/common/Icons';

export const AssignmentsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const canCreate = user?.role === 'ADMIN' || user?.role === 'BASE_COMMANDER';

  // Catalogs
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Data & Filters
  const [assignments, setAssignments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedBase, setSelectedBase] = useState(user?.baseId || '');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);

  const [formData, setFormData] = useState({
    baseId: user?.baseId || '',
    equipmentTypeId: '',
    personnelName: '',
    quantity: '1',
    assignmentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [bData, eqData] = await Promise.all([
          baseService.getAll(),
          equipmentService.getAll(),
        ]);
        setBases(bData || []);
        setEquipmentTypes(eqData || []);
      } catch (err) {
        console.error('Failed to load catalogs', err);
      }
    };
    loadCatalogs();
  }, []);

  // Check live stock for assignment
  useEffect(() => {
    const checkStock = async () => {
      if (formData.baseId && formData.equipmentTypeId && isModalOpen) {
        try {
          const res = await api.get('/api/assets/stock', {
            params: { baseId: formData.baseId, equipmentTypeId: formData.equipmentTypeId }
          });
          setCurrentStock(res.data.data);
        } catch (err) {
          setCurrentStock(null);
        }
      } else {
        setCurrentStock(null);
      }
    };
    checkStock();
  }, [formData.baseId, formData.equipmentTypeId, isModalOpen]);

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        size: 10,
        search: search.trim() || undefined,
        baseId: selectedBase || undefined,
        equipmentTypeId: selectedEquipment || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const data = await assignmentService.getAll(params);
      setAssignments(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showError('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedBase, selectedEquipment, startDate, endDate, showError]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleOpenModal = () => {
    setFormData({
      baseId: user?.baseId || (bases[0]?.id || ''),
      equipmentTypeId: equipmentTypes[0]?.id || '',
      personnelName: '',
      quantity: '1',
      assignmentDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const qty = parseInt(formData.quantity, 10);

    if (!formData.baseId || !formData.equipmentTypeId || !formData.personnelName.trim()) {
      showError('Please complete all required fields');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      showError('Quantity must be greater than zero');
      return;
    }
    if (currentStock !== null && qty > currentStock) {
      showError(`Insufficient stock! Only ${currentStock} units available for assignment.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await assignmentService.create({
        baseId: Number(formData.baseId),
        equipmentTypeId: Number(formData.equipmentTypeId),
        personnelName: formData.personnelName.trim(),
        quantity: qty,
        assignmentDate: formData.assignmentDate,
      });

      showSuccess(`Equipment successfully assigned to ${formData.personnelName}!`);
      setIsModalOpen(false);
      fetchAssignments();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to record assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Personnel Equipment Assignments</h1>
          <p className="page-description">
            Track authorized allocation of critical equipment to officers and soldiers.
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <PlusIcon className="w-4 h-4" />
            <span>New Equipment Assignment</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-card">
        <div className="form-group">
          <label className="form-label">Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Personnel name, item, base..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Base</label>
          <select
            className="form-control"
            value={selectedBase}
            onChange={(e) => { setSelectedBase(e.target.value); setPage(0); }}
            disabled={user?.role !== 'ADMIN' && !!user?.baseId}
          >
            {user?.role === 'ADMIN' && <option value="">All Bases</option>}
            {bases.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Equipment</label>
          <select
            className="form-control"
            value={selectedEquipment}
            onChange={(e) => { setSelectedEquipment(e.target.value); setPage(0); }}
          >
            <option value="">All Equipment</option>
            {equipmentTypes.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {isLoading ? (
          <LoadingSpinner text="Fetching personnel assignment records..." />
        ) : assignments.length === 0 ? (
          <EmptyState title="No assignments found" description="No equipment assignments match your filter parameters." />
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Assigned Personnel</th>
                    <th>Base Location</th>
                    <th>Equipment Type</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Assignment Date</th>
                    <th>Authorized By</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 700, color: '#f8fafc' }}>
                        {a.personnelName}
                      </td>
                      <td>{a.base?.name}</td>
                      <td style={{ fontWeight: 600 }}>{a.equipmentType?.name}</td>
                      <td>
                        <span className="badge badge-neutral">{a.equipmentType?.category}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                        {a.quantity}
                      </td>
                      <td>{a.assignmentDate}</td>
                      <td>{a.assignedBy}</td>
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

      {/* Add Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Equipment to Personnel"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateAssignment} disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Stationed Base *</label>
            <select
              className="form-control"
              value={formData.baseId}
              onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
              disabled={user?.role === 'BASE_COMMANDER' && !!user?.baseId}
              required
            >
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Equipment to Assign *</label>
            <select
              className="form-control"
              value={formData.equipmentTypeId}
              onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value })}
              required
            >
              <option value="">Select Equipment</option>
              {equipmentTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name} - [{eq.category}]</option>
              ))}
            </select>
          </div>

          {/* Real-time Inventory Check Callout */}
          {formData.baseId && formData.equipmentTypeId && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid var(--border-color)',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#94a3b8' }}>Available Stock on Base:</span>
              <strong style={{
                fontFamily: 'var(--font-mono)',
                color: currentStock > 0 ? '#34d399' : '#f87171'
              }}>
                {currentStock !== null ? `${currentStock} units` : 'Checking...'}
              </strong>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Personnel Full Name / Rank *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Sgt. James Miller"
              value={formData.personnelName}
              onChange={(e) => setFormData({ ...formData, personnelName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              min="1"
              max={currentStock !== null ? currentStock : undefined}
              className="form-control"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Date *</label>
            <input
              type="date"
              className="form-control"
              value={formData.assignmentDate}
              onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
