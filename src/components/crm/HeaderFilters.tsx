'use client';

import React, { useState, useRef, useEffect } from 'react';

interface HeaderFiltersProps {
  selectedFVOStatus: string;
  selectedDoctor: string;
  selectedTherapist: string;
  fvoStatusOptions: string[];
  doctorOptions: string[];
  therapistOptions: string[];
  onFVOStatusChange: (status: string) => void;
  onDoctorChange: (doctor: string) => void;
  onTherapistChange: (therapist: string) => void;
}

const HeaderFilters: React.FC<HeaderFiltersProps> = ({
  selectedFVOStatus,
  selectedDoctor,
  selectedTherapist,
  fvoStatusOptions,
  doctorOptions,
  therapistOptions,
  onFVOStatusChange,
  onDoctorChange,
  onTherapistChange
}) => {
  const [isFVODropdownOpen, setIsFVODropdownOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [isTherapistDropdownOpen, setIsTherapistDropdownOpen] = useState(false);
  const [fvoSearchTerm, setFvoSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [therapistSearchTerm, setTherapistSearchTerm] = useState('');
  
  const fvoDropdownRef = useRef<HTMLDivElement>(null);
  const doctorDropdownRef = useRef<HTMLDivElement>(null);
  const therapistDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fvoDropdownRef.current && !fvoDropdownRef.current.contains(event.target as Node)) {
        setIsFVODropdownOpen(false);
      }
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target as Node)) {
        setIsDoctorDropdownOpen(false);
      }
      if (therapistDropdownRef.current && !therapistDropdownRef.current.contains(event.target as Node)) {
        setIsTherapistDropdownOpen(false);
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

  const handleTherapistSelect = (therapist: string) => {
    onTherapistChange(therapist);
    setIsTherapistDropdownOpen(false);
    setTherapistSearchTerm('');
  };

  const filteredFVOStatuses = fvoStatusOptions.filter(status =>
    status.toLowerCase().includes(fvoSearchTerm.toLowerCase())
  );

  const filteredDoctors = doctorOptions.filter(doctor =>
    doctor.toLowerCase().includes(doctorSearchTerm.toLowerCase())
  );

  const filteredTherapists = therapistOptions.filter(therapist =>
    therapist.toLowerCase().includes(therapistSearchTerm.toLowerCase())
  );

  return (
    <div className="header-filters" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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

      {/* Therapeut (Auswählen) - Interactive Dropdown */}
      <div className="filter-group" ref={therapistDropdownRef}>
        <div className="dropdown-container">
          <button
            className="dropdown-button"
            onClick={() => setIsTherapistDropdownOpen(!isTherapistDropdownOpen)}
            type="button"
          >
            <span className="dropdown-text">
              {selectedTherapist === 'All Therapists' ? 'Therapeut (Auswählen)' : selectedTherapist}
            </span>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {isTherapistDropdownOpen && (
            <div className="dropdown-menu">
              <input
                type="text"
                className="dropdown-search"
                placeholder="Search therapists..."
                value={therapistSearchTerm}
                onChange={(e) => setTherapistSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="dropdown-options">
                {filteredTherapists.map((therapist) => (
                  <button
                    key={therapist}
                    className={`dropdown-option ${therapist === selectedTherapist ? 'selected' : ''}`}
                    onClick={() => handleTherapistSelect(therapist)}
                    type="button"
                  >
                    {therapist === 'All Therapists' ? 'Therapeut (Auswählen)' : therapist}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderFilters;
