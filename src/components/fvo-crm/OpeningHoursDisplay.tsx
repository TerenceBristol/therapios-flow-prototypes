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

  // Parse hours to separate main hours from break hours
  const parseHours = (hoursStr: string) => {
    const breakMatch = hoursStr.match(/^(.+)\s+\(Break:\s+(.+)\)$/);
    if (breakMatch) {
      return {
        mainHours: breakMatch[1],
        breakHours: breakMatch[2]
      };
    }
    return {
      mainHours: hoursStr,
      breakHours: null
    };
  };

  return (
    <div className={`space-y-2 ${prominent ? 'p-4 bg-muted/30 rounded-lg border border-border' : ''}`}>
      {prominent && (
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
          ⏰ Opening Hours
        </h3>
      )}
      <div className="space-y-1">
        {weekHours.map((dayHours, index) => {
          const { mainHours, breakHours } = parseHours(dayHours.hours);

          return (
            <div key={index}>
              <div
                className={`flex items-start justify-between text-sm ${
                  dayHours.isToday
                    ? 'font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md'
                    : 'text-foreground'
                }`}
              >
                <span className={`${dayHours.isToday ? '' : 'text-muted-foreground'}`}>
                  {dayHours.day}:
                </span>
                <span className="text-right">{mainHours}</span>
              </div>
              {breakHours && (
                <div className={`flex items-start justify-between text-xs pl-4 mt-0.5 ${
                  dayHours.isToday ? 'bg-primary/10 px-2 py-0.5 rounded-md' : ''
                }`}>
                  <span className="text-muted-foreground">└─ ☕ Break:</span>
                  <span className="text-muted-foreground text-right">{breakHours}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpeningHoursDisplay;
