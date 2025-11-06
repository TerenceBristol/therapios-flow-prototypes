'use client';

import { useState, useEffect } from 'react';
import { GroupedPatient, VO } from '@/data/voTypes';
import { getActiveVOs, getNonActiveVOs } from '@/utils/voGrouping';
import VOTableRow from './VOTableRow';
import PatientActionsMenu from './PatientActionsMenu';

interface PatientRowProps {
  patient: GroupedPatient;
  selectedVOs: Set<string>;
  onVOCheck: (voId: string, checked: boolean) => void;
  onPatientAction: (action: string, patient: GroupedPatient) => void;
  expandAll: boolean;
}

export default function PatientRow({ patient, selectedVOs, onVOCheck, onPatientAction, expandAll }: PatientRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllVOs, setShowAllVOs] = useState(false);

  const activeVOs = getActiveVOs(patient);
  const nonActiveVOs = getNonActiveVOs(patient);
  const displayVOs = showAllVOs ? patient.vos : activeVOs;

  // Sync isExpanded with expandAll prop
  useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  // Format shared therapists for display
  const sharedTherapistsDisplay = patient.sharedTherapists.length > 0
    ? patient.sharedTherapists[0] + (patient.sharedTherapists.length > 1 ? ` +${patient.sharedTherapists.length - 1}` : '')
    : '–';

  // Format ordering status
  const orderingStatusDisplay = patient.orderingStatus === 'by_therapist' ? 'By Therapist' : 'By Admin';

  // Get color for Active VOs count
  const getActiveVOsColor = (count: number): string => {
    if (count === 0) return 'text-gray-900';
    if (count <= 2) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div>
      {/* Patient Card */}
      <div
        className={`relative border-b border-gray-100 cursor-pointer px-6 py-3 ${
          isExpanded ? 'bg-gray-50' : 'bg-white'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Actions Button */}
        <div className="absolute top-3 right-6" onClick={(e) => e.stopPropagation()}>
          <div className="text-gray-700 hover:bg-gray-100 border border-gray-200 bg-white rounded p-1.5 transition-colors shadow-sm">
            <PatientActionsMenu patient={patient} onAction={onPatientAction} />
          </div>
        </div>

        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-3 pr-16">
          {/* Row 1, Column 1: Name with Chevron */}
          <div className="flex items-center gap-2">
            <button
              className="text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="text-lg font-semibold text-gray-900">{patient.name}</span>
          </div>

          {/* Row 1, Column 2: Days */}
          <div className="text-xs text-gray-600 uppercase tracking-wide">
            Days s.l. beh: <span className="font-semibold text-gray-900 normal-case">{patient.daysSinceLastTreatment}</span>
          </div>

          {/* Row 1, Column 3: Active VOs */}
          <div className="text-xs text-gray-600 uppercase tracking-wide">
            Active VOs: <span className={`font-semibold normal-case ${getActiveVOsColor(patient.activeVOCount)}`}>{patient.activeVOCount}</span>
          </div>

          {/* Row 2, Column 1: Primary Therapist */}
          <div className="text-xs text-gray-600 uppercase tracking-wide pt-3 border-t border-gray-100">
            Primary Therapist: <span className="font-semibold text-gray-900 normal-case">{patient.primaryTherapist}</span>
          </div>

          {/* Row 2, Column 2: Shared Therapist */}
          <div className="text-xs text-gray-600 uppercase tracking-wide pt-3 border-t border-gray-100">
            Shared Therapist: <span className="font-semibold text-gray-900 normal-case">{sharedTherapistsDisplay}</span>
          </div>

          {/* Row 2, Column 3: Ordering Status */}
          <div className="text-xs text-gray-600 uppercase tracking-wide pt-3 border-t border-gray-100">
            Ordering Status: <span className="font-semibold text-gray-900 normal-case">{orderingStatusDisplay}</span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-gray-50 px-4 pb-4">
          {/* VO Table */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12"></th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">VO Nr.</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">VO Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Beh. Status (#/#)</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Doku</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Einrichtung</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">TB</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Beh. Wbh</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Organizer</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Heilmittel</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Abgelehnte Beh.</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Doppel-B</th>
                  </tr>
                </thead>
                <tbody>
                  {displayVOs.map((vo) => (
                    <VOTableRow
                      key={vo.id}
                      vo={vo}
                      isChecked={selectedVOs.has(vo.id!)}
                      onCheck={onVOCheck}
                      showCheckbox={vo.voStatus === 'Aktiv'}
                    />
                  ))}

                  {/* Show More Button Row */}
                  {!showAllVOs && nonActiveVOs.length > 0 && (
                    <tr>
                      <td colSpan={12} className="px-4 py-3">
                        <button
                          onClick={() => setShowAllVOs(true)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Show {nonActiveVOs.length} completed VO{nonActiveVOs.length !== 1 ? 's' : ''}
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Hide Button Row */}
                  {showAllVOs && nonActiveVOs.length > 0 && (
                    <tr>
                      <td colSpan={12} className="px-4 py-3">
                        <button
                          onClick={() => setShowAllVOs(false)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                          Hide completed VOs
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
