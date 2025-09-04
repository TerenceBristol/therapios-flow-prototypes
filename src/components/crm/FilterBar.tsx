'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FVOStatus } from '@/types';

interface FilterBarProps {
  selectedFVOStatus: string;
  selectedDoctor: string;
  doctorOptions: string[];
  onFVOStatusChange: (status: string) => void;
  onDoctorChange: (doctor: string) => void;
  showHelperText: boolean;
  showFVOActionsButton: boolean;
  fvoActionsEnabled: boolean;
  onFVOActionsClick: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedFVOStatus,
  selectedDoctor,
  doctorOptions,
  onFVOStatusChange,
  onDoctorChange,
  showHelperText,
  showFVOActionsButton,
  fvoActionsEnabled,
  onFVOActionsClick
}) => {
  const [isFVODropdownOpen, setIsFVODropdownOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [fvoSearchTerm, setFvoSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  
  const fvoDropdownRef = useRef<HTMLDivElement>(null);
  const doctorDropdownRef = useRef<HTMLDivElement>(null);

  const fvoStatusOptions = [
    'All F.VO Status',
    'Bestellen',
    'Bestelt',
    '>7 days Bestelt',
    '1st Follow up',
    '> 7 days after 1st follow up',
    '2nd Follow up',
    '>7 days 2nd follow up',
    'Erhalten',
    'Keine Folge-VO'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fvoDropdownRef.current && !fvoDropdownRef.current.contains(event.target as Node)) {
        setIsFVODropdownOpen(false);
      }
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target as Node)) {
        setIsDoctorDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFVOStatusSelect = (status: string) => {
    onFVOStatusChange(status);
    setIsFVODropdownOpen(false);
    setFvoSearchTerm('');
  };

  const handleDoctorSelect = (doctor: string) => {
    onDoctorChange(doctor);
    setIsDoctorDropdownOpen(false);
    setDoctorSearchTerm('');
  };

  const filteredFVOStatuses = fvoStatusOptions.filter(status =>
    status.toLowerCase().includes(fvoSearchTerm.toLowerCase())
  );

  const filteredDoctors = doctorOptions.filter(doctor =>
    doctor.toLowerCase().includes(doctorSearchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="filter-bar-with-actions">
        <div className="new-filter-bar">
          {/* Spalten anzeigen - Static Filter */}
          <div className="filter-group">
            <div className="dropdown-container">
              <button
                className="dropdown-button dropdown-button-disabled"
                disabled
                type="button"
              >
                <span className="dropdown-text">Spalten anzeigen</span>
              </button>
            </div>
          </div>

          {/* F.VO Status Dropdown */}
          <div className="filter-group" ref={fvoDropdownRef}>
            <div className="dropdown-container">
              <button
                className="dropdown-button"
                onClick={() => setIsFVODropdownOpen(!isFVODropdownOpen)}
                type="button"
              >
                <span className="dropdown-text">{selectedFVOStatus}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {isFVODropdownOpen && (
                <div className="dropdown-menu">
                  <input
                    type="text"
                    className="dropdown-search"
                    placeholder="Search F.VO status..."
                    value={fvoSearchTerm}
                    onChange={(e) => setFvoSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <div className="dropdown-options">
                    {filteredFVOStatuses.map((status) => (
                      <button
                        key={status}
                        className={`dropdown-option ${status === selectedFVOStatus ? 'selected' : ''}`}
                        onClick={() => handleFVOStatusSelect(status)}
                        type="button"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Arzt (Auswählen) - Interactive Dropdown */}
          <div className="filter-group" ref={doctorDropdownRef}>
            <div className="dropdown-container">
              <button
                className="dropdown-button"
                onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                type="button"
              >
                <span className="dropdown-text">
                  {selectedDoctor === 'All Doctors' ? 'Arzt (Auswählen)' : selectedDoctor}
                </span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {isDoctorDropdownOpen && (
                <div className="dropdown-menu">
                  <input
                    type="text"
                    className="dropdown-search"
                    placeholder="Search doctors..."
                    value={doctorSearchTerm}
                    onChange={(e) => setDoctorSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <div className="dropdown-options">
                    {filteredDoctors.map((doctor) => (
                      <button
                        key={doctor}
                        className={`dropdown-option ${doctor === selectedDoctor ? 'selected' : ''}`}
                        onClick={() => handleDoctorSelect(doctor)}
                        type="button"
                      >
                        {doctor === 'All Doctors' ? 'Arzt (Auswählen)' : doctor}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* F.VO Actions Button */}
        {showFVOActionsButton && (
          <button
            className="fvo-actions-button"
            onClick={onFVOActionsClick}
            disabled={!fvoActionsEnabled}
            type="button"
          >
            F.VO Actions
          </button>
        )}
      </div>

      {/* Helper Text */}
      {showHelperText && (
        <div className="filter-helper-text">
          Please Select a F.VO Status and Arzt to do F.VO Actions
        </div>
      )}
    </div>
  );
};

export default FilterBar;