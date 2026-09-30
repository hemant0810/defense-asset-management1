import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';

export const NetMovementModal = ({ isOpen, onClose, data, isLoading }) => {
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PURCHASES, TRANSFER_IN, TRANSFER_OUT

  if (!data) return null;

  const { totalPurchases, totalTransferIn, totalTransferOut, netMovement, purchases = [], transfersIn = [], transfersOut = [] } = data;

  const allMovements = [
    ...purchases.map(p => ({ ...p, category: 'Purchase', badgeClass: 'badge-success' })),
    ...transfersIn.map(t => ({ ...t, category: 'Transfer In', badgeClass: 'badge-primary' })),
    ...transfersOut.map(t => ({ ...t, category: 'Transfer Out', badgeClass: 'badge-warning' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredMovements = allMovements.filter(item => {
    if (activeTab === 'PURCHASES') return item.type === 'PURCHASE';
    if (activeTab === 'TRANSFER_IN') return item.type === 'TRANSFER_IN';
    if (activeTab === 'TRANSFER_OUT') return item.type === 'TRANSFER_OUT';
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Net Movement Analysis & Audit Drill-down"
      size="lg"
      footer={
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      {/* Formula & Totals Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#93c5fd', fontWeight: 700, marginBottom: '0.5rem' }}>
          Mathematical Inventory Formula
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600, marginBottom: '1rem' }}>
          Net Movement = Purchases ({totalPurchases}) + Transfer In ({totalTransferIn}) - Transfer Out ({totalTransferOut}) = <span style={{ color: netMovement >= 0 ? '#34d399' : '#f87171' }}>{netMovement > 0 ? `+${netMovement}` : netMovement}</span>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '6px', padding: '0.65rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 600 }}>Purchases (+)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>+{totalPurchases}</div>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '6px', padding: '0.65rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#bfdbfe', textTransform: 'uppercase', fontWeight: 600 }}>Transfer In (+)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>+{totalTransferIn}</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '6px', padding: '0.65rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#fde68a', textTransform: 'uppercase', fontWeight: 600 }}>Transfer Out (-)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>-{totalTransferOut}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'ALL', label: `All Movements (${allMovements.length})` },
          { id: 'PURCHASES', label: `Purchases (${purchases.length})` },
          { id: 'TRANSFER_IN', label: `Transfers In (${transfersIn.length})` },
          { id: 'TRANSFER_OUT', label: `Transfers Out (${transfersOut.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Movement Table */}
      {filteredMovements.length === 0 ? (
        <EmptyState title="No movements in this view" description="No inventory transactions recorded for the selected criteria." />
      ) : (
        <div className="table-container" style={{ maxHeight: '380px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Reference #</th>
                <th>Base</th>
                <th>Equipment Type</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Officer</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={`badge ${item.badgeClass}`}>{item.category}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#93c5fd' }}>
                    {item.referenceNumber}
                  </td>
                  <td>{item.baseName}</td>
                  <td>{item.equipmentTypeName}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {item.type === 'TRANSFER_OUT' ? `-${item.quantity}` : `+${item.quantity}`}
                  </td>
                  <td>{item.date}</td>
                  <td>{item.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};
