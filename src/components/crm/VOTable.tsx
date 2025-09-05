'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CRMVORecord, FVOStatus } from '@/types';

interface VOTableProps {
  voRecords: CRMVORecord[];
  onStatusChange: (voId: string, newStatus: FVOStatus) => void;
  checkboxesVisible?: boolean;
  selectedVOIds?: Set<string>;
  onCheckboxSelection?: (voIds: Set<string>) => void;
}

interface StatusDropdownProps {
  currentStatus: FVOStatus;
  onStatusChange: (newStatus: FVOStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Restricted status options for table dropdown - only user-settable statuses
  const statusOptions: FVOStatus[] = [
    'Bestelt',
    '1st Follow up',
    'Anrufen'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusSelect = (status: FVOStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const getStatusColor = (status: FVOStatus) => {
    switch (status) {
      case 'Bestellen':
        return 'status-badge status-bestellen';
      case 'Bestelt':
        return 'status-badge status-bestelt';
      case '>7 days Bestelt':
        return 'status-badge status-overdue';
      case '1st Follow up':
        return 'status-badge status-followup';
      case '> 7 days after 1st follow up':
        return 'status-badge status-followup-overdue';
      case 'Anrufen':
        return 'status-badge status-anrufen';
      case 'Erhalten':
        return 'status-badge status-received';
      case 'Keine Folge-VO':
        return 'status-badge status-none';
      default:
        return 'status-badge status-default';
    }
  };

  return (
    <div className="status-dropdown-container" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${getStatusColor(currentStatus)}`}
      >
        {currentStatus}
      </button>
      
      {isOpen && (
        <div className="status-dropdown-menu">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              className={`status-dropdown-option ${
                status === currentStatus ? 'status-dropdown-selected' : ''
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const VOTable: React.FC<VOTableProps> = ({ 
  voRecords, 
  onStatusChange, 
  checkboxesVisible = false,
  selectedVOIds = new Set(),
  onCheckboxSelection
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(selectedVOIds);

  // Sync local state with props
  useEffect(() => {
    setSelectedRows(selectedVOIds);
  }, [selectedVOIds]);

  const handleRowSelect = (voId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(voId)) {
      newSelected.delete(voId);
    } else {
      newSelected.add(voId);
    }
    setSelectedRows(newSelected);
    onCheckboxSelection?.(newSelected);
  };

  const handleSelectAll = () => {
    let newSelected: Set<string>;
    if (selectedRows.size === voRecords.length) {
      newSelected = new Set();
    } else {
      newSelected = new Set(voRecords.map(vo => vo.id));
    }
    setSelectedRows(newSelected);
    onCheckboxSelection?.(newSelected);
  };

  const formatDate = (dateStr: string) => {
    // Handle both ISO format and DD.MM.YYYY format
    if (dateStr.includes('-')) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('de-DE');
    }
    return dateStr;
  };

  // Helper function to determine which dates should be displayed based on F.VO status
  const getVisibleDates = (fvoStatus: string) => {
    switch (fvoStatus) {
      case 'Bestellen':
        return { showBestellen: true, showBestelt: false, showFirst: false, showSecond: false };
      case 'Bestelt':
      case '>7 days Bestelt':
        return { showBestellen: true, showBestelt: true, showFirst: false, showSecond: false };
      case '1st Follow up':
      case '> 7 days after 1st follow up':
        return { showBestellen: true, showBestelt: true, showFirst: true, showSecond: false };
      case 'Anrufen':
        return { showBestellen: true, showBestelt: true, showFirst: true, showSecond: true };
      case 'Erhalten':
        return { showBestellen: true, showBestelt: true, showFirst: true, showSecond: true };
      case 'Keine Folge-VO':
        return { showBestellen: true, showBestelt: true, showFirst: false, showSecond: false };
      default:
        return { showBestellen: false, showBestelt: false, showFirst: false, showSecond: false };
    }
  };

  return (
    <div className="vo-table-container">
      <div className="vo-table-scroll">
        <table className="vo-table">
          <thead>
            <tr>
              {checkboxesVisible && (
                <th className="vo-table-header">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === voRecords.length && voRecords.length > 0}
                    onChange={handleSelectAll}
                    className="vo-checkbox"
                  />
                </th>
              )}
              <th className="vo-table-header">Name</th>
              <th className="vo-table-header">Geburtsdatum</th>
              <th className="vo-table-header">Heilmittel</th>
              <th className="vo-table-header">ER</th>
              <th className="vo-table-header">Therapeut</th>
              <th className="vo-table-header">VO Nr.</th>
              <th className="vo-table-header">Ausst. Datum</th>
              <th className="vo-table-header">VO Status</th>
              <th className="vo-table-header">Arzt</th>
              <th className="vo-table-header">F-VO Status</th>
              <th className="vo-table-header">Bestellen Date</th>
              <th className="vo-table-header">Bestelt Date</th>
              <th className="vo-table-header">1st FUP Date</th>
              <th className="vo-table-header">Anrufen Date</th>
              <th className="vo-table-header">VO Status</th>
            </tr>
          </thead>
          <tbody>
            {voRecords.map((vo, index) => (
              <tr key={vo.id} className={`vo-table-row ${index % 2 === 0 ? 'vo-table-row-even' : 'vo-table-row-odd'}`}>
                {checkboxesVisible && (
                  <td className="vo-table-cell">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(vo.id)}
                      onChange={() => handleRowSelect(vo.id)}
                      className="vo-checkbox"
                    />
                  </td>
                )}
                <td className="vo-table-cell">
                  {vo.patientName}
                </td>
                <td className="vo-table-cell">
                  {formatDate(vo.patientInfo.dateOfBirth)}
                </td>
                <td className="vo-table-cell">
                  {vo.heilmittelCode}
                </td>
                <td className="vo-table-cell">
                  {vo.facility}
                </td>
                <td className="vo-table-cell">
                  {vo.therapist}
                </td>
                <td className="vo-table-cell">
                  [{vo.voNumber}]
                </td>
                <td className="vo-table-cell">
                  {vo.issueDate}
                </td>
                <td className="vo-table-cell">
                  {vo.treatmentStatus}
                </td>
                <td className="vo-table-cell">
                  {vo.doctorInfo.name.replace('Dr. ', '')}
                </td>
                <td className="vo-table-cell">
                  <StatusDropdown 
                    currentStatus={vo.fvoStatus}
                    onStatusChange={(newStatus) => onStatusChange(vo.id, newStatus)}
                  />
                </td>
                <td className="vo-table-cell">
                  {(() => {
                    const visibleDates = getVisibleDates(vo.fvoStatus);
                    return visibleDates.showBestellen ? (vo.bestellenDate || '-') : '-';
                  })()}
                </td>
                <td className="vo-table-cell">
                  {(() => {
                    const visibleDates = getVisibleDates(vo.fvoStatus);
                    return visibleDates.showBestelt ? (vo.besteltDate || '-') : '-';
                  })()}
                </td>
                <td className="vo-table-cell">
                  {(() => {
                    const visibleDates = getVisibleDates(vo.fvoStatus);
                    return visibleDates.showFirst ? (vo.firstFollowUpDate || '-') : '-';
                  })()}
                </td>
                <td className="vo-table-cell">
                  {(() => {
                    const visibleDates = getVisibleDates(vo.fvoStatus);
                    return visibleDates.showSecond ? (vo.secondFollowUpDate || '-') : '-';
                  })()}
                </td>
                <td className="vo-table-cell">
                  {vo.voStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VOTable;
