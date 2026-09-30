import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldIcon,
  DashboardIcon,
  CartIcon,
  TransferIcon,
  AssignmentIcon,
  ExpenditureIcon,
  AuditIcon,
  UsersIcon,
  BaseIcon,
  EquipmentIcon,
  CloseIcon
} from '../common/Icons';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/purchases', label: 'Purchases', icon: CartIcon },
    { to: '/transfers', label: 'Transfers', icon: TransferIcon },
    { to: '/assignments', label: 'Assignments', icon: AssignmentIcon },
    { to: '/expenditures', label: 'Expenditures', icon: ExpenditureIcon },
  ];

  const adminLinks = [
    { to: '/audit-logs', label: 'Audit Logs', icon: AuditIcon },
    { to: '/users', label: 'User Management', icon: UsersIcon },
    { to: '/bases', label: 'Base Management', icon: BaseIcon },
    { to: '/equipment-types', label: 'Equipment Catalog', icon: EquipmentIcon },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <ShieldIcon className="w-5 h-5" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="sidebar-title">DEFENSE OPS</div>
          <div className="sidebar-subtitle">Asset Command</div>
        </div>
        <button
          className="btn-icon mobile-menu-btn"
          onClick={onClose}
          style={{ display: isOpen ? 'flex' : 'none' }}
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Operations</div>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {isAdmin && (
          <>
            <div className="nav-section-title">Administration</div>
            {adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {user?.baseName && (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
            Stationed Base
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8', marginTop: '0.2rem' }}>
            {user.baseName}
          </div>
        </div>
      )}
    </aside>
  );
};
