import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { expenditureService } from '../services/expenditureService';
import { baseService } from '../services/baseService';
import { equipmentService } from '../services/equipmentService';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PlusIcon } from '../components/common/Icons';

export const ExpendituresPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const canCreate = user?.role === 'ADMIN' || user?.role === 'BASE_COMMANDER';

  // Catalogs
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Data & Filters
  const [expenditures, setExpenditures] = useState([]);
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
    quantity: '1',
    expenditureDate: new Date().toISOString().split('T')[0],
    reason: '',
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

  // Check live stock for expenditure
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

  const fetchExpenditures = useCallback(async () => {
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

      const data = await expenditureService.getAll(params);
      setExpenditures(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showError('Failed to load expenditures');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedBase, selectedEquipment, startDate, endDate, showError]);

  useEffect(() => {
    fetchExpenditures();
  }, [fetchExpenditures]);

  const handleOpenModal = () => {
    setFormData({
      baseId: user?.baseId || (bases[0]?.id || ''),
      equipmentTypeId: equipmentTypes[0]?.id || '',
      quantity: '1',
      expenditureDate: new Date().toISOString().split('T')[0],
      reason: '',
    });
    setIsModalOpen(true);
  };

  const handleCreateExpenditure = async (e) => {
    e.preventDefault();
    const qty = parseInt(formData.quantity, 10);

    if (!formData.baseId || !formData.equipmentTypeId || !formData.reason.trim()) {
      showError('Please complete all required fields');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      showError('Quantity must be greater than zero');
      return;
    }
    if (currentStock !== null && qty > currentStock) {
      showError(`Insufficient stock! Only ${currentStock} units available to expend.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await expenditureService.create({
        baseId: Number(formData.baseId),
        equipmentTypeId: Number(formData.equipmentTypeId),
        quantity: qty,
        expenditureDate: formData.expenditureDate,
        reason: formData.reason.trim(),
      });

      showSuccess('Asset expenditure recorded successfully!');
      setIsModalOpen(false);
      fetchExpenditures();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to record expenditure');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipment Expenditures & Losses</h1>
          <p className="page-description">
            Log damaged, consumed, or decommissioned assets to balance operational records.
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <PlusIcon className="w-4 h-4" />
            <span>Record Expenditure</span>
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
            placeholder="Reason, item, base..."
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
          <LoadingSpinner text="Fetching expenditure records..." />
        ) : expenditures.length === 0 ? (
          <EmptyState title="No expenditures recorded" description="No asset damage or consumption events found for the selected filters." />
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Base Location</th>
                    <th>Equipment Type</th>
                    <th>Category</th>
                    <th>Quantity Expended</th>
                    <th>Reason / Justification</th>
                    <th>Date</th>
                    <th>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map((e) => (
                    <tr key={e.id}>
                      <td>{e.base?.name}</td>
                      <td style={{ fontWeight: 600 }}>{e.equipmentType?.name}</td>
                      <td>
                        <span className="badge badge-neutral">{e.equipmentType?.category}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f87171' }}>
                        -{e.quantity}
                      </td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'normal', color: '#cbd5e1' }}>
                        {e.reason}
                      </td>
                      <td>{e.expenditureDate}</td>
                      <td>{e.recordedBy}</td>
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

      {/* Record Expenditure Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Equipment Expenditure / Decommission"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleCreateExpenditure} disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Confirm Expenditure'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateExpenditure} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Base Location *</label>
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
            <label className="form-label">Equipment Expended *</label>
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
            <label className="form-label">Quantity Expended *</label>
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
            <label className="form-label">Expenditure Date *</label>
            <input
              type="date"
              className="form-control"
              value={formData.expenditureDate}
              onChange={(e) => setFormData({ ...formData, expenditureDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Justification *</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Combat damage during perimeter reconnaissance; unrecoverable write-off."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
