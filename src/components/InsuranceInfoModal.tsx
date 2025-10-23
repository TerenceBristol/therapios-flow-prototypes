'use client';

import React, { useState } from 'react';
import './crm/CRM.css';

// Company constants
const COMPANY_INFO = {
  name: 'TherapieNebenan GmbH',
  address: 'Oderste. 55 14513 Teltow',
  leNumber: 'LE: 23 12 1 79 0'
};

interface InsuranceInfoModalProps {
  voRecord: {
    name: string;
    voNr: string;
    heilmittel: string;
    therapeut: string;
    ausstDatum: string;
    behStatus: string;
    icdCode?: string;
    ikNumber?: string;
    amountPerTreatment?: string;
  };
  numberOfTreatments: number;
  totalVoValue: string;
  onClose: () => void;
  isFromValidation?: boolean; // true if opened from validation page, false if from dashboard
}

// Helper function to map heilmittel code to therapy type
const getTherapyType = (heilmittel: string): string => {
  const code = heilmittel.toUpperCase();
  
  // Physiotherapy codes
  if (code.startsWith('KG') || code.startsWith('MLD') || code.startsWith('PFB')) {
    return 'Physiotherapy';
  }
  
  // Ergotherapy codes
  if (code.startsWith('BO') || code.startsWith('NOB')) {
    return 'Ergotherapy';
  }
  
  // Logopadie codes
  if (code.startsWith('L')) {
    return 'Logopadie';
  }
  
  // Default fallback
  return 'Physiotherapy';
};

const InsuranceInfoModal: React.FC<InsuranceInfoModalProps> = ({
  voRecord,
  numberOfTreatments,
  totalVoValue,
  onClose,
  isFromValidation = false
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Handle copy individual field
  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle copy all info
  const handleCopyAll = async () => {
    const therapyType = getTherapyType(voRecord.heilmittel);
    
    const allInfo = `${COMPANY_INFO.name}
${therapyType}
${COMPANY_INFO.address}
${COMPANY_INFO.leNumber}

${voRecord.name}
${voRecord.voNr}
${voRecord.ausstDatum}

${voRecord.heilmittel}
${voRecord.icdCode || 'N/A'}
${voRecord.therapeut}
${voRecord.behStatus}

${voRecord.ikNumber || 'N/A'}
€ ${voRecord.amountPerTreatment || '0.00'}
${numberOfTreatments}
€ ${totalVoValue}`;

    try {
      await navigator.clipboard.writeText(allInfo);
      setCopiedField('all');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy all:', err);
    }
  };

  const therapyType = getTherapyType(voRecord.heilmittel);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content insurance-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Insurance Form Information</h3>
          <button
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {/* Company Information Section */}
          <div className="insurance-section">
            <h4 className="insurance-section-title">Company Information</h4>
            <div className="insurance-info-grid">
              <div className="insurance-field">
                <label className="insurance-label">Company Name</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{COMPANY_INFO.name}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(COMPANY_INFO.name, 'companyName')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'companyName' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">Therapy Type</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{therapyType}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(therapyType, 'therapyType')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'therapyType' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">Company Address</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{COMPANY_INFO.address}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(COMPANY_INFO.address, 'companyAddress')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'companyAddress' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">LE Number</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{COMPANY_INFO.leNumber}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(COMPANY_INFO.leNumber, 'leNumber')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'leNumber' ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Patient & VO Information Section */}
          <div className="insurance-section">
            <h4 className="insurance-section-title">Patient & VO Information</h4>
            <div className="insurance-info-grid">
              <div className="insurance-field">
                <label className="insurance-label">Patient Name</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{voRecord.name}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(voRecord.name, 'patientName')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'patientName' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">VO Number</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{voRecord.voNr}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(voRecord.voNr, 'voNumber')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'voNumber' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">Issue Date</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{voRecord.ausstDatum}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(voRecord.ausstDatum, 'issueDate')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'issueDate' ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Information Section */}
          <div className="insurance-section">
            <h4 className="insurance-section-title">Treatment Information</h4>
            <div className="insurance-info-grid">
              <div className="insurance-field">
                <label className="insurance-label">Heilmittel</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{voRecord.heilmittel}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(voRecord.heilmittel, 'heilmittel')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'heilmittel' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">ICD Code</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{voRecord.icdCode || 'N/A'}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(voRecord.icdCode || 'N/A', 'icdCode')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'icdCode' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">Therapeut</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{voRecord.therapeut}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(voRecord.therapeut, 'therapeut')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'therapeut' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">Treatment Count</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{voRecord.behStatus}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(voRecord.behStatus, 'treatmentCount')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'treatmentCount' ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Information Section */}
          <div className="insurance-section">
            <h4 className="insurance-section-title">Billing Information</h4>
            <div className="insurance-info-grid">
              <div className="insurance-field">
                <label className="insurance-label">IK Number</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{voRecord.ikNumber || 'N/A'}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(voRecord.ikNumber || 'N/A', 'ikNumber')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'ikNumber' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">Amount per Treatment</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">€ {voRecord.amountPerTreatment || '0.00'}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(`€ ${voRecord.amountPerTreatment || '0.00'}`, 'amountPerTreatment')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'amountPerTreatment' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">Number of Treatments</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">{numberOfTreatments}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(numberOfTreatments.toString(), 'numberOfTreatments')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'numberOfTreatments' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="insurance-field">
                <label className="insurance-label">Total VO Value</label>
                <div className="insurance-value-container">
                  <span className="insurance-value">€ {totalVoValue}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(`€ ${totalVoValue}`, 'totalVoValue')}
                    title="Copy"
                    type="button"
                  >
                    {copiedField === 'totalVoValue' ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button
            className="action-btn secondary"
            onClick={handleCopyAll}
            type="button"
          >
            {copiedField === 'all' ? '✓ Copied!' : 'Copy All Info'}
          </button>
          <button
            className="action-btn primary"
            onClick={onClose}
            type="button"
          >
            {isFromValidation ? 'Return to Dashboard' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceInfoModal;

