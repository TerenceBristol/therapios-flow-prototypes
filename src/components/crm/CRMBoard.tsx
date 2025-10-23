'use client';

import React from 'react';
import { CRMVORecord, CRMColumn } from '@/types';
import CRMColumnComponent from './CRMColumn';

interface CRMBoardProps {
  voRecords: CRMVORecord[];
  onVOClick: (vo: CRMVORecord) => void;
  onVOMove: (voId: string, newColumn: CRMColumn) => void;
}

const CRMBoard: React.FC<CRMBoardProps> = ({ voRecords, onVOClick, onVOMove }) => {
  const columns: { key: CRMColumn; title: string }[] = [
    { key: 'Bestelt', title: 'Bestelt' },
    { key: '>7 days Bestelt', title: '>7 days Bestelt' },
    { key: '1st Follow up', title: '1st Follow up' },
    { key: '> 7 days after 1st follow up', title: '> 7 days after 1st follow up' },
    { key: 'Anrufen', title: 'Anrufen' },
    { key: 'Erhalten', title: 'Erhalten' }
  ];

  const getVOsForColumn = (column: CRMColumn): CRMVORecord[] => {
    return voRecords.filter(vo => vo.currentColumn === column);
  };

  return (
    <div className="crm-board">
      <div className="crm-board-container">
        {columns.map(column => (
          <CRMColumnComponent
            key={column.key}
            title={column.title}
            columnKey={column.key}
            voRecords={getVOsForColumn(column.key)}
            onVOClick={onVOClick}
            onVOMove={onVOMove}
          />
        ))}
      </div>
    </div>
  );
};

export default CRMBoard;
