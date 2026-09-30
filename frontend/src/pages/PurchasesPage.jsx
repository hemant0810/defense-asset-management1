import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { purchaseService } from '../services/purchaseService';
import { baseService } from '../services/baseService';
import { equipmentService } from '../services/equipmentService';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PlusIcon, SearchIcon, CartIcon } from '../components/common/Icons';

export const PurchasesPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const canCreate = user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER';

  // Catalogs
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Data & Filters
  const [purchases, setPurchases] = useState([]);
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
  const [formData, setFormData] = useState({
    baseId: user?.baseId || '',
    equipmentTypeId: '',
    quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
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

  const fetchPurchases = useCallback(async () => {
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

      const data = await purchaseService.getAll(params);
      setPurchases(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showError('Failed to load purchases');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedBase, selectedEquipment, startDate, endDate, showError]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleOpenModal = () => {
    const timestamp = Date.now().toString().slice(-6);
    setFormData({
      baseId: user?.baseId || (bases[0]?.id || ''),
      equipmentTypeId: equipmentTypes[0]?.id || '',
      quantity: '10',
      purchaseDate: new Date().toISOString().split('T')[0],
      referenceNumber: `PO-${timestamp}`,
    });
    setIsModalOpen(true);
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    const qty = parseInt(formData.quantity, 10);
    if (!formData.baseId || !formData.equipmentTypeId || !formData.referenceNumber.trim()) {
      showError('Please complete all required fields');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      showError('Quantity must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      await purchaseService.create({
        baseId: Number(formData.baseId),
        equipmentTypeId: Number(formData.equipmentTypeId),
        quantity: qty,
        purchaseDate: formData.purchaseDate,
        referenceNumber: formData.referenceNumber.trim(),
      });

      showSuccess(`Purchase order ${formData.referenceNumber} recorded successfully!`);
      setIsModalOpen(false);
      fetchPurchases();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to record purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Procurement & Purchases</h1>
          <p className="page-description">
            Log official equipment purchases and inventory acquisitions.
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <PlusIcon className="w-4 h-4" />
            <span>Add Purchase Order</span>
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
          <LoadingSpinner text="Fetching purchases records..." />
        ) : purchases.length === 0 ? (
          <EmptyState title="No purchases found" description="No purchase orders match the selected search and filter criteria." />
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference #</th>
                    <th>Receiving Base</th>
                    <th>Equipment Type</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Purchase Date</th>
                    <th>Procurement Officer</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                        {p.referenceNumber}
                      </td>
                      <td>{p.base?.name}</td>
                      <td style={{ fontWeight: 600 }}>{p.equipmentType?.name}</td>
                      <td>
                        <span className="badge badge-neutral">{p.equipmentType?.category}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                        +{p.quantity}
                      </td>
                      <td>{p.purchaseDate}</td>
                      <td>{p.createdBy}</td>
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

      {/* Add Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Equipment Purchase"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreatePurchase} disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Commit Purchase'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreatePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Receiving Base *</label>
            <select
              className="form-control"
              value={formData.baseId}
              onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
              disabled={user?.role === 'LOGISTICS_OFFICER' && !!user?.baseId}
              required
            >
              {bases.map((b) => (
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

          <div className="form-group">
            <label className="form-label">Procured Quantity *</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Purchase Date *</label>
            <input
              type="date"
              className="form-control"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Purchase Reference / Order # *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. PO-ALPHA-2026-009"
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
