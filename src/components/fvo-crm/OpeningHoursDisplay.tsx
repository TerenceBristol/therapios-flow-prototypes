import React from 'react';
import { OpeningHours } from '@/types';
import { formatWeekHours } from '@/utils/openingHoursUtils';

interface OpeningHoursDisplayProps {
  openingHours: OpeningHours;
  prominent?: boolean;
}

const OpeningHoursDisplay: React.FC<OpeningHoursDisplayProps> = ({
  openingHours,
  prominent = false
}) => {
  const weekHours = formatWeekHours(openingHours);

  return (
    <div className={`space-y-2 ${prominent ? 'p-4 bg-muted/30 rounded-lg border border-border' : ''}`}>
      {prominent && (
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
          ⏰ Opening Hours
        </h3>
      )}
      <div className="space-y-1.5">
        {weekHours.map(({ day, hours, isToday }) => (
          <div
            key={day}
            className={`flex items-center justify-between text-sm ${
              isToday
                ? 'font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md'
                : 'text-foreground'
            }`}
          >
            <span className={isToday ? '' : 'text-muted-foreground'}>{day}:</span>
            <span>{hours}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpeningHoursDisplay;
