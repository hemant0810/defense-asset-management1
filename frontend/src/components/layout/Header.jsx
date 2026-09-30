import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MenuIcon, LogOutIcon, BaseIcon } from '../common/Icons';

export const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'System Admin';
      case 'BASE_COMMANDER':
        return 'Base Commander';
      case 'LOGISTICS_OFFICER':
        return 'Logistics Officer';
      default:
        return role || 'Operator';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'OP';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar} title="Toggle Navigation">
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="header-title-badge">
          <div className="operational-status-dot" title="Operational Ready" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            STATUS: ACTIVE
          </span>
          {user?.baseName ? (
            <div className="header-base-badge">
              <BaseIcon className="w-3.5 h-3.5" />
              <span>{user.baseName}</span>
            </div>
          ) : (
            <div className="header-base-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)' }}>
              <span>GLOBAL COMMAND (ALL BASES)</span>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="user-profile-menu">
          <div className="user-avatar">
            {getInitials(user?.fullName || user?.username)}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.fullName || user?.username}</span>
            <span className="user-role-tag">{getRoleLabel(user?.role)}</span>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign out of system">
          <LogOutIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
