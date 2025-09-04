'use client';

import React from 'react';
import { CRMVORecord } from '@/types';

interface FVOActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVOs: CRMVORecord[];
  doctorName: string;
  onGenerateOrderForm: (type: 'initial' | 'followup') => void;
  onChangeStatus: (status: string) => void;
  onCopyInformation: () => void;
}

const FVOActionsModal: React.FC<FVOActionsModalProps> = ({
  isOpen,
  onClose,
  selectedVOs,
  doctorName,
  onGenerateOrderForm,
  onChangeStatus,
  onCopyInformation
}) => {
  if (!isOpen) return null;

  const extractAnzahl = (treatmentStatus: string): string => {
    const parts = treatmentStatus.split('/');
    return parts.length > 1 ? parts[1] : treatmentStatus;
  };

  // Helper function to get the next status button info
  const getNextStatusButton = () => {
    if (selectedVOs.length === 0) return null;
    
    const currentStatus = selectedVOs[0].fvoStatus; // All VOs have same status due to filtering
    
    switch (currentStatus) {
      case 'Bestellen':
        return { label: 'Save VOs as Bestelt', nextStatus: 'Bestelt' };
      case 'Bestelt':
      case '>7 days Bestelt':
        return { label: 'Save VOs as First Follow Up', nextStatus: '1st Follow up' };
      case '1st Follow up':
      case '> 7 days after 1st follow up':
        return { label: 'Save VOs as Second Follow Up', nextStatus: '2nd Follow up' };
      case '2nd Follow up':
      case '>7 days 2nd follow up':
        return null; // Button should not appear for final status
      default:
        return null;
    }
  };

  const nextStatusButton = getNextStatusButton();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">F.VO Actions</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Doctor Selection Display */}
        <div className="modal-doctor-section">
          <div className="doctor-badge">
            <span className="doctor-check-icon">✓</span>
            <span className="doctor-name">Ausgewählter Arzt: {doctorName}</span>
          </div>
        </div>

        {/* Patient Information Table */}
        <div className="modal-content">
          <div className="modal-table-section">
            <table className="modal-table">
              <thead>
                <tr>
                  <th>PATIENT NAME</th>
                  <th>GEBURTSDATUM</th>
                  <th>HEILMITTEL &amp; ANZAHL</th>
                </tr>
              </thead>
              <tbody>
                {selectedVOs.map((vo) => (
                  <tr key={vo.id}>
                    <td>{vo.patientName}</td>
                    <td>{vo.patientInfo.dateOfBirth}</td>
                    <td>
                      <span className="treatment-type">{vo.heilmittelCode}</span>
                      <span className="treatment-count">{extractAnzahl(vo.treatmentStatus)}x</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <GenerateOrderDropdown onSelect={onGenerateOrderForm} />
            {nextStatusButton && (
              <button 
                className="action-btn primary" 
                onClick={() => onChangeStatus(nextStatusButton.nextStatus)}
              >
                {nextStatusButton.label}
              </button>
            )}
            <button className="action-btn secondary" onClick={onCopyInformation}>
              Informationen kopieren
            </button>
            <button className="action-btn secondary" onClick={onClose}>
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate Order Form Dropdown Component
const GenerateOrderDropdown: React.FC<{ onSelect: (type: 'initial' | 'followup') => void }> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 120; // Approximate height of dropdown with 2 options
      
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let top: number;
      if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
        // Position below button
        top = rect.bottom + 4;
      } else {
        // Position above button
        top = rect.top - dropdownHeight - 4;
      }
      
      setDropdownStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 1100
      });
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (type: 'initial' | 'followup') => {
    onSelect(type);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container">
      <button 
        ref={buttonRef}
        className="action-btn primary dropdown-btn"
        onClick={handleToggle}
      >
        Generate Order Form ▼
      </button>
      
      {isOpen && (
        <div ref={dropdownRef} className="action-dropdown-menu" style={dropdownStyle}>
          <button 
            className="action-dropdown-option"
            onClick={() => handleSelect('initial')}
          >
            Initial Order Form
          </button>
          <button 
            className="action-dropdown-option"
            onClick={() => handleSelect('followup')}
          >
            Follow-up Order Form
          </button>
        </div>
      )}
    </div>
  );
};



export default FVOActionsModal;
