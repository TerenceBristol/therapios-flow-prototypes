'use client';

import React from 'react';
import { CRMVORecord } from '@/types';

interface VOCardProps {
  vo: CRMVORecord;
  onClick: () => void;
}

const VOCard: React.FC<VOCardProps> = ({ vo, onClick }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', vo.id);
  };

  const formatDate = (dateString: string): string => {
    try {
      // Handle dd.mm.yyyy format
      if (dateString.includes('.')) {
        const [day, month, year] = dateString.split('.');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('de-DE');
      }
      // Fallback for other formats
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE');
    } catch {
      return dateString;
    }
  };



  return (
    <div 
      className="vo-card"
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      <div className="vo-card-header">
        <span className="vo-number">VO #{vo.voNumber}</span>
      </div>
      
      <div className="vo-card-content">
        <div className="vo-card-field">
          <span className="vo-card-label">Patient:</span>
          <span className="vo-card-value">{vo.patientName}</span>
        </div>
        
        <div className="vo-card-field">
          <span className="vo-card-label">Arzt:</span>
          <span className="vo-card-value">{vo.doctorInfo.name}</span>
        </div>
        
        <div className="vo-card-field">
          <span className="vo-card-label">Bestelt Datum:</span>
          <span className="vo-card-value">{formatDate(vo.besteltDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default VOCard;
