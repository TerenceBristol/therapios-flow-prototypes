'use client';

import React, { useState } from 'react';
import { CRMVORecord, CRMColumn } from '@/types';
import VOCard from './VOCard';

interface CRMColumnProps {
  title: string;
  columnKey: CRMColumn;
  voRecords: CRMVORecord[];
  onVOClick: (vo: CRMVORecord) => void;
  onVOMove: (voId: string, newColumn: CRMColumn) => void;
}

const CRMColumnComponent: React.FC<CRMColumnProps> = ({
  title,
  columnKey,
  voRecords,
  onVOClick,
  onVOMove
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const voId = e.dataTransfer.getData('text/plain');
    if (voId) {
      onVOMove(voId, columnKey);
    }
  };



  return (
    <div className="crm-column">
      <div className="crm-column-header">
        <h3 className="crm-column-title">{title}</h3>
        <div className="crm-column-stats">
          <span className="crm-column-count">{voRecords.length}</span>
        </div>
      </div>
      
      <div 
        className={`crm-column-content ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {voRecords.length === 0 ? (
          <div className="crm-empty-column">
            <p>No VO orders</p>
          </div>
        ) : (
          voRecords.map(vo => (
            <VOCard
              key={vo.id}
              vo={vo}
              onClick={() => onVOClick(vo)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CRMColumnComponent;
