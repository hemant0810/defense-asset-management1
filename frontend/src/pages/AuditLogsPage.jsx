import React, { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/auditService';
import { useToast } from '../context/ToastContext';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { AuditIcon, SearchIcon } from '../components/common/Icons';

export const AuditLogsPage = () => {
  const { showError } = useToast();

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [username, setUsername] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        size: 15,
        username: username.trim() || undefined,
        action: action || undefined,
        entityType: entityType || undefined,
      };

      const data = await auditService.getAll(params);
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showError('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [page, username, action, entityType, showError]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadgeClass = (act) => {
    if (act.includes('LOGIN')) return 'badge-neutral';
    if (act.includes('CREATED') || act.includes('INIT')) return 'badge-success';
    if (act.includes('TRANSFER')) return 'badge-primary';
    if (act.includes('EXPENDITURE') || act.includes('DELETED')) return 'badge-danger';
    return 'badge-warning';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Audit Trail & Compliance</h1>
          <p className="page-description">
            Immutable chronological record of logins, transactions, inventory adjustments, and administrative events.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-card">
        <div className="form-group">
          <label className="form-label">Operator / User</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search operator..."
            value={username}
            onChange={(e) => { setUsername(e.target.value); setPage(0); }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Action</label>
          <select
            className="form-control"
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(0); }}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="PURCHASE_CREATED">PURCHASE_CREATED</option>
            <option value="TRANSFER_COMPLETED">TRANSFER_COMPLETED</option>
            <option value="ASSIGNMENT_CREATED">ASSIGNMENT_CREATED</option>
            <option value="EXPENDITURE_RECORDED">EXPENDITURE_RECORDED</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="USER_UPDATED">USER_UPDATED</option>
            <option value="BASE_CREATED">BASE_CREATED</option>
            <option value="EQUIPMENT_TYPE_CREATED">EQUIPMENT_TYPE_CREATED</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Entity Type</label>
          <select
            className="form-control"
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
          >
            <option value="">All Entities</option>
            <option value="PURCHASE">PURCHASE</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="EXPENDITURE">EXPENDITURE</option>
            <option value="USER">USER</option>
            <option value="BASE">BASE</option>
            <option value="EQUIPMENT_TYPE">EQUIPMENT_TYPE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {isLoading ? (
          <LoadingSpinner text="Fetching immutable audit records..." />
        ) : logs.length === 0 ? (
          <EmptyState title="No audit logs found" description="No activity records match your current filter parameters." />
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User / Operator</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Entity ID</th>
                    <th>Description</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.username || 'System'}</td>
                      <td>
                        <span className={`badge ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.entityType || '-'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{log.entityId || '-'}</td>
                      <td style={{ maxWidth: '350px', whiteSpace: 'normal', color: '#cbd5e1' }}>
                        {log.description}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                        {log.ipAddress || '127.0.0.1'}
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
    </div>
  );
};
