import React from 'react';

export const Pagination = ({ currentPage, totalPages, totalElements, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span>
        Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total items)
      </span>
      <div className="pagination-controls">
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
