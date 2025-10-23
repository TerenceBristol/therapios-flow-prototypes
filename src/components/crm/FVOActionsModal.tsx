'use client';

import React from 'react';
import { CRMVORecord } from '@/types';

interface FVOActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVOs: CRMVORecord[];
  doctorName: string;
  currentWorkflowTab: 'Bestellen' | 'Bestelt' | 'Follow Up' | 'Call';
  onGenerateOrderForm: (type: 'initial' | 'followup') => void;
  onChangeStatus: (status: string) => void;
  onCopyInformation: () => void;
}

const FVOActionsModal: React.FC<FVOActionsModalProps> = ({
  isOpen,
  onClose,
  selectedVOs,
  doctorName,
  currentWorkflowTab,
  onGenerateOrderForm,
  onChangeStatus,
  onCopyInformation
}) => {
  if (!isOpen) return null;

  const extractAnzahl = (treatmentStatus: string): string => {
    const parts = treatmentStatus.split('/');
    return parts.length > 1 ? parts[1] : treatmentStatus;
  };

  // Dynamic button logic based on workflow tab
  const getOrderFormButtonInfo = () => {
    if (currentWorkflowTab === 'Bestellen') {
      return {
        buttonText: 'Generate Initial Order Form',
        formType: 'initial' as const
      };
    } else {
      return {
        buttonText: 'Generate FUP Order Form',
        formType: 'followup' as const
      };
    }
  };

  const orderFormButton = getOrderFormButtonInfo();

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
        // If in Follow Up workflow tab, show "Anrufen" button instead of "Second Follow Up"
        if (currentWorkflowTab === 'Follow Up') {
          return { label: 'Save VOs as Anrufen', nextStatus: 'Anrufen' };
        } else {
          return { label: 'Save VOs as Second Follow Up', nextStatus: 'Anrufen' };
        }
      case 'Anrufen':
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
            <button 
              className="action-btn primary"
              onClick={() => onGenerateOrderForm(orderFormButton.formType)}
            >
              {orderFormButton.buttonText}
            </button>
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




export default FVOActionsModal;
