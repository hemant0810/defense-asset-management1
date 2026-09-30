import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Authenticating user session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>403 - Access Denied</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
          Your clearance level ({user?.role}) is not authorized to access this operational sector.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children;
};
