'use client';

import React, { useState, useMemo } from 'react';
import { VORecord } from '@/types';
import therapistVOData from '@/data/therapistVOData.json';
import MarkAsOrderedModal from './MarkAsOrderedModal';

export default function TherapistDashboard() {
  const [voData, setVoData] = useState<VORecord[]>(therapistVOData as VORecord[]);
  const [selectedVOs, setSelectedVOs] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter to show only "Aktiv" VOs in the main table
  const filteredVOData = useMemo(() => {
    return voData.filter((vo) => vo.voStatus === 'Aktiv');
  }, [voData]);

  // Dynamic count for Offene VOs tab
  const offeneVOsCount = filteredVOData.length;

  // Get all affected patients and their VOs from selected VOs
  const affectedPatientsData = useMemo(() => {
    if (selectedVOs.size === 0) return [];
    
    // Get selected VO records
    const selectedVORecords = filteredVOData.filter((vo) => selectedVOs.has(vo.id));
    
    // Get unique patient names from selected VOs
    const uniquePatientNames = [...new Set(selectedVORecords.map((vo) => vo.patientName))];
    
    // For each patient, get ALL their VOs (not just selected ones)
    return uniquePatientNames.map((patientName) => {
      const patientVOs = voData.filter((vo) => vo.patientName === patientName);
      return {
        patientName,
        patientER: patientVOs[0]?.facility || '',
        vos: patientVOs,
      };
    });
  }, [selectedVOs, filteredVOData, voData]);

  // Get total VO count across all affected patients
  const totalAffectedVOs = useMemo(() => {
    return affectedPatientsData.reduce((sum, patient) => sum + patient.vos.length, 0);
  }, [affectedPatientsData]);

  // Handle checkbox toggle
  const handleCheckboxToggle = (voId: string) => {
    setSelectedVOs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(voId)) {
        newSet.delete(voId);
      } else {
        newSet.add(voId);
      }
      return newSet;
    });
  };

  // Handle select all (only for filtered data)
  const handleSelectAll = () => {
    if (selectedVOs.size === filteredVOData.length) {
      setSelectedVOs(new Set());
    } else {
      setSelectedVOs(new Set(filteredVOData.map((vo) => vo.id)));
    }
  };

  // Handle Mark as Ordered button click
  const handleMarkAsOrdered = () => {
    if (selectedVOs.size >= 1) {
      setIsModalOpen(true);
    }
  };

  // Handle modal confirm - set ordering status to "By Therapist" for all affected patient VOs
  const handleConfirm = () => {
    if (affectedPatientsData.length === 0) return;

    // Get all patient names that will be affected
    const affectedPatientNames = affectedPatientsData.map((p) => p.patientName);

    // Update ALL VOs for all affected patients to set ordering status to "By Therapist"
    const updatedVOData = voData.map((vo) => {
      if (affectedPatientNames.includes(vo.patientName)) {
        return {
          ...vo,
          orderingStatus: 'By Therapist' as const,
        };
      }
      return vo;
    });

    // Update state
    setVoData(updatedVOData);
    setSelectedVOs(new Set());
    setIsModalOpen(false);

    // Show success message
    const patientCount = affectedPatientsData.length;
    if (patientCount === 1) {
      setSuccessMessage(
        `Successfully set Ordering Status to "By Therapist" for ${totalAffectedVOs} VO${totalAffectedVOs !== 1 ? 's' : ''} belonging to ${affectedPatientsData[0].patientName}`
      );
    } else {
      setSuccessMessage(
        `Successfully set Ordering Status to "By Therapist" for ${totalAffectedVOs} VOs belonging to ${patientCount} patients`
      );
    }

    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  // Determine button visibility
  const showMarkAsOrderedButton = selectedVOs.size >= 1;
  const showAbbrechenButton = selectedVOs.size === 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Therapist F.VO Ordering Dashboard
          </h1>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200">
            <button className="pb-3 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
              Offene VOs ({offeneVOsCount})
            </button>
            <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
              Geteilte VOs (21)
            </button>
            <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
              Abgeschlossene VOs (148)
            </button>
            <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
              Kalender
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-green-900">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="mb-4 flex items-center gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option>Spalten anzeigen</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option>ECH</option>
          </select>

          {/* Action Buttons */}
          {selectedVOs.size > 0 && (
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900">
              Doku erfassen ({selectedVOs.size})
            </button>
          )}

          {showAbbrechenButton && (
            <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
              Abbrechen VO
            </button>
          )}

          {showMarkAsOrderedButton && (
            <button
              onClick={handleMarkAsOrdered}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Zu Bestellen by Therapist
            </button>
          )}

          {selectedVOs.size > 0 && (
            <>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-950">
                Transfer Patient ({selectedVOs.size})
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                Patient teilen ({selectedVOs.size})
              </button>
            </>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedVOs.size === filteredVOData.length && filteredVOData.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">VO Nr.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">TB</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Einrichtung</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tage s.l. Beh.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Primärer Therapeut</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Geteilter Therapeut</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Heilmittel</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Beh. Status (#/#)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">VO Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">F.VO Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Ordering Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Abgelehnte Beh.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Doppel-Beh.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVOData.map((vo) => (
                  <tr
                    key={vo.id}
                    className={`hover:bg-gray-50 ${
                      selectedVOs.has(vo.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedVOs.has(vo.id)}
                        onChange={() => handleCheckboxToggle(vo.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{vo.patientName}</td>
                    <td className="px-4 py-3 text-gray-900">{vo.voNumber}</td>
                    <td className="px-4 py-3 text-gray-900">{vo.tb ? 'Ja' : 'Nein'}</td>
                    <td className="px-4 py-3 text-gray-900 max-w-xs truncate" title={vo.facility}>
                      {vo.facility}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{vo.daysSinceLastBeh}</td>
                    <td className="px-4 py-3 text-gray-900">{vo.therapist}</td>
                    <td className="px-4 py-3 text-gray-900">-</td>
                    <td className="px-4 py-3 text-gray-900">{vo.heilmittelCode}</td>
                    <td className="px-4 py-3 text-gray-900">{vo.treatmentStatus}</td>
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
                            ? 'bg-gray-100 text-gray-800'
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
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            vo.fvoStatus === 'Bestellen'
                              ? 'bg-yellow-100 text-yellow-800'
                              : vo.fvoStatus === 'Bestelt'
                              ? 'bg-orange-100 text-orange-800'
                              : vo.fvoStatus === 'Erhalten'
                              ? 'bg-green-100 text-green-800'
                              : vo.fvoStatus === '1st Follow up'
                              ? 'bg-blue-100 text-blue-800'
                              : vo.fvoStatus === 'Anrufen'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {vo.fvoStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          vo.orderingStatus === 'By Therapist'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {vo.orderingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{vo.secondaryTreatmentStatus || '0'}</td>
                    <td className="px-4 py-3 text-gray-900">{vo.doubletreatment ? 'Ja' : 'Nein'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Patient-Level Modal */}
      <MarkAsOrderedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        affectedPatientsData={affectedPatientsData}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
