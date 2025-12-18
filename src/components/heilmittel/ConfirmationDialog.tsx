'use client';

import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  details?: string[]; // Optional bullet points
  confirmText: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  confirmText,
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const confirmButtonStyles = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-amber-600 hover:bg-amber-700 text-white';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground">
            {message}
          </p>

          {details && details.length > 0 && (
            <ul className="mt-4 space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}

          {variant === 'danger' && (
            <p className="mt-4 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-foreground"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-md transition-colors ${confirmButtonStyles}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
