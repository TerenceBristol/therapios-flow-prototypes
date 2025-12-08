'use client';

import React from 'react';
import { DocumentType } from './DocumentUploadDetailModal';

interface DocumentTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: DocumentType) => void;
}

const documentTypes: { type: DocumentType; icon: React.ReactNode }[] = [
  {
    type: 'Zuzahlungsbefreiung',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    type: 'Patienteninformationsbogen',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    type: 'Honorarvereinbarung',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    type: 'Andere',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
];

export default function DocumentTypeSelectionModal({
  isOpen,
  onClose,
  onSelectType,
}: DocumentTypeSelectionModalProps) {
  if (!isOpen) return null;

  const handleSelectType = (type: DocumentType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header - Golden/Olive style like screenshot */}
        <div className="px-6 py-4 bg-[#8B7355] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Dokumenttyp auswählen</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Card Grid */}
        <div className="p-6 bg-gray-100">
          <div className="grid grid-cols-2 gap-4">
            {documentTypes.map(({ type, icon }) => (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className="bg-[#E8EAF0] rounded-xl p-6 text-left hover:bg-[#D8DAE0] transition-colors group"
              >
                <div className="w-14 h-14 bg-[#1E2A3B] rounded-full flex items-center justify-center mb-4 text-white">
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-[#1E2A3B]">{type}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
