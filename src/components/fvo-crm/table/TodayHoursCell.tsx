import React from 'react';
import { OpeningHours } from '@/types';
import { getTodayStatus } from '@/utils/openingHoursUtils';

interface TodayHoursCellProps {
  openingHours: OpeningHours;
}

const TodayHoursCell: React.FC<TodayHoursCellProps> = ({ openingHours }) => {
  const status = getTodayStatus(openingHours);

  const getStatusColor = () => {
    switch (status.status) {
      case 'open':
        return 'text-green-600';
      case 'closed':
        return 'text-red-600';
      case 'opens-later':
        return 'text-orange-600';
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${getStatusColor()}`}>
      <span className="text-base">{status.icon}</span>
      <span>{status.displayText}</span>
    </div>
  );
};

export default TodayHoursCell;
