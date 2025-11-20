import React, { useState, useMemo } from 'react';
import { PracticeVO, PracticeDoctor, FVOCRMVOStatus, Therapist, Facility, OrderFormType } from '@/types';
import BulkActionToolbar from './BulkActionToolbar';
import VONotesModal from './modals/VONotesModal';

interface VOsTableProps {
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

const VOsTable: React.FC<VOsTableProps> = ({
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
  const [statusFilter, setStatusFilter] = useState<'all' | FVOCRMVOStatus>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('all');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('all');
  const [selectedVOIds, setSelectedVOIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>('statusDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [notesModalVO, setNotesModalVO] = useState<PracticeVO | null>(null);

  // Filter out VOs with "Received" status (In Transit VOs are still shown for tracking)
  const displayVOs = useMemo(() => {
    return vos.filter(vo => vo.status !== 'Received');
  }, [vos]);

  // Filter VOs by status
  const statusFilteredVOs = useMemo(() => {
    if (statusFilter === 'all') {
      return displayVOs;
    }
    return displayVOs.filter(vo => vo.status === statusFilter);
  }, [displayVOs, statusFilter]);

  // Calculate VO counts per status (for tab badges)
  const statusCounts = useMemo(() => {
    const counts: Record<FVOCRMVOStatus | 'all', number> = {
      all: displayVOs.length,
      'Bestellt': displayVOs.filter(vo => vo.status === 'Bestellt').length,
      'Nachverfolgen': displayVOs.filter(vo => vo.status === 'Nachverfolgen').length,
      'Nachverfolgt': displayVOs.filter(vo => vo.status === 'Nachverfolgt').length,
      'Telefonieren': displayVOs.filter(vo => vo.status === 'Telefonieren').length,
      'Telefoniert': displayVOs.filter(vo => vo.status === 'Telefoniert').length,
      'Paused by Doctor': displayVOs.filter(vo => vo.status === 'Paused by Doctor').length,
      'In Transit': displayVOs.filter(vo => vo.status === 'In Transit').length,
      'Received': displayVOs.filter(vo => vo.status === 'Received').length,
      'Keine-Folge VO': displayVOs.filter(vo => vo.status === 'Keine-Folge VO').length,
    };
    return counts;
  }, [displayVOs]);

  // Filter VOs by selected doctor
  const doctorFilteredVOs = useMemo(() => {
    if (selectedDoctorId === 'all') {
      return statusFilteredVOs;
    }
    return statusFilteredVOs.filter(vo => vo.doctorId === selectedDoctorId);
  }, [statusFilteredVOs, selectedDoctorId]);

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

  // Get doctors that have VOs
  const doctorsWithVOs = useMemo(() => {
    const doctorIds = new Set(displayVOs.map(vo => vo.doctorId));
    return doctors.filter(d => doctorIds.has(d.id));
  }, [doctors, displayVOs]);

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
        case 'status':
          aValue = a.status;
          bValue = b.status;
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

  // Handle status change
  const handleStatusChange = (voId: string, newStatus: FVOCRMVOStatus) => {
    if (onStatusChange) {
      onStatusChange(voId, newStatus);
    }
  };

  // Handle generate PDF
  const handleGeneratePDF = () => {
    if (onGeneratePDF && selectedVOIds.size > 0) {
      const selectedVOsArray = Array.from(selectedVOIds);
      // Default to 'followup' since we removed initial orders
      onGeneratePDF(selectedVOsArray, 'followup');
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = (newStatus: FVOCRMVOStatus) => {
    if (onBulkStatusChange && selectedVOIds.size > 0) {
      onBulkStatusChange(Array.from(selectedVOIds), newStatus);
      setSelectedVOIds(new Set());
    }
  };

  // Handle bulk note change
  const handleBulkNoteChange = (note: string) => {
    if (onBulkNoteChange && selectedVOIds.size > 0) {
      onBulkNoteChange(Array.from(selectedVOIds), note);
      setSelectedVOIds(new Set());
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
      // Refresh the modal's VO state with the updated VO to show changes immediately
      // Use setTimeout to allow parent state to update first
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
      // Refresh the modal's VO state with the updated VO to show changes immediately
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
      // Refresh the modal's VO state with the updated VO to show changes immediately
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

  // Status color mapping with exhaustiveness check
  const getStatusColor = (status: FVOCRMVOStatus) => {
    switch (status) {
      case 'Bestellt':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Nachverfolgen':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Nachverfolgt':
        return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'Telefonieren':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Telefoniert':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Paused by Doctor':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Received':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Keine-Folge VO':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        const _exhaustive: never = status;
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Sort indicator
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const allStatuses: FVOCRMVOStatus[] = ['Bestellt', 'Nachverfolgen', 'Nachverfolgt', 'Telefonieren', 'Telefoniert', 'Paused by Doctor', 'In Transit', 'Keine-Folge VO'];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Bulk Action Toolbar (appears when items selected) */}
      {selectedVOIds.size > 0 && (
        <BulkActionToolbar
          selectedCount={selectedVOIds.size}
          orderTypeFilter={'followup'}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkNote={handleBulkNoteChange}
          onGeneratePDF={handleGeneratePDF}
          onClearSelection={() => setSelectedVOIds(new Set())}
        />
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
            <label htmlFor="doctor-filter" className="text-sm font-medium whitespace-nowrap">
              Doctor:
            </label>
            <select
              id="doctor-filter"
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedTherapistId('all'); // Reset therapist filter when doctor changes
                setSelectedVOIds(new Set()); // Clear selections when changing filter
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
            <label htmlFor="therapist-filter" className="text-sm font-medium whitespace-nowrap">
              Therapist:
            </label>
            <select
              id="therapist-filter"
              value={selectedTherapistId}
              onChange={(e) => {
                setSelectedTherapistId(e.target.value);
                setSelectedFacilityId('all'); // Reset facility filter when therapist changes
                setSelectedVOIds(new Set()); // Clear selections when changing filter
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
            <label htmlFor="facility-filter" className="text-sm font-medium whitespace-nowrap">
              Facility:
            </label>
            <select
              id="facility-filter"
              value={selectedFacilityId}
              onChange={(e) => {
                setSelectedFacilityId(e.target.value);
                setSelectedVOIds(new Set()); // Clear selections when changing filter
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

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-0.5 mb-4 border-b border-border bg-muted/20 px-2">
          <button
            onClick={() => {
              setStatusFilter('all');
              setSelectedVOIds(new Set());
            }}
            className={`px-3 py-2 text-xs font-medium transition-colors relative whitespace-nowrap ${
              statusFilter === 'all'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({statusCounts.all})
            {statusFilter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          {allStatuses.map(status => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setSelectedVOIds(new Set());
              }}
              className={`px-3 py-2 text-xs font-medium transition-colors relative whitespace-nowrap ${
                statusFilter === status
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status} ({statusCounts[status]})
              {statusFilter === status && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>

        {/* VO Count and Active Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {sortedVOs.length} {sortedVOs.length === 1 ? 'VO' : 'VOs'}
            {statusFilter !== 'all' && (
              <span> • Status: {statusFilter}</span>
            )}
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
          {(statusFilter !== 'all' || selectedDoctorId !== 'all' || selectedTherapistId !== 'all' || selectedFacilityId !== 'all') && (
            <button
              onClick={() => {
                setStatusFilter('all');
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
            <p>No VOs found for this selection</p>
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
                  aria-sort={sortColumn === 'patientName' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                >
                  Patient Name <SortIndicator column="patientName" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('doctor')}
                  aria-sort={sortColumn === 'doctor' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                >
                  Doctor <SortIndicator column="doctor" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('status')}
                  aria-sort={sortColumn === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                >
                  F.VO Status <SortIndicator column="status" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('statusDate')}
                  aria-sort={sortColumn === 'statusDate' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                >
                  Status Date <SortIndicator column="statusDate" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('therapyType')}
                  aria-sort={sortColumn === 'therapyType' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                >
                  Heilmittel <SortIndicator column="therapyType" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('anzahl')}
                  aria-sort={sortColumn === 'anzahl' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                >
                  Anzahl <SortIndicator column="anzahl" />
                </th>
                <th className="p-2 text-left font-medium" role="columnheader">
                  Geb. Datum
                </th>
                <th className="p-2 text-left font-medium" role="columnheader">
                  Therapist
                </th>
                <th className="p-2 text-left font-medium" role="columnheader">
                  Facility
                </th>
                <th className="p-2 text-left font-medium w-64" role="columnheader">
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
                  <td className="p-2">
                    <select
                      value={vo.status}
                      onChange={(e) => handleStatusChange(vo.id, e.target.value as FVOCRMVOStatus)}
                      className={`px-2 py-1 rounded border text-xs font-medium ${getStatusColor(vo.status)}`}
                      disabled={!onStatusChange}
                    >
                      {allStatuses.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 text-muted-foreground">{vo.statusDate}</td>
                  <td className="p-2 font-mono text-xs">{vo.therapyType}</td>
                  <td className="p-2 text-center">{vo.anzahl}</td>
                  {/* Geb. Datum */}
                  <td className="p-2 text-sm text-muted-foreground">{vo.gebDatum}</td>
                  {/* Therapist */}
                  <td className="p-2 text-sm">
                    {therapists.find(t => t.id === vo.therapistId)?.name || '-'}
                  </td>
                  {/* Facility */}
                  <td className="p-2 text-sm">{vo.facilityName}</td>
                  {/* Notes */}
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
    </div>
  );
};

export default VOsTable;
