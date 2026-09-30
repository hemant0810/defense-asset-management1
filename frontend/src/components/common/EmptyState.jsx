import React from 'react';
import { SearchIcon } from './Icons';

export const EmptyState = ({ title = "No records found", description = "Try adjusting your filters or search criteria." }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <SearchIcon className="w-12 h-12" />
      </div>
      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0' }}>{title}</h4>
      <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '340px' }}>{description}</p>
    </div>
  );
};
