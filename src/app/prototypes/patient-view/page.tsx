'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import patientData from '@/data/patientViewData.json';

// Local type definitions (isolated to this component)
interface VORecord {
  name: string;
  voNr: string;
  ausstDatum: string;
  heilmittel: string;
  behStatus: string;
  tb: string;
  einrichtung: string;
  primaererTherapeut: string;
  geteilterTherapeut: string;
  voStatus: string;
  fVoStatus: string;
}

interface PatientData {
  id: string;
  name: string;
  lastName: string;
  aktivCount: number;
  otherCount: number;
  vos: VORecord[];
}

interface TreatmentSession {
  behNr: number;
  datum: string;
  bemerkungen: string;
  dokuTyp: string;
  therapeut: string;
}

type SortColumn = 'ausstDatum' | 'voStatus' | 'behStatus';
type SortDirection = 'asc' | 'desc';

export default function PatientView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());
  const [selectedDokuVO, setSelectedDokuVO] = useState<VORecord | null>(null);
  const [expandedTreatments, setExpandedTreatments] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection; patientId: string | null }>({
    column: 'ausstDatum',
    direction: 'desc',
    patientId: null
  });

  const patients: PatientData[] = patientData.patients;

  // Filter patients by search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle expand/collapse for a patient
  const togglePatient = (patientId: string) => {
    setExpandedPatients(prev => {
      const next = new Set(prev);
      if (next.has(patientId)) {
        next.delete(patientId);
      } else {
        next.add(patientId);
      }
      return next;
    });
  };

  // Sort VOs
  const getSortedVOs = (vos: VORecord[], patientId: string) => {
    // Only apply sorting to the currently sorted patient
    if (sortConfig.patientId !== patientId) {
      // Default sort: newest first
      return [...vos].sort((a, b) => new Date(b.ausstDatum).getTime() - new Date(a.ausstDatum).getTime());
    }

    const sorted = [...vos];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.column) {
        case 'ausstDatum':
          comparison = new Date(a.ausstDatum).getTime() - new Date(b.ausstDatum).getTime();
          break;
        case 'voStatus':
          comparison = a.voStatus.localeCompare(b.voStatus);
          break;
        case 'behStatus':
          const aCompleted = parseInt(a.behStatus.split('/')[0]);
          const bCompleted = parseInt(b.behStatus.split('/')[0]);
          comparison = aCompleted - bCompleted;
          break;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  // Handle column header click
  const handleSort = (column: SortColumn, patientId: string) => {
    setSortConfig(prev => {
      if (prev.column === column && prev.patientId === patientId) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
          patientId
        };
      }
      return {
        column,
        direction: 'desc',
        patientId
      };
    });
  };

  // Generate treatment sessions based on behStatus
  const generateTreatmentSessions = (vo: VORecord): TreatmentSession[] => {
    const [completed] = vo.behStatus.split('/').map(Number);
    const sessions: TreatmentSession[] = [];

    const notes = [
      'Patient zeigt gute Fortschritte',
      'Behandlung wie vereinbart durchgeführt',
      'Mobilität verbessert sich',
      'this is testing the offline feature',
      'Schmerzlevel deutlich reduziert',
      'Übungen wurden gut ausgeführt',
      'Keine besonderen Vorkommnisse',
      'Patient motiviert und kooperativ'
    ];

    for (let i = 1; i <= Math.min(completed, 10); i++) {
      const startDate = new Date(vo.ausstDatum);
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + (i - 1) * 7); // Weekly sessions

      sessions.push({
        behNr: i,
        datum: sessionDate.toISOString().split('T')[0],
        bemerkungen: notes[Math.floor(Math.random() * notes.length)],
        dokuTyp: 'Durchgeführt',
        therapeut: vo.primaererTherapeut
      });
    }

    return sessions.reverse(); // Newest first
  };

  // Open Doku modal
  const openDokuModal = (vo: VORecord) => {
    setSelectedDokuVO(vo);
    setExpandedTreatments(new Set());
  };

  // Close Doku modal
  const closeDokuModal = () => {
    setSelectedDokuVO(null);
    setExpandedTreatments(new Set());
  };

  // Toggle treatment row expansion
  const toggleTreatment = (behNr: number) => {
    setExpandedTreatments(prev => {
      const next = new Set(prev);
      if (next.has(behNr)) {
        next.delete(behNr);
      } else {
        next.add(behNr);
      }
      return next;
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Sort indicator component
  const SortIndicator = ({ column, patientId }: { column: SortColumn; patientId: string }) => {
    if (sortConfig.column !== column || sortConfig.patientId !== patientId) {
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-[1600px]">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            Patienten-Übersicht
          </h1>

          {/* Search Bar */}
          <div className="relative w-96">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              🔍
            </div>
            <input
              type="text"
              placeholder="Patient suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-foreground"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Patient List */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Keine Patienten gefunden
            </h3>
            <p className="text-muted-foreground">
              Versuchen Sie einen anderen Suchbegriff
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
            {filteredPatients.map((patient) => {
              const isExpanded = expandedPatients.has(patient.id);
              const sortedVOs = getSortedVOs(patient.vos, patient.id);

              return (
                <div key={patient.id} className="border-b border-border last:border-b-0">
                  {/* Collapsed Patient Row */}
                  <div
                    onClick={() => togglePatient(patient.id)}
                    className="flex items-center gap-4 px-6 py-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    {/* Expand/Collapse Icon */}
                    <div className="text-muted-foreground transition-transform duration-300"
                         style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      ▶
                    </div>

                    {/* Patient Name */}
                    <div className="flex-1 font-bold text-foreground">
                      {patient.name}
                    </div>

                    {/* Offene VOs Count Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Offene VOs:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {patient.aktivCount}
                      </span>
                    </div>

                    {/* Abgeschlossene VOs Count Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Abgeschlossene VOs:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                        {patient.otherCount}
                      </span>
                    </div>
                  </div>

                  {/* Expanded VO Table */}
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isExpanded ? '2000px' : '0px',
                      opacity: isExpanded ? 1 : 0
                    }}
                  >
                    <div className="px-6 py-4 bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border w-28">VO Nr.</th>
                              <th
                                className="px-3 py-2 text-left font-semibold text-foreground border-b border-border w-32 cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('ausstDatum', patient.id)}
                              >
                                <div className="flex items-center">
                                  Ausst. Datum
                                  <SortIndicator column="ausstDatum" patientId={patient.id} />
                                </div>
                              </th>
                              <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border w-24">Heilmittel</th>
                              <th
                                className="px-3 py-2 text-left font-semibold text-foreground border-b border-border w-24 cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('behStatus', patient.id)}
                              >
                                <div className="flex items-center">
                                  Beh Status
                                  <SortIndicator column="behStatus" patientId={patient.id} />
                                </div>
                              </th>
                              <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border w-16">TB</th>
                              <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">Einrichtung</th>
                              <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">Primärer Therapeut</th>
                              <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">Geteilter Therapeut</th>
                              <th
                                className="px-3 py-2 text-left font-semibold text-foreground border-b border-border cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('voStatus', patient.id)}
                              >
                                <div className="flex items-center">
                                  VO Status
                                  <SortIndicator column="voStatus" patientId={patient.id} />
                                </div>
                              </th>
                              <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">F.VO Status</th>
                              <th className="px-3 py-2 text-center font-semibold text-foreground border-b border-border w-20">Doku</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedVOs.map((vo, index) => (
                              <tr
                                key={index}
                                className={`hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                              >
                                <td className="px-3 py-2 text-foreground font-mono text-xs">{vo.voNr}</td>
                                <td className="px-3 py-2 text-foreground">{formatDate(vo.ausstDatum)}</td>
                                <td className="px-3 py-2 text-foreground">
                                  {vo.heilmittel}
                                </td>
                                <td className="px-3 py-2 text-foreground font-mono text-xs">{vo.behStatus}</td>
                                <td className="px-3 py-2">
                                  {vo.tb === 'Ja' ? (
                                    <button className="text-primary hover:underline cursor-pointer">
                                      Ja
                                    </button>
                                  ) : (
                                    <span className="text-muted-foreground">Nein</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-foreground">{vo.einrichtung}</td>
                                <td className="px-3 py-2 text-foreground">{vo.primaererTherapeut}</td>
                                <td className="px-3 py-2 text-foreground text-muted-foreground">
                                  {vo.geteilterTherapeut}
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    vo.voStatus === 'Aktiv'
                                      ? 'bg-green-50 text-green-700'
                                      : vo.voStatus === 'Fertig Behandelt'
                                      ? 'bg-blue-50 text-blue-700'
                                      : vo.voStatus === 'Abgerechnet'
                                      ? 'bg-purple-50 text-purple-700'
                                      : vo.voStatus === 'Abgebrochen'
                                      ? 'bg-orange-50 text-orange-700'
                                      : 'bg-gray-50 text-gray-700'
                                  }`}>
                                    {vo.voStatus}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-foreground text-sm">{vo.fVoStatus}</td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    onClick={() => openDokuModal(vo)}
                                    className="text-xl hover:scale-110 transition-transform cursor-pointer"
                                    title="Dokumentation anzeigen"
                                  >
                                    👁
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-primary hover:underline"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </main>

      {/* Treatment History Modal */}
      {selectedDokuVO && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDokuModal}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
              <h2 className="text-xl font-bold text-foreground">
                Documentation (Treatment History)
              </h2>
              <button
                onClick={closeDokuModal}
                className="text-2xl text-muted-foreground hover:text-foreground transition-colors"
              >
                ×
              </button>
            </div>

            {/* Patient Metadata */}
            <div className="px-6 py-4 bg-gray-50 border-b border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Patient Name</div>
                  <div className="font-semibold text-foreground">{selectedDokuVO.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Facility</div>
                  <div className="font-semibold text-foreground">{selectedDokuVO.einrichtung}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Prescription</div>
                  <div className="font-semibold text-foreground font-mono">{selectedDokuVO.voNr}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Doctor</div>
                  <div className="font-semibold text-foreground">Dr. Unknown MVZ Großhans</div>
                </div>
              </div>
            </div>

            {/* Treatment History Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground border-b border-border w-20">Beh. #</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground border-b border-border w-32">Datum</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground border-b border-border">Bemerkungen</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground border-b border-border w-16">Doku</th>
                  </tr>
                </thead>
                <tbody>
                  {generateTreatmentSessions(selectedDokuVO).map((session, index) => {
                    const isExpanded = expandedTreatments.has(session.behNr);

                    return (
                      <React.Fragment key={session.behNr}>
                        <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-foreground font-mono">{session.behNr}</td>
                          <td className="px-4 py-3 text-foreground">{formatDate(session.datum)}</td>
                          <td className="px-4 py-3 text-foreground">{session.bemerkungen}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleTreatment(session.behNr)}
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold transition-colors"
                            >
                              D
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td colSpan={4} className="px-4 pb-4">
                              <div className="border-t border-gray-200 pt-3 ml-8">
                                <div className="grid grid-cols-3 gap-4 items-center">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Doku Typ</div>
                                    <select
                                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                                      value={session.dokuTyp}
                                      onChange={() => {}}
                                    >
                                      <option>Durchgeführt</option>
                                      <option>Ausgefallen</option>
                                      <option>Verschoben</option>
                                      <option>Keine Doku</option>
                                    </select>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Therapeut</div>
                                    <div className="px-3 py-2 text-foreground text-sm">{session.therapeut}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Aktionen</div>
                                    <button className="text-primary hover:opacity-80 transition-opacity">
                                      ✏️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-2 bg-gray-50 border-t border-border">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
