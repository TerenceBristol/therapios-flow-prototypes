'use client';

import React from 'react';
import { VORecord } from '@/types';

interface PatientData {
  patientName: string;
  patientER: string;
  vos: VORecord[];
}

interface MarkAsOrderedModalProps {
  isOpen: boolean;
  onClose: () => void;
  affectedPatientsData: PatientData[];
  onConfirm: () => void;
}

export default function MarkAsOrderedModal({
  isOpen,
  onClose,
  affectedPatientsData,
  onConfirm,
}: MarkAsOrderedModalProps) {
  if (!isOpen) return null;

  // Calculate totals
  const patientCount = affectedPatientsData.length;
  const totalVOCount = affectedPatientsData.reduce((sum, p) => sum + p.vos.length, 0);
  
  // Flatten all VOs from all patients for the table
  const allVOs = affectedPatientsData.flatMap((patient) => 
    patient.vos.map((vo) => ({ ...vo, _patientName: patient.patientName }))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Zu Bestellen by Therapist
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Info message */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              This will set the Ordering Status to &quot;By Therapist&quot; for all VOs belonging to the selected patient{patientCount !== 1 ? 's' : ''}.
            </p>
          </div>

          {/* Summary Banner */}
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-900">
              {patientCount} patient{patientCount !== 1 ? 's' : ''}, {totalVOCount} VO{totalVOCount !== 1 ? 's' : ''} will be updated
            </span>
          </div>

          {/* VO Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">VO Nr.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Arzt</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">VO Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">F.VO Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Ordering Status Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allVOs.map((vo) => (
                  <tr key={vo.id} className="bg-blue-50 border-l-4 border-blue-500">
                    <td className="px-4 py-3">
                      <span className="text-gray-900 font-medium">{vo._patientName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-900 font-medium">{vo.voNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{vo.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          vo.voStatus === 'Aktiv'
                            ? 'bg-green-100 text-green-800'
                            : vo.voStatus === 'Abgebrochen'
                            ? 'bg-red-100 text-red-800'
                            : vo.voStatus === 'Fertig Behandelt'
                            ? 'bg-purple-100 text-purple-800'
                            : vo.voStatus === 'Abgerechnet'
                            ? 'bg-blue-100 text-blue-800'
                            : vo.voStatus === 'Abgelaufen'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {vo.voStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {vo.fvoStatus ? (
                        <span className="text-gray-900 text-xs font-medium">{vo.fvoStatus}</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-700 font-medium">{vo.orderingStatus}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-blue-700 font-semibold">By Therapist</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
