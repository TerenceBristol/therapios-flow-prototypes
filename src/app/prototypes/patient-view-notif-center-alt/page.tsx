'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import patientData from '@/data/patientViewDataAlt.json';
import { VO } from '@/data/voTypesAlt';
import PatientSectionV2 from '@/components/patient-view/PatientSectionV2';
import SectionHeaderRow from '@/components/patient-view/SectionHeaderRow';
import { useNotificationContext } from '@/contexts/NotificationContext';

type TabType = 'my_vos' | 'shared_vos' | 'calendar';

interface Patient {
  id: string;
  name: string;
  lastName: string;
  vos: VO[];
}

export default function PatientViewNotifCenterAltPrototype() {
  const [activeTab, setActiveTab] = useState<TabType>('my_vos');
  const [selectedVOs, setSelectedVOs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isWithActiveExpanded, setIsWithActiveExpanded] = useState(true);
  const [isWithoutActiveExpanded, setIsWithoutActiveExpanded] = useState(false);
  const [highlightedVO, setHighlightedVO] = useState<string | null>(null);
  const [expandedCompletedPatient, setExpandedCompletedPatient] = useState<string | null>(null);
  const { viewVORequest, clearViewVORequest } = useNotificationContext();
  const voRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  // Process patient data and add unique IDs to VOs
  const processedPatients: Patient[] = useMemo(() => {
    return patientData.patients.map(patient => ({
      ...patient,
      vos: patient.vos.map((vo, idx) => ({
        ...(vo as VO),
        id: `${patient.id}-vo-${idx}`
      }))
    }));
  }, []);

  // Filter patients based on active tab
  const filteredPatients = useMemo(() => {
    if (activeTab === 'my_vos') {
      // Show patients where S. Zeibig is primary therapist
      return processedPatients.filter(p =>
        p.vos.some(vo => vo.primaererTherapeut === 'S. Zeibig')
      );
    } else if (activeTab === 'shared_vos') {
      // Show patients where S. Zeibig is shared therapist
      return processedPatients.filter(p =>
        p.vos.some(vo =>
          vo.geteilterTherapeut && vo.geteilterTherapeut.includes('S. Zeibig')
        )
      );
    }
    return [];
  }, [activeTab, processedPatients]);

  // Apply search filter
  const searchedPatients = useMemo(() => {
    if (!searchTerm) return filteredPatients;
    const term = searchTerm.toLowerCase();
    return filteredPatients.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.vos.some(vo => vo.voNr.toLowerCase().includes(term))
    );
  }, [filteredPatients, searchTerm]);

  // Separate patients into with active / without active
  const { patientsWithActive, patientsWithoutActive } = useMemo(() => {
    const withActive: Patient[] = [];
    const withoutActive: Patient[] = [];

    searchedPatients.forEach(patient => {
      const hasActive = patient.vos.some(vo => vo.voStatus === 'Aktiv');
      if (hasActive) {
        withActive.push(patient);
      } else {
        withoutActive.push(patient);
      }
    });

    // Sort both by last name
    const sortByLastName = (a: Patient, b: Patient) => a.lastName.localeCompare(b.lastName);
    withActive.sort(sortByLastName);
    withoutActive.sort(sortByLastName);

    return { patientsWithActive: withActive, patientsWithoutActive: withoutActive };
  }, [searchedPatients]);

  // Get active and non-active VOs for each patient
  const getActiveVOs = (vos: VO[]) => vos.filter(vo => vo.voStatus === 'Aktiv');
  const getNonActiveVOs = (vos: VO[]) => vos.filter(vo => vo.voStatus !== 'Aktiv');

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
  };

  const handleClearSelection = () => {
    setSelectedVOs(new Set());
  };

  // Handle View VO navigation from notifications
  useEffect(() => {
    if (!viewVORequest) return;

    const { patientId, voNumber, targetTab } = viewVORequest;

    // Step 1: Switch to the correct tab
    const tabType: TabType = targetTab === 'my-vos' ? 'my_vos' : 'shared_vos';
    setActiveTab(tabType);

    // Step 2: Find the patient in the processed data
    const patient = processedPatients.find(p => p.id === patientId);
    if (!patient) {
      console.warn(`Patient ${patientId} not found`);
      clearViewVORequest();
      return;
    }

    // Step 3: Find the VO
    const vo = patient.vos.find(v => v.voNr === voNumber);
    if (!vo) {
      console.warn(`VO ${voNumber} not found for patient ${patientId}`);
      clearViewVORequest();
      return;
    }

    // Step 4: Determine which section the patient is in and expand it
    const hasActiveVO = patient.vos.some(v => v.voStatus === 'Aktiv');
    if (hasActiveVO) {
      setIsWithActiveExpanded(true);
    } else {
      setIsWithoutActiveExpanded(true);
    }

    // Step 4.5: Check if the VO is completed/non-active and expand completed VOs if needed
    const isNonActiveVO = vo.voStatus !== 'Aktiv';
    if (isNonActiveVO && hasActiveVO) {
      // Patient has active VOs but we need to show a completed one
      setExpandedCompletedPatient(patientId);
    } else {
      setExpandedCompletedPatient(null);
    }

    // Step 5: Highlight and scroll to the VO (with delay to ensure DOM is ready)
    setTimeout(() => {
      // Highlight the VO
      setHighlightedVO(voNumber);

      // Scroll to the VO if we have a ref
      const voKey = `${patientId}-${voNumber}`;
      const voElement = voRefs.current[voKey];
      if (voElement) {
        voElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      // Clear highlight after 3 seconds (keep section expanded)
      setTimeout(() => {
        setHighlightedVO(null);
      }, 3000);

      // Clear the request
      clearViewVORequest();
    }, 300);
  }, [viewVORequest, processedPatients, clearViewVORequest]);

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-1">
            Hallo Sandra Zeibig, ich hoffe, Du hast einen wundervollen Tag.
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Deine Übersicht</h2>
          </div>
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
        <div className="sticky top-0 z-20 bg-white rounded-t-lg border border-gray-200">
          <div className="px-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('my_vos')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'my_vos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My VOs
            </button>
            <button
              onClick={() => setActiveTab('shared_vos')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'shared_vos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Shared VOs
            </button>
            <button
              className="px-6 py-3 text-sm text-gray-400 cursor-not-allowed"
              disabled
            >
              Calendar
            </button>
          </div>
          </div>

          {/* Filter section */}
          <div className="bg-white">
            {/* Filter Row with Action Buttons */}
            <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              {/* Left: Filter dropdowns */}
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                <option>Spalten anzeigen</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                <option>ECH</option>
              </select>

              {/* Center: Action buttons (only visible when VOs selected) */}
              <div className="flex-1 flex justify-center">
                {selectedVOs.size > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDokuErfassen}
                      className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Doku erfassen ({selectedVOs.size})
                    </button>
                    <button
                      onClick={() => alert('Abbrechen VO')}
                      className="px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 transition-colors"
                    >
                      Abbrechen VO
                    </button>
                    <button
                      onClick={() => alert('Zu Bestellen by Therapist')}
                      className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Zu Bestellen by Therapist
                    </button>
                    <button
                      onClick={() => alert('Transfer Patient')}
                      className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-900 transition-colors"
                    >
                      Transfer Patient
                    </button>
                    <button
                      onClick={() => alert('Patient teilen')}
                      className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Patient teilen ({selectedVOs.size})
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Suchen"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
                <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            </div>
          </div>

          {/* Table #1 - Header Only (inside sticky container) */}
          {activeTab !== 'calendar' && (
            <div className="px-4">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr className="border-b border-gray-300">
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Select</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Organizer</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tage s.l. Beh</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">VO Nr.</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">VO Status</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Doku</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Heilmittel</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ICD</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">TB</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Einrichtung</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Primärer Therapeut</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Geteilter Therapeut</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Beh. Wbh</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Abgelehnte Beh.</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Doppel-B</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Frequenz</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Arzt</th>
                  </tr>
                </thead>
              </table>
            </div>
          )}
        </div>

        {/* Patient Table - Body Only */}
        <div className="px-4">
            {activeTab === 'calendar' ? (
              <div className="py-12 text-center text-gray-500">
                Calendar view coming soon
              </div>
            ) : (
              <table className="w-full border-collapse">

                {/* Section 1: Patients WITH active VOs */}
                {patientsWithActive.length > 0 && (
                  <SectionHeaderRow
                    title="Patients with Active VOs"
                    isExpanded={isWithActiveExpanded}
                    onToggle={() => setIsWithActiveExpanded(!isWithActiveExpanded)}
                  />
                )}
                {isWithActiveExpanded && patientsWithActive.map(patient => {
                  const activeVOs = getActiveVOs(patient.vos);
                  const nonActiveVOs = getNonActiveVOs(patient.vos);
                  return (
                    <PatientSectionV2
                      key={patient.id}
                      patientName={patient.name}
                      patientId={patient.id}
                      vos={patient.vos}
                      activeVOs={activeVOs}
                      nonActiveVOs={nonActiveVOs}
                      selectedVOs={selectedVOs}
                      onVOCheck={handleVOCheck}
                      highlightedVO={highlightedVO}
                      voRefs={voRefs}
                      forceExpandCompleted={expandedCompletedPatient === patient.id}
                    />
                  );
                })}

                {/* Spacer row between sections */}
                {patientsWithActive.length > 0 && patientsWithoutActive.length > 0 && (
                  <tbody>
                    <tr>
                      <td colSpan={18} className="py-4 bg-gray-50"></td>
                    </tr>
                  </tbody>
                )}

                {/* Section 2: Patients WITHOUT active VOs */}
                {patientsWithoutActive.length > 0 && (
                  <SectionHeaderRow
                    title="Patients without Active VOs"
                    isExpanded={isWithoutActiveExpanded}
                    onToggle={() => setIsWithoutActiveExpanded(!isWithoutActiveExpanded)}
                  />
                )}
                {isWithoutActiveExpanded && patientsWithoutActive.map(patient => {
                  const activeVOs = getActiveVOs(patient.vos);
                  const nonActiveVOs = getNonActiveVOs(patient.vos);
                  return (
                    <PatientSectionV2
                      key={patient.id}
                      patientName={patient.name}
                      patientId={patient.id}
                      vos={patient.vos}
                      activeVOs={activeVOs}
                      nonActiveVOs={nonActiveVOs}
                      selectedVOs={selectedVOs}
                      onVOCheck={handleVOCheck}
                      highlightedVO={highlightedVO}
                      voRefs={voRefs}
                      forceExpandCompleted={expandedCompletedPatient === patient.id}
                    />
                  );
                })}

                {/* Empty state */}
                {patientsWithActive.length === 0 && patientsWithoutActive.length === 0 && (
                  <tbody>
                    <tr>
                      <td colSpan={18} className="px-4 py-12 text-center text-gray-500">
                        No patients in this category
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            )}
          </div>
      </main>
    </>
  );
}
