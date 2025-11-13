'use client';

import React from 'react';

interface UploadIDConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  uploadId: string;
}

export default function UploadIDConfirmationModal({
  isOpen,
  onClose,
  onContinue,
  uploadId,
}: UploadIDConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload ID Generated</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="text-center space-y-6">
            {/* Instruction Text */}
            <p className="text-gray-700 text-lg">
              Please write this number on the physical copayment slip:
            </p>

            {/* Upload ID Display */}
            <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6">
              <div className="text-5xl font-bold text-blue-600 tracking-wider font-mono">
                {uploadId}
              </div>
            </div>

            {/* Helper Text */}
            <p className="text-sm text-gray-600">
              This unique identifier will help us track your uploaded copayment image.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Continue to Upload
          </button>
        </div>
      </div>
    </div>
  );
}
