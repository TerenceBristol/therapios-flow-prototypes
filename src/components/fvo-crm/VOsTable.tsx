import React, { useState, useMemo } from 'react';
import { PracticeVO, PracticeDoctor, FVOCRMVOStatus } from '@/types';

interface VOsTableProps {
  vos: PracticeVO[];
  doctors: PracticeDoctor[];
  onStatusChange?: (voId: string, newStatus: FVOCRMVOStatus) => void;
  onGeneratePDF?: (selectedVOIds: string[], selectedDoctorId: string) => void;
}

const VOsTable: React.FC<VOsTableProps> = ({
  vos,
  doctors,
  onStatusChange,
  onGeneratePDF
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedVOIds, setSelectedVOIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>('statusDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter out VOs with "Received" status
  const displayVOs = useMemo(() => {
    return vos.filter(vo => vo.status !== 'Received');
  }, [vos]);

  // Filter VOs by selected doctor
  const filteredVOs = useMemo(() => {
    if (selectedDoctorId === 'all') {
      return displayVOs;
    }
    return displayVOs.filter(vo => vo.doctorId === selectedDoctorId);
  }, [displayVOs, selectedDoctorId]);

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
    if (onGeneratePDF && selectedVOIds.size > 0 && selectedDoctorId !== 'all') {
      onGeneratePDF(Array.from(selectedVOIds), selectedDoctorId);
    }
  };

  // Get doctor name by ID
  const getDoctorName = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId)?.name || 'Unknown Doctor';
  };

  // Status color mapping
  const getStatusColor = (status: FVOCRMVOStatus) => {
    switch (status) {
      case 'Bestellen':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Sort indicator
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const allStatuses: FVOCRMVOStatus[] = ['Bestellen', 'Bestellt', 'Nachverfolgen', 'Nachverfolgt', 'Telefonieren', 'Telefoniert'];

  return (
    <div className="flex flex-col h-full">
      {/* Header with Doctor Filter */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <label htmlFor="doctor-filter" className="text-sm font-medium whitespace-nowrap">
              Doctor Filter:
            </label>
            <select
              id="doctor-filter"
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedVOIds(new Set()); // Clear selections when changing filter
              }}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm flex-1 max-w-xs"
            >
              <option value="all">All Doctors</option>
              {doctorsWithVOs.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
            {selectedDoctorId === 'all' && (
              <p className="text-sm text-muted-foreground italic">
                Select a doctor to generate Follow Up order forms
              </p>
            )}
          </div>

          {/* Generate FUP Form Button */}
          {selectedDoctorId !== 'all' && selectedVOIds.size > 0 && (
            <button
              onClick={handleGeneratePDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm whitespace-nowrap"
            >
              Generate FUP Form ({selectedVOIds.size} selected)
            </button>
          )}
        </div>

        {/* VO Count */}
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {sortedVOs.length} {sortedVOs.length === 1 ? 'VO' : 'VOs'}
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
                    disabled={selectedDoctorId === 'all'}
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
                  onClick={() => handleSort('status')}
                >
                  F.VO Status <SortIndicator column="status" />
                </th>
                <th
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('statusDate')}
                >
                  Status Date <SortIndicator column="statusDate" />
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
                      disabled={selectedDoctorId === 'all'}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VOsTable;
