import React from 'react';
import { OpeningHours, OpeningHoursDay } from '@/types';

interface OpeningHoursEditorProps {
  openingHours: OpeningHours;
  onChange: (openingHours: OpeningHours) => void;
}

const OpeningHoursEditor: React.FC<OpeningHoursEditorProps> = ({ openingHours, onChange }) => {
  const days: Array<keyof OpeningHours> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const handleDayChange = (day: keyof OpeningHours, field: keyof OpeningHoursDay, value: string | boolean) => {
    const updated = {
      ...openingHours,
      [day]: {
        ...openingHours[day],
        [field]: value
      }
    };
    onChange(updated);
  };

  const handleClosedToggle = (day: keyof OpeningHours) => {
    const isClosed = !openingHours[day].isClosed;
    handleDayChange(day, 'isClosed', isClosed);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
        Opening Hours
      </h3>
      {days.map(day => {
        const dayHours = openingHours[day];
        return (
          <div key={day} className="flex items-center gap-3">
            <div className="w-24 text-sm font-medium text-foreground">
              {dayLabels[day]}
            </div>

            {!dayHours.isClosed ? (
              <>
                <input
                  type="time"
                  value={dayHours.open}
                  onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                  className="px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="time"
                  value={dayHours.close}
                  onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                  className="px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </>
            ) : (
              <div className="flex-1 text-sm text-muted-foreground italic">
                Closed
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dayHours.isClosed}
                onChange={() => handleClosedToggle(day)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Closed</span>
            </label>
          </div>
        );
      })}
      <div className="text-xs text-muted-foreground mt-4">
        Times are in 24-hour format. Example: 09:00 for 9 AM, 17:00 for 5 PM
      </div>
    </div>
  );
};

export default OpeningHoursEditor;
