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

  // Check if display text has multiple periods (contains comma)
  const periods = status.displayText.includes(',') ? status.displayText.split(',').map(p => p.trim()) : null;
  const hasMultiplePeriods = periods && periods.length > 1;
  const displayText = hasMultiplePeriods ? `${periods[0]} +${periods.length - 1}` : status.displayText;
  const fullText = hasMultiplePeriods ? status.displayText : null;

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${getStatusColor()}`} title={fullText || undefined}>
      <span className="text-base">{status.icon}</span>
      <span>{displayText}</span>
    </div>
  );
};

export default TodayHoursCell;
