import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { baseService } from '../services/baseService';
import { equipmentService } from '../services/equipmentService';
import { MetricCard } from '../components/dashboard/MetricCard';
import { NetMovementModal } from '../components/dashboard/NetMovementModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  CartIcon,
  TransferIcon,
  AssignmentIcon,
  ExpenditureIcon,
  RefreshIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldIcon
} from '../components/common/Icons';

export const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Filters State
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [selectedBase, setSelectedBase] = useState(user?.baseId || '');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dashboard Data State
  const [summary, setSummary] = useState(null);
  const [netMovementDetails, setNetMovementDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Load Base and Equipment options
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [basesData, eqData] = await Promise.all([
          baseService.getAll(),
          equipmentService.getAll(),
        ]);
        setBases(basesData || []);
        setEquipmentTypes(eqData || []);
      } catch (err) {
        console.error('Failed to load bases/equipment catalog', err);
      }
    };
    loadCatalogs();
  }, []);

  // Fetch Dashboard Summary
  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (selectedBase) params.baseId = selectedBase;
      if (selectedEquipment) params.equipmentTypeId = selectedEquipment;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await dashboardService.getSummary(params);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBase, selectedEquipment, startDate, endDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Handle Net Movement click to open detailed modal
  const handleOpenNetMovementModal = async () => {
    try {
      setIsModalLoading(true);
      setIsModalOpen(true);
      const params = {};
      if (selectedBase) params.baseId = selectedBase;
      if (selectedEquipment) params.equipmentTypeId = selectedEquipment;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const details = await dashboardService.getNetMovementDetails(params);
      setNetMovementDetails(details);
    } catch (err) {
      console.error('Failed to fetch net movement modal details', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedBase(user?.role !== 'ADMIN' ? user?.baseId || '' : '');
    setSelectedEquipment('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Dashboard</h1>
          <p className="page-description">
            Live equipment inventory metrics, movements, personnel assignments, and net balance calculations.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchSummary} title="Refresh data">
          <RefreshIcon className="w-4 h-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Dynamic Filters Bar */}
      <div className="filter-card">
        <div className="form-group">
          <label className="form-label">Operational Base</label>
          <select
            className="form-control"
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            disabled={!isAdmin && !!user?.baseId}
          >
            {isAdmin && <option value="">All Bases (Global Fleet)</option>}
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.location})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Equipment Catalog</label>
          <select
            className="form-control"
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
          >
            <option value="">All Equipment Types</option>
            {equipmentTypes.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} - [{eq.category}]
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* 8 Primary Cards Grid + Real-time Stock Card */}
      {isLoading ? (
        <LoadingSpinner text="Computing inventory balances across bases..." />
      ) : summary ? (
        <>
          <div className="metrics-grid">
            {/* 1. Opening Balance */}
            <MetricCard
              title="1. Opening Balance"
              value={summary.openingBalance}
              subtext="Inventory carried from prior operational period"
              theme="theme-blue"
              icon={ShieldIcon}
            />

            {/* 2. Purchases */}
            <MetricCard
              title="2. Purchases"
              value={summary.purchases}
              subtext="Newly procured assets in this window"
              theme="theme-green"
              icon={CartIcon}
            />

            {/* 3. Transfer In */}
            <MetricCard
              title="3. Transfer In"
              value={summary.transferIn}
              subtext="Assets transferred into base"
              theme="theme-cyan"
              icon={ArrowTrendingUpIcon}
            />

            {/* 4. Transfer Out */}
            <MetricCard
              title="4. Transfer Out"
              value={summary.transferOut}
              subtext="Assets transferred out of base"
              theme="theme-orange"
              icon={ArrowTrendingDownIcon}
            />

            {/* 5. Net Movement - Clickable Popup Modal */}
            <MetricCard
              title="5. Net Movement"
              value={summary.netMovement > 0 ? `+${summary.netMovement}` : summary.netMovement}
              subtext="Purchases + Transfer In - Transfer Out"
              theme="theme-blue"
              icon={TransferIcon}
              clickable={true}
              onClick={handleOpenNetMovementModal}
            />

            {/* 6. Closing Balance */}
            <MetricCard
              title="6. Closing Balance"
              value={summary.closingBalance}
              subtext="Opening + Net Movement - Expended"
              theme="theme-purple"
              icon={ShieldIcon}
            />

            {/* 7. Assigned */}
            <MetricCard
              title="7. Assigned"
              value={summary.assigned}
              subtext="Equipment deployed to personnel"
              theme="theme-orange"
              icon={AssignmentIcon}
            />

            {/* 8. Expended */}
            <MetricCard
              title="8. Expended"
              value={summary.expended}
              subtext="Damaged or consumed equipment"
              theme="theme-red"
              icon={ExpenditureIcon}
            />
          </div>

          {/* Quick Informational Invariant Banner */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Operational Inventory Invariant
              </span>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Stock availability is enforced at database transaction boundaries. Negative inventory is strictly prohibited.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Available on Hand:</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: summary.availableStock > 0 ? '#34d399' : '#f87171',
                background: 'rgba(0,0,0,0.3)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px'
              }}>
                {summary.availableStock}
              </span>
            </div>
          </div>
        </>
      ) : null}

      {/* Net Movement Detail Popup Modal */}
      <NetMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={netMovementDetails}
        isLoading={isModalLoading}
      />
    </div>
  );
};
