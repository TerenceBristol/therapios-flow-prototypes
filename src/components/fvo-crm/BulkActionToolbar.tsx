'use client';

import React, { useState } from 'react';
import { FVOCRMVOStatus } from '@/types';

interface BulkActionToolbarProps {
  selectedCount: number;
  orderTypeFilter?: null | 'initial' | 'followup';
  onBulkStatusChange: (status: FVOCRMVOStatus) => void;
  onBulkNote: (note: string) => void;
  onGeneratePDF?: () => void;
  onClearSelection: () => void;
}

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  orderTypeFilter = null,
  onBulkStatusChange,
  onBulkNote,
  onGeneratePDF,
  onClearSelection
}) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  const allStatuses: FVOCRMVOStatus[] = [
    'Bestellen',
    'Bestellt',
    'Nachverfolgen',
    'Nachverfolgt',
    'Telefonieren',
    'Telefoniert'
  ];

  const handleBulkStatus = (status: FVOCRMVOStatus) => {
    if (window.confirm(`Change status to "${status}" for ${selectedCount} selected VOs?`)) {
      onBulkStatusChange(status);
      setShowStatusDropdown(false);
    }
  };

  const handleBulkNote = () => {
    if (noteText.trim().length < 5) {
      alert('Note must be at least 5 characters');
      return;
    }
    if (noteText.length > 500) {
      alert('Note must be less than 500 characters');
      return;
    }

    if (window.confirm(`Add note to ${selectedCount} selected VOs?`)) {
      onBulkNote(noteText);
      setNoteText('');
      setShowNoteModal(false);
    }
  };

  // Get dynamic button text based on order type filter
  const getGeneratePDFButtonText = () => {
    if (orderTypeFilter === 'initial') {
      return 'Generate Initial Order Form';
    } else if (orderTypeFilter === 'followup') {
      return 'Generate Follow-up Order Form';
    }
    return 'Generate Order Form';
  };

  // Check if PDF generation is available
  const isPDFGenerationDisabled = !orderTypeFilter;

  return (
    <>
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-20 bg-blue-50 border-b-2 border-blue-200 px-4 py-3 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-blue-900">
              {selectedCount} {selectedCount === 1 ? 'VO' : 'VOs'} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-sm text-blue-700 hover:text-blue-900 underline"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Status Change */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-4 py-2 bg-white border border-blue-300 rounded-md hover:bg-blue-50 text-sm font-medium text-blue-900 transition-colors"
              >
                Change Status
              </button>

              {showStatusDropdown && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-border rounded-md shadow-lg py-1 min-w-[180px] z-30">
                  {allStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => handleBulkStatus(status)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bulk Note */}
            <button
              onClick={() => setShowNoteModal(true)}
              className="px-4 py-2 bg-white border border-blue-300 rounded-md hover:bg-blue-50 text-sm font-medium text-blue-900 transition-colors"
            >
              Add Note
            </button>

            {/* Generate PDF */}
            {onGeneratePDF && (
              <button
                onClick={isPDFGenerationDisabled ? undefined : onGeneratePDF}
                disabled={isPDFGenerationDisabled}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isPDFGenerationDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {getGeneratePDFButtonText()}
              </button>
            )}
          </div>
        </div>

        {/* Helper Text Info Box - shown when PDF generation is disabled */}
        {onGeneratePDF && isPDFGenerationDisabled && (
          <div className="mt-3 p-3 bg-blue-50/50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              💡 Select an order type to enable PDF generation
            </p>
          </div>
        )}
      </div>

      {/* Bulk Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Bulk Note</h3>

            <div className="space-y-4">
              {/* Note Text */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Note
                  <span className="text-muted-foreground ml-2">
                    ({noteText.length}/500 characters)
                  </span>
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md resize-none"
                  rows={4}
                  maxLength={500}
                  placeholder="Enter note (5-500 characters)..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteText('');
                  }}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkNote}
                  disabled={noteText.trim().length < 5}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply to {selectedCount} VOs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showStatusDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowStatusDropdown(false)}
        />
      )}
    </>
  );
};

export default BulkActionToolbar;
