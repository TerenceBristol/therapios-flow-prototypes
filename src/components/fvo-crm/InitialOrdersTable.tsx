import React, { useState, useMemo } from 'react';
import { PracticeVO, PracticeDoctor, FVOCRMVOStatus, Therapist, Facility, OrderFormType } from '@/types';
import BulkActionToolbar from './BulkActionToolbar';
import VONotesModal from './modals/VONotesModal';

interface InitialOrdersTableProps {
  vos: PracticeVO[];
  doctors: PracticeDoctor[];
  therapists: Therapist[];
  facilities: Facility[];
  onStatusChange?: (voId: string, newStatus: FVOCRMVOStatus) => void;
  onGeneratePDF?: (selectedVOIds: string[], orderType: OrderFormType) => void;
  onNoteChange?: (voId: string, note: string) => void;
  onEditNote?: (voId: string, noteIndex: number, newText: string) => void;
  onDeleteNote?: (voId: string, noteIndex: number) => void;
  onBulkStatusChange?: (voIds: string[], newStatus: FVOCRMVOStatus) => void;
  onBulkNoteChange?: (voIds: string[], note: string) => void;
}

const InitialOrdersTable: React.FC<InitialOrdersTableProps> = ({
  vos,
  doctors,
  therapists,
  facilities,
  onStatusChange,
  onGeneratePDF,
  onNoteChange,
  onEditNote,
  onDeleteNote,
  onBulkStatusChange,
  onBulkNoteChange
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('all');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('all');
  const [selectedVOIds, setSelectedVOIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>('statusDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [notesModalVO, setNotesModalVO] = useState<PracticeVO | null>(null);
  const [showBulkNoteModal, setShowBulkNoteModal] = useState(false);
  const [bulkNoteText, setBulkNoteText] = useState('');

  // Filter to only show VOs with "Bestellen" status (initial orders)
  const initialOrderVOs = useMemo(() => {
    return vos.filter(vo => vo.status === 'Bestellen');
  }, [vos]);

  // Filter VOs by selected doctor
  const doctorFilteredVOs = useMemo(() => {
    if (selectedDoctorId === 'all') {
      return initialOrderVOs;
    }
    return initialOrderVOs.filter(vo => vo.doctorId === selectedDoctorId);
  }, [initialOrderVOs, selectedDoctorId]);

  // Calculate therapist stats (from doctor-filtered VOs)
  const therapistStats = useMemo(() => {
    const therapistMap = new Map<string, { therapist: Therapist; facility: Facility; voCount: number }>();

    doctorFilteredVOs.forEach(vo => {
      if (!vo.therapistId) return;

      const therapist = therapists.find(t => t.id === vo.therapistId);
      if (!therapist) return;

      const facility = facilities.find(f => f.id === therapist.facilityId);
      if (!facility) return;

      if (!therapistMap.has(vo.therapistId)) {
        therapistMap.set(vo.therapistId, { therapist, facility, voCount: 0 });
      }

      const stats = therapistMap.get(vo.therapistId)!;
      stats.voCount += 1;
    });

    return Array.from(therapistMap.values())
      .map(stats => ({
        therapistId: stats.therapist.id,
        therapistName: stats.therapist.name,
        facilityName: stats.facility.name,
        voCount: stats.voCount
      }))
      .sort((a, b) => a.therapistName.localeCompare(b.therapistName));
  }, [doctorFilteredVOs, therapists, facilities]);

  // Calculate facility stats (from doctor-filtered VOs)
  const facilityStats = useMemo(() => {
    const facilityMap = new Map<string, { facility: Facility; voCount: number }>();

    doctorFilteredVOs.forEach(vo => {
      if (!vo.therapistId) return;

      const therapist = therapists.find(t => t.id === vo.therapistId);
      if (!therapist) return;

      const facility = facilities.find(f => f.id === therapist.facilityId);
      if (!facility) return;

      if (!facilityMap.has(facility.id)) {
        facilityMap.set(facility.id, { facility, voCount: 0 });
      }

      const stats = facilityMap.get(facility.id)!;
      stats.voCount += 1;
    });

    return Array.from(facilityMap.values())
      .map(stats => ({
        facilityId: stats.facility.id,
        facilityName: stats.facility.name,
        voCount: stats.voCount
      }))
      .sort((a, b) => a.facilityName.localeCompare(b.facilityName));
  }, [doctorFilteredVOs, therapists, facilities]);

  // Filter VOs by selected therapist
  const therapistFilteredVOs = useMemo(() => {
    if (selectedTherapistId === 'all') {
      return doctorFilteredVOs;
    }
    return doctorFilteredVOs.filter(vo => vo.therapistId === selectedTherapistId);
  }, [doctorFilteredVOs, selectedTherapistId]);

  // Filter VOs by selected facility
  const filteredVOs = useMemo(() => {
    if (selectedFacilityId === 'all') {
      return therapistFilteredVOs;
    }
    return therapistFilteredVOs.filter(vo => {
      const therapist = therapists.find(t => t.id === vo.therapistId);
      return therapist?.facilityId === selectedFacilityId;
    });
  }, [therapistFilteredVOs, selectedFacilityId, therapists]);

  // Get doctors that have initial order VOs
  const doctorsWithVOs = useMemo(() => {
    const doctorIds = new Set(initialOrderVOs.map(vo => vo.doctorId));
    return doctors.filter(d => doctorIds.has(d.id));
  }, [doctors, initialOrderVOs]);

  // Sort VOs
  const sortedVOs = useMemo(() => {
    const sorted = [...filteredVOs];

    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortColumn) {
        case 'patientName':
          aValue = a.patientName.toLowerCase();
          bValue = b.patientName.toLowerCase();
          break;
        case 'doctor':
          const aDoctor = doctors.find(d => d.id === a.doctorId)?.name || '';
          const bDoctor = doctors.find(d => d.id === b.doctorId)?.name || '';
          aValue = aDoctor.toLowerCase();
          bValue = bDoctor.toLowerCase();
          break;
        case 'statusDate':
          aValue = new Date(a.statusTimestamp).getTime();
          bValue = new Date(b.statusTimestamp).getTime();
          break;
        case 'therapyType':
          aValue = a.therapyType;
          bValue = b.therapyType;
          break;
        case 'anzahl':
          aValue = a.anzahl;
          bValue = b.anzahl;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredVOs, sortColumn, sortDirection, doctors]);

  // Handle sort column click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (voId: string) => {
    const newSelected = new Set(selectedVOIds);
    if (newSelected.has(voId)) {
      newSelected.delete(voId);
    } else {
      newSelected.add(voId);
    }
    setSelectedVOIds(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedVOIds.size === sortedVOs.length) {
      setSelectedVOIds(new Set());
    } else {
      setSelectedVOIds(new Set(sortedVOs.map(vo => vo.id)));
    }
  };

  // Handle marking as "Bestellt" (ordered)
  const handleMarkAsOrdered = (voId: string) => {
    if (onStatusChange) {
      onStatusChange(voId, 'Bestellt');
    }
  };

  // Handle generate PDF for initial orders
  const handleGeneratePDF = () => {
    if (onGeneratePDF && selectedVOIds.size > 0) {
      const selectedVOsArray = Array.from(selectedVOIds);
      onGeneratePDF(selectedVOsArray, 'initial');
    }
  };

  // Handle bulk status change to "Bestellt"
  const handleBulkMarkAsOrdered = () => {
    if (onBulkStatusChange && selectedVOIds.size > 0) {
      onBulkStatusChange(Array.from(selectedVOIds), 'Bestellt');
      setSelectedVOIds(new Set());
    }
  };

  // Handle bulk note change
  const handleBulkNoteSubmit = () => {
    if (bulkNoteText.trim().length < 5) {
      alert('Note must be at least 5 characters');
      return;
    }
    if (bulkNoteText.length > 500) {
      alert('Note must be less than 500 characters');
      return;
    }

    if (window.confirm(`Add note to ${selectedVOIds.size} selected VOs?`)) {
      if (onBulkNoteChange && selectedVOIds.size > 0) {
        onBulkNoteChange(Array.from(selectedVOIds), bulkNoteText);
        setSelectedVOIds(new Set());
      }
      setBulkNoteText('');
      setShowBulkNoteModal(false);
    }
  };

  // Handle opening notes modal
  const handleOpenNotesModal = (vo: PracticeVO) => {
    setNotesModalVO(vo);
  };

  // Handle adding note from modal
  const handleAddNoteFromModal = (voId: string, note: string) => {
    if (onNoteChange) {
      onNoteChange(voId, note);
      setTimeout(() => {
        const updatedVO = vos.find(vo => vo.id === voId);
        if (updatedVO) {
          setNotesModalVO(updatedVO);
        }
      }, 0);
    }
  };

  // Handle editing note from modal
  const handleEditNoteFromModal = (voId: string, noteIndex: number, newText: string) => {
    if (onEditNote) {
      onEditNote(voId, noteIndex, newText);
      setTimeout(() => {
        const updatedVO = vos.find(vo => vo.id === voId);
        if (updatedVO) {
          setNotesModalVO(updatedVO);
        }
      }, 0);
    }
  };

  // Handle deleting note from modal
  const handleDeleteNoteFromModal = (voId: string, noteIndex: number) => {
    if (onDeleteNote) {
      onDeleteNote(voId, noteIndex);
      setTimeout(() => {
        const updatedVO = vos.find(vo => vo.id === voId);
        if (updatedVO) {
          setNotesModalVO(updatedVO);
        }
      }, 0);
    }
  };

  // Get doctor name by ID
  const getDoctorName = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId)?.name || 'Unknown Doctor';
  };

  // Sort indicator
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Bulk Action Toolbar (appears when items selected) */}
      {selectedVOIds.size > 0 && (
        <div className="sticky top-0 z-20 bg-blue-50 border-b-2 border-blue-200 px-4 py-3 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-blue-900">
                {selectedVOIds.size} {selectedVOIds.size === 1 ? 'VO' : 'VOs'} selected
              </span>
              <button
                onClick={() => setSelectedVOIds(new Set())}
                className="text-sm text-blue-700 hover:text-blue-900 underline"
              >
                Clear selection
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Add Note */}
              <button
                onClick={() => setShowBulkNoteModal(true)}
                className="px-4 py-2 bg-white border border-blue-300 rounded-md hover:bg-blue-50 text-sm font-medium text-blue-900 transition-colors"
              >
                Add Note
              </button>

              {/* Generate PDF */}
              <button
                onClick={handleGeneratePDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Generate Initial Order Form
              </button>

              {/* Change to Bestellt */}
              <button
                onClick={handleBulkMarkAsOrdered}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
              >
                Change to Bestellt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="p-4 border-b border-border bg-muted/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Filters
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            {/* Doctor Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="doctor-filter-initial" className="text-sm font-medium whitespace-nowrap">
                Doctor:
              </label>
              <select
                id="doctor-filter-initial"
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setSelectedTherapistId('all');
                  setSelectedVOIds(new Set());
                }}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm w-48"
              >
                <option value="all">All Doctors</option>
                {doctorsWithVOs.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Therapist Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="therapist-filter-initial" className="text-sm font-medium whitespace-nowrap">
                Therapist:
              </label>
              <select
                id="therapist-filter-initial"
                value={selectedTherapistId}
                onChange={(e) => {
                  setSelectedTherapistId(e.target.value);
                  setSelectedFacilityId('all');
                  setSelectedVOIds(new Set());
                }}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm w-64"
              >
                <option value="all">All Therapists ({doctorFilteredVOs.length} VOs)</option>
                {therapistStats.map(stat => (
                  <option key={stat.therapistId} value={stat.therapistId}>
                    {stat.therapistName} ({stat.voCount} {stat.voCount === 1 ? 'VO' : 'VOs'})
                  </option>
                ))}
              </select>
            </div>

            {/* Facility Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="facility-filter-initial" className="text-sm font-medium whitespace-nowrap">
                Facility:
              </label>
              <select
                id="facility-filter-initial"
                value={selectedFacilityId}
                onChange={(e) => {
                  setSelectedFacilityId(e.target.value);
                  setSelectedVOIds(new Set());
                }}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm w-64"
              >
                <option value="all">All Facilities ({therapistFilteredVOs.length} VOs)</option>
                {facilityStats.map(stat => (
                  <option key={stat.facilityId} value={stat.facilityId}>
                    {stat.facilityName} ({stat.voCount} {stat.voCount === 1 ? 'VO' : 'VOs'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* VO Count */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {sortedVOs.length} initial order{sortedVOs.length !== 1 ? 's' : ''}
            {selectedDoctorId !== 'all' && (
              <span> • Doctor: {doctors.find(d => d.id === selectedDoctorId)?.name}</span>
            )}
            {selectedTherapistId !== 'all' && (
              <span> • Therapist: {therapists.find(t => t.id === selectedTherapistId)?.name}</span>
            )}
            {selectedFacilityId !== 'all' && (
              <span> • Facility: {facilities.find(f => f.id === selectedFacilityId)?.name}</span>
            )}
          </div>

          {/* Clear Filters */}
          {(selectedDoctorId !== 'all' || selectedTherapistId !== 'all' || selectedFacilityId !== 'all') && (
            <button
              onClick={() => {
                setSelectedDoctorId('all');
                setSelectedTherapistId('all');
                setSelectedFacilityId('all');
                setSelectedVOIds(new Set());
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {sortedVOs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No initial orders found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr className="border-b border-border">
                <th className="p-2 text-left font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedVOIds.size === sortedVOs.length && sortedVOs.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                    aria-label="Select all VOs"
                  />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('patientName')}
                >
                  Patient Name <SortIndicator column="patientName" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('doctor')}
                >
                  Doctor <SortIndicator column="doctor" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('statusDate')}
                >
                  Created Date <SortIndicator column="statusDate" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('therapyType')}
                >
                  Heilmittel <SortIndicator column="therapyType" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('anzahl')}
                >
                  Anzahl <SortIndicator column="anzahl" />
                </th>
                <th className="p-2 text-left font-medium">
                  Geb. Datum
                </th>
                <th className="p-2 text-left font-medium">
                  Therapist
                </th>
                <th className="p-2 text-left font-medium">
                  Facility
                </th>
                <th className="p-2 text-left font-medium w-40">
                  Action
                </th>
                <th className="p-2 text-left font-medium w-48">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedVOs.map(vo => (
                <tr
                  key={vo.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedVOIds.has(vo.id)}
                      onChange={() => handleCheckboxToggle(vo.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-2 font-medium">{vo.patientName}</td>
                  <td className="p-2">{getDoctorName(vo.doctorId)}</td>
                  <td className="p-2 text-muted-foreground">{vo.statusDate}</td>
                  <td className="p-2 font-mono text-xs">{vo.therapyType}</td>
                  <td className="p-2 text-center">{vo.anzahl}</td>
                  <td className="p-2 text-sm text-muted-foreground">{vo.gebDatum}</td>
                  <td className="p-2 text-sm">
                    {therapists.find(t => t.id === vo.therapistId)?.name || '-'}
                  </td>
                  <td className="p-2 text-sm">{vo.facilityName}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleMarkAsOrdered(vo.id)}
                      className="px-3 py-1.5 bg-green-100 text-green-800 border border-green-200 rounded-md hover:bg-green-200 transition-colors text-xs font-medium"
                    >
                      Bestellt
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleOpenNotesModal(vo)}
                      className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded min-h-[2rem] text-xs w-full text-left flex items-center gap-2"
                      title="Click to view/add notes"
                    >
                      {vo.noteHistory && vo.noteHistory.length > 0 ? (
                        <>
                          <span className="text-sm">💬</span>
                          <span className="text-foreground">
                            {vo.noteHistory.length} {vo.noteHistory.length === 1 ? 'note' : 'notes'}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">Click to add note...</span>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Notes Modal */}
      {notesModalVO && (
        <VONotesModal
          isOpen={true}
          vo={notesModalVO}
          onClose={() => setNotesModalVO(null)}
          onAddNote={handleAddNoteFromModal}
          onEditNote={handleEditNoteFromModal}
          onDeleteNote={handleDeleteNoteFromModal}
        />
      )}

      {/* Bulk Note Modal */}
      {showBulkNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Bulk Note</h3>

            <div className="space-y-4">
              {/* Note Text */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Note
                  <span className="text-muted-foreground ml-2">
                    ({bulkNoteText.length}/500 characters)
                  </span>
                </label>
                <textarea
                  value={bulkNoteText}
                  onChange={(e) => setBulkNoteText(e.target.value)}
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
                    setShowBulkNoteModal(false);
                    setBulkNoteText('');
                  }}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkNoteSubmit}
                  disabled={bulkNoteText.trim().length < 5}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply to {selectedVOIds.size} VOs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialOrdersTable;
