import React from 'react';

export const LoadingSpinner = ({ text = "Loading data..." }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem' }}>
      <div style={{
        width: '38px',
        height: '38px',
        border: '3px solid rgba(59, 130, 246, 0.2)',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{text}</span>
    </div>
  );
};
