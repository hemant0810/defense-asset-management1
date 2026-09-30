import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { transferService } from '../services/transferService';
import { baseService } from '../services/baseService';
import { equipmentService } from '../services/equipmentService';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PlusIcon, TransferIcon } from '../components/common/Icons';

export const TransfersPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const canCreate = user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER';

  // Catalogs
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Data & Filters
  const [transfers, setTransfers] = useState([]);
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
  const [sourceStock, setSourceStock] = useState(null);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  const [formData, setFormData] = useState({
    fromBaseId: user?.baseId || '',
    toBaseId: '',
    equipmentTypeId: '',
    quantity: '5',
    transferDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
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

  // Fetch available stock when fromBaseId or equipmentTypeId changes in modal
  useEffect(() => {
    const checkStock = async () => {
      if (formData.fromBaseId && formData.equipmentTypeId && isModalOpen) {
        try {
          setIsCheckingStock(true);
          const res = await api.get('/api/assets/stock', {
            params: { baseId: formData.fromBaseId, equipmentTypeId: formData.equipmentTypeId }
          });
          setSourceStock(res.data.data);
        } catch (err) {
          setSourceStock(null);
        } finally {
          setIsCheckingStock(false);
        }
      } else {
        setSourceStock(null);
      }
    };
    checkStock();
  }, [formData.fromBaseId, formData.equipmentTypeId, isModalOpen]);

  const fetchTransfers = useCallback(async () => {
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

      const data = await transferService.getAll(params);
      setTransfers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showError('Failed to load transfer history');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedBase, selectedEquipment, startDate, endDate, showError]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleOpenModal = () => {
    const defaultFrom = user?.baseId || (bases[0]?.id || '');
    const defaultTo = bases.find(b => b.id !== defaultFrom)?.id || '';
    const defaultEq = equipmentTypes[0]?.id || '';
    const timestamp = Date.now().toString().slice(-6);

    setFormData({
      fromBaseId: defaultFrom,
      toBaseId: defaultTo,
      equipmentTypeId: defaultEq,
      quantity: '5',
      transferDate: new Date().toISOString().split('T')[0],
      referenceNumber: `TR-${timestamp}`,
    });
    setIsModalOpen(true);
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    const qty = parseInt(formData.quantity, 10);

    if (!formData.fromBaseId || !formData.toBaseId || !formData.equipmentTypeId || !formData.referenceNumber.trim()) {
      showError('Please complete all required fields');
      return;
    }
    if (formData.fromBaseId === formData.toBaseId) {
      showError('Source Base and Destination Base cannot be the same');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      showError('Quantity must be greater than zero');
      return;
    }
    if (sourceStock !== null && qty > sourceStock) {
      showError(`Insufficient inventory at source base! Only ${sourceStock} units available.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await transferService.create({
        fromBaseId: Number(formData.fromBaseId),
        toBaseId: Number(formData.toBaseId),
        equipmentTypeId: Number(formData.equipmentTypeId),
        quantity: qty,
        transferDate: formData.transferDate,
        referenceNumber: formData.referenceNumber.trim(),
      });

      showSuccess(`Transfer order ${formData.referenceNumber} executed successfully!`);
      setIsModalOpen(false);
      fetchTransfers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to execute transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inter-Base Asset Transfers</h1>
          <p className="page-description">
            Execute atomic equipment relocation between operational installations.
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <PlusIcon className="w-4 h-4" />
            <span>Initiate Transfer</span>
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
            placeholder="Reference #, base, item..."
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
          <LoadingSpinner text="Fetching transfer history..." />
        ) : transfers.length === 0 ? (
          <EmptyState title="No transfers found" description="No inter-base equipment transfers match your filter criteria." />
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference #</th>
                    <th>Origin (From)</th>
                    <th>Destination (To)</th>
                    <th>Equipment Type</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Initiated By</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                        {t.referenceNumber}
                      </td>
                      <td>{t.fromBase?.name}</td>
                      <td>{t.toBase?.name}</td>
                      <td style={{ fontWeight: 600 }}>{t.equipmentType?.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {t.quantity}
                      </td>
                      <td>{t.transferDate}</td>
                      <td>
                        <span className="badge badge-success">{t.status || 'COMPLETED'}</span>
                      </td>
                      <td>{t.createdBy}</td>
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

      {/* Add Transfer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initiate Inter-Base Transfer Order"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateTransfer} disabled={isSubmitting}>
              {isSubmitting ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Source Base (From) *</label>
            <select
              className="form-control"
              value={formData.fromBaseId}
              onChange={(e) => setFormData({ ...formData, fromBaseId: e.target.value })}
              disabled={user?.role === 'LOGISTICS_OFFICER' && !!user?.baseId}
              required
            >
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Destination Base (To) *</label>
            <select
              className="form-control"
              value={formData.toBaseId}
              onChange={(e) => setFormData({ ...formData, toBaseId: e.target.value })}
              required
            >
              <option value="">Select Destination Base</option>
              {bases
                .filter((b) => String(b.id) !== String(formData.fromBaseId))
                .map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Equipment Type *</label>
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
          {formData.fromBaseId && formData.equipmentTypeId && (
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
              <span style={{ color: '#94a3b8' }}>Available at Source Base:</span>
              <strong style={{
                fontFamily: 'var(--font-mono)',
                color: isCheckingStock ? '#94a3b8' : (sourceStock > 0 ? '#34d399' : '#f87171')
              }}>
                {isCheckingStock ? 'Verifying...' : (sourceStock !== null ? `${sourceStock} units` : 'N/A')}
              </strong>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Quantity to Transfer *</label>
            <input
              type="number"
              min="1"
              max={sourceStock !== null ? sourceStock : undefined}
              className="form-control"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Transfer Date *</label>
            <input
              type="date"
              className="form-control"
              value={formData.transferDate}
              onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Transfer Reference # *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. TR-2026-042"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
