'use client';

import React from 'react';
import './crm/CRM.css';

interface VOInformationProps {
  patientName: string;
  heilmittel: string;
  behStatus: string;
  zzBefreiung: string;
  icdCode: string;
  therapeut: string;
  voStatus: string;
  voNr: string;
  einrichtung: string;
}

const VOInformationSection: React.FC<VOInformationProps> = ({
  patientName,
  heilmittel,
  behStatus,
  zzBefreiung,
  icdCode,
  therapeut,
  voStatus,
  voNr,
  einrichtung
}) => {

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Aktiv':
        return 'status-badge status-aktiv';
      case 'Abgebrochen':
        return 'status-badge status-abgebrochen';
      case 'Fertig Behandelt':
        return 'status-badge status-fertig-behandelt';
      case 'Abgerechnet':
        return 'status-badge status-abgerechnet';
      case 'Abgelaufen':
        return 'status-badge status-abgelaufen';
      default:
        return 'status-badge status-default';
    }
  };

  return (
    <div className="vo-info-section">
      <h2 className="section-title">VO Information</h2>
      <div className="vo-info-card">
        <div className="vo-info-grid">
          <div className="vo-info-item">
            <label className="vo-info-label">Patient Name</label>
            <div className="vo-info-value">{patientName}</div>
          </div>
          
          <div className="vo-info-item">
            <label className="vo-info-label">Heilmittel</label>
            <div className="vo-info-value">{heilmittel}</div>
          </div>
          
          <div className="vo-info-item">
            <label className="vo-info-label">Beh Status</label>
            <div className="vo-info-value">{behStatus}</div>
          </div>
          
          
          <div className="vo-info-item">
            <label className="vo-info-label">Zz-befreiung</label>
            <div className="vo-info-value">{zzBefreiung}</div>
          </div>
          
          <div className="vo-info-item">
            <label className="vo-info-label">ICD Code</label>
            <div className="vo-info-value">{icdCode}</div>
          </div>
          
          <div className="vo-info-item">
            <label className="vo-info-label">Therapeut</label>
            <div className="vo-info-value">{therapeut}</div>
          </div>
          
          <div className="vo-info-item">
            <label className="vo-info-label">VO Status</label>
            <div className="vo-info-value">
              <span className={getStatusBadgeClass(voStatus)}>
                {voStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VOInformationSection;
