import React from 'react';
import { OpeningHours } from '@/types';

interface TodayHoursCellProps {
  openingHours: OpeningHours;
}

const TodayHoursCell: React.FC<TodayHoursCellProps> = ({ openingHours }) => {
  // Get current day of week
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof OpeningHours;
  const todayHours = openingHours[today] || 'Not set';

  return (
    <div className="text-sm text-foreground">
      {todayHours}
    </div>
  );
};

export default TodayHoursCell;
