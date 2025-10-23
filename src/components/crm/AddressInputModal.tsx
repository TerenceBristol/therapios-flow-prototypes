'use client';

import React, { useState } from 'react';

interface AddressInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string) => void;
}

const AddressInputModal: React.FC<AddressInputModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (address.trim()) {
      onConfirm(address.trim());
      setAddress(''); // Clear for next use (one-time use only)
    }
  };

  const handleCancel = () => {
    setAddress(''); // Clear on cancel
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">Delivery Address</h2>
          <button className="modal-close" onClick={handleCancel}>×</button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          <div className="address-input-section">
            <p className="address-input-description">
              Please input a delivery address to be used in the form
            </p>
            
            <textarea
              className="address-input-field"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.875rem',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter delivery address..."
              rows={4}
              autoFocus
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button 
              className="action-btn primary"
              onClick={handleConfirm}
              disabled={!address.trim()}
            >
              Confirm
            </button>
            <button className="action-btn secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressInputModal;
