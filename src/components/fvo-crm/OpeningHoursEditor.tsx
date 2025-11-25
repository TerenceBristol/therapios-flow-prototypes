import React from 'react';
import { OpeningHours } from '@/types';

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

  const dayLabels: Record<keyof OpeningHours, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const handleDayChange = (day: keyof OpeningHours, value: string) => {
    onChange({
      ...openingHours,
      [day]: value
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
        Opening Hours
      </h3>

      <div className="space-y-2">
        {days.map((day) => (
          <div key={day} className="flex items-center gap-4">
            <label className="w-24 text-sm font-medium text-foreground">
              {dayLabels[day]}
            </label>
            <input
              type="text"
              value={openingHours[day] || ''}
              onChange={(e) => handleDayChange(day, e.target.value)}
              placeholder="e.g., 8:00 AM - 5:00 PM or Closed"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground mt-3">
        Format: &quot;8:00 AM - 1:00 PM ; 3:00 PM - 6:00 PM&quot; (use ; for breaks), &quot;Closed&quot;, or &quot;Open 24hrs&quot;
      </div>
    </div>
  );
};

export default OpeningHoursEditor;
