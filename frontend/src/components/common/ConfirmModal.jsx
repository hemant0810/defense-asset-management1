import React from 'react';
import { Modal } from './Modal';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDanger = false, isLoading = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
};
