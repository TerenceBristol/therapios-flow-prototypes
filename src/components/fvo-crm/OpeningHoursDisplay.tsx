import React from 'react';
import { OpeningHours } from '@/types';

interface OpeningHoursDisplayProps {
  openingHours: OpeningHours;
  prominent?: boolean;
}

const OpeningHoursDisplay: React.FC<OpeningHoursDisplayProps> = ({
  openingHours,
  prominent = false
}) => {
  const days: Array<{ key: keyof OpeningHours; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  // Get current day to highlight
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof OpeningHours;

  return (
    <div className={`space-y-2 ${prominent ? 'p-4 bg-muted/30 rounded-lg border border-border' : ''}`}>
      {prominent && (
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
          Opening Hours
        </h3>
      )}
      <div className="space-y-1">
        {days.map(({ key, label }) => {
          const isToday = key === today;
          const hours = openingHours[key] || 'Not set';

          return (
            <div
              key={key}
              className={`flex items-start justify-between text-sm ${
                isToday
                  ? 'font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md'
                  : 'text-foreground'
              }`}
            >
              <span className={isToday ? '' : 'text-muted-foreground'}>
                {label}
              </span>
              <span className="text-right">{hours}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpeningHoursDisplay;
