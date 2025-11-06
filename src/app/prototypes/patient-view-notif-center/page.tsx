'use client';

import { useState } from 'react';
import { getPatientsWithActiveVOs, getPatientsWithoutActiveVOs } from '@/utils/voGrouping';
import { GroupedPatient } from '@/data/voTypes';
import PatientRow from '@/components/patient-view/PatientRow';

type TabType = 'with_active' | 'without_active' | 'shared' | 'calendar';

type SortColumn = 'patient' | 'facility' | 'days' | 'activeVOs' | 'primary' | 'shared' | 'ordering' | null;
type SortDirection = 'asc' | 'desc' | null;

export default function PatientViewNotifCenterPrototype() {
  const [activeTab, setActiveTab] = useState<TabType>('with_active');
  const [selectedVOs, setSelectedVOs] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn>('patient');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandAll, setExpandAll] = useState(false);

  // Get patient data
  const patientsWithActive = getPatientsWithActiveVOs();
  const patientsWithoutActive = getPatientsWithoutActiveVOs();

  // Determine which patients to show based on active tab
  const getCurrentPatients = (): GroupedPatient[] => {
    switch (activeTab) {
      case 'with_active':
        return patientsWithActive;
      case 'without_active':
        return patientsWithoutActive;
      case 'shared':
        // Show patients where Sandra Zeibig is a shared therapist (not primary)
        return patientsWithActive.filter(p =>
          p.sharedTherapists.some(t => t.includes('Zeibig') || t.includes('S. Zeibig'))
        );
      default:
        return [];
    }
  };

  const currentPatients = getCurrentPatients();

  // Sort patients
  const sortedPatients = [...currentPatients].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    const multiplier = sortDirection === 'asc' ? 1 : -1;

    switch (sortColumn) {
      case 'patient':
        return multiplier * a.name.localeCompare(b.name);
      case 'facility':
        return multiplier * a.facility.localeCompare(b.facility);
      case 'days':
        return multiplier * (a.daysSinceLastTreatment - b.daysSinceLastTreatment);
      case 'activeVOs':
        return multiplier * (a.activeVOCount - b.activeVOCount);
      case 'primary':
        return multiplier * a.primaryTherapist.localeCompare(b.primaryTherapist);
      case 'shared':
        const aShared = a.sharedTherapists.join(', ');
        const bShared = b.sharedTherapists.join(', ');
        return multiplier * aShared.localeCompare(bShared);
      case 'ordering':
        return multiplier * a.orderingStatus.localeCompare(b.orderingStatus);
      default:
        return 0;
    }
  });

  // Handle VO checkbox changes
  const handleVOCheck = (voId: string, checked: boolean) => {
    const newSelected = new Set(selectedVOs);
    if (checked) {
      newSelected.add(voId);
    } else {
      newSelected.delete(voId);
    }
    setSelectedVOs(newSelected);
  };

  // Handle VO actions
  const handleDokuErfassen = () => {
    alert(`Doku erfassen for ${selectedVOs.size} VOs`);
    // In real implementation, would open documentation modal
  };

  const handleClearSelection = () => {
    setSelectedVOs(new Set());
  };

  // Handle patient actions
  const handlePatientAction = (action: string, patient: GroupedPatient) => {
    alert(`Action "${action}" for patient: ${patient.name}`);
    // In real implementation, would open appropriate modal/dialog
  };

  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-blue-100 border-b border-blue-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="text-blue-600">✨</div>
            <div className="flex-1">
              <div className="font-semibold text-blue-900 text-sm">New Feature</div>
              <div className="text-sm text-blue-800">We have a new feature on the blabva</div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-1">
            Hallo Sandra Zeibig, ich hoffe, Du hast einen wundervollen Tag.
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Deine Übersicht</h2>
        </div>

        {/* Refresh button */}
        <div className="mb-4">
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Aktualisieren um neue VOs zu sehen
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('with_active')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'with_active'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mit Aktiven VOs ({patientsWithActive.length})
            </button>
            <button
              onClick={() => setActiveTab('without_active')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'without_active'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ohne Aktive VOs ({patientsWithoutActive.length})
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'shared'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Geteilte VOs ({patientsWithActive.filter(p => p.sharedTherapists.length > 0).length})
            </button>
            <button
              className="px-6 py-3 text-sm text-gray-400 cursor-not-allowed"
              disabled
            >
              Kalender
            </button>
          </div>

          {/* Sticky Filter Row with Action Button */}
          <div className="sticky top-0 z-40 p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              {/* Left: Filter dropdowns */}
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                <option>Spalten anzeigen</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                <option>ECH</option>
              </select>

              {/* Sort dropdown */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                value={sortColumn && sortDirection ? `${sortColumn}-${sortDirection}` : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setSortColumn(null);
                    setSortDirection(null);
                  } else {
                    const [col, dir] = value.split('-') as [SortColumn, SortDirection];
                    setSortColumn(col);
                    setSortDirection(dir);
                  }
                }}
              >
                <option value="">Sort by...</option>
                <option value="patient-asc">Patient Name (A-Z)</option>
                <option value="patient-desc">Patient Name (Z-A)</option>
                <option value="facility-asc">Facility (A-Z)</option>
                <option value="facility-desc">Facility (Z-A)</option>
                <option value="days-asc">Days (Low to High)</option>
                <option value="days-desc">Days (High to Low)</option>
                <option value="activeVOs-asc">Active VOs (Low to High)</option>
                <option value="activeVOs-desc">Active VOs (High to Low)</option>
              </select>

              {/* Expand/Collapse All Button */}
              <button
                onClick={() => setExpandAll(!expandAll)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                {expandAll ? 'Collapse All' : 'Expand All'}
              </button>

              {/* Center: Doku erfassen button (only visible when VOs selected) */}
              <div className="flex-1 flex justify-center">
                {selectedVOs.size > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDokuErfassen}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Doku erfassen ({selectedVOs.size})
                    </button>
                    <button
                      onClick={handleClearSelection}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Suchen"
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
                <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Patient Cards */}
          <div className="bg-white">
            {sortedPatients.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500">
                No patients in this category
              </div>
            ) : (
              <div>
                {sortedPatients.map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    selectedVOs={selectedVOs}
                    onVOCheck={handleVOCheck}
                    onPatientAction={handlePatientAction}
                    expandAll={expandAll}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
