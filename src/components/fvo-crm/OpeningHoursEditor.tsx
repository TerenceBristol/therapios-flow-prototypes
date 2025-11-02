import React from 'react';
import { OpeningHours, OpeningHoursDay, OpeningHoursPeriod } from '@/types';

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

  const handleDayChange = (day: keyof OpeningHours, field: keyof OpeningHoursDay, value: boolean | OpeningHoursPeriod[] | string) => {
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

    // If closing, clear periods
    if (isClosed) {
      handleDayChange(day, 'periods', []);
    }
  };

  const handleAddPeriod = (day: keyof OpeningHours) => {
    const currentPeriods = openingHours[day].periods || [];
    const newPeriods = [
      ...currentPeriods,
      { open: '09:00', close: '17:00' }
    ];
    handleDayChange(day, 'periods', newPeriods);
  };

  const handleRemovePeriod = (day: keyof OpeningHours, periodIndex: number) => {
    const currentPeriods = openingHours[day].periods || [];
    const newPeriods = currentPeriods.filter((_, index) => index !== periodIndex);
    handleDayChange(day, 'periods', newPeriods);
  };

  const handlePeriodChange = (
    day: keyof OpeningHours,
    periodIndex: number,
    field: keyof OpeningHoursPeriod,
    value: string
  ) => {
    const currentPeriods = [...openingHours[day].periods];
    currentPeriods[periodIndex] = {
      ...currentPeriods[periodIndex],
      [field]: value
    };
    handleDayChange(day, 'periods', currentPeriods);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
        Opening Hours
      </h3>

      {/* Table Layout */}
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left py-2 px-3 font-medium text-foreground">Day</th>
              <th className="text-left py-2 px-3 font-medium text-foreground bg-green-50">🕐 Hours</th>
              <th className="text-left py-2 px-3 font-medium text-foreground bg-amber-50">☕ Break</th>
              <th className="text-left py-2 px-3 font-medium text-foreground w-1/4">Notes</th>
              <th className="text-center py-2 px-3 font-medium text-foreground w-20">Closed</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => {
              const dayHours = openingHours[day];
              const periods = dayHours.periods || [];
              const mainPeriod = periods[0];
              const breakPeriod = periods[1];

              return (
                <tr
                  key={day}
                  className={`border-b border-border last:border-b-0 ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                >
                  {/* Day Column */}
                  <td className="py-2 px-3 font-medium text-foreground align-top">
                    {dayLabels[day]}
                  </td>

                  {/* Main Hours Column */}
                  <td className="py-2 px-3 align-top bg-green-50/30">
                    {!dayHours.isClosed && (
                      <div className="flex items-center gap-2">
                        {mainPeriod ? (
                          <>
                            <input
                              type="time"
                              value={mainPeriod.open}
                              onChange={(e) => handlePeriodChange(day, 0, 'open', e.target.value)}
                              className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-24"
                            />
                            <span className="text-xs text-muted-foreground">-</span>
                            <input
                              type="time"
                              value={mainPeriod.close}
                              onChange={(e) => handlePeriodChange(day, 0, 'close', e.target.value)}
                              className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-24"
                            />
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddPeriod(day)}
                            className="text-xs text-primary hover:underline"
                          >
                            + Set hours
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Break Hours Column */}
                  <td className="py-2 px-3 align-top bg-amber-50/30">
                    {!dayHours.isClosed && mainPeriod && (
                      <div className="flex items-center gap-2">
                        {breakPeriod ? (
                          <>
                            <input
                              type="time"
                              value={breakPeriod.open}
                              onChange={(e) => handlePeriodChange(day, 1, 'open', e.target.value)}
                              className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-24"
                            />
                            <span className="text-xs text-muted-foreground">-</span>
                            <input
                              type="time"
                              value={breakPeriod.close}
                              onChange={(e) => handlePeriodChange(day, 1, 'close', e.target.value)}
                              className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-24"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePeriod(day, 1)}
                              className="text-red-600 hover:text-red-700 text-xs"
                              title="Remove break"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddPeriod(day)}
                            className="text-xs text-primary hover:underline"
                          >
                            + Add break
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Notes Column */}
                  <td className="py-2 px-3 align-top">
                    {!dayHours.isClosed && (
                      <input
                        type="text"
                        value={dayHours.notes || ''}
                        onChange={(e) => handleDayChange(day, 'notes', e.target.value)}
                        placeholder="Optional notes..."
                        className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    )}
                  </td>

                  {/* Closed Checkbox Column */}
                  <td className="py-2 px-3 text-center align-top">
                    <input
                      type="checkbox"
                      checked={dayHours.isClosed}
                      onChange={() => handleClosedToggle(day)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Times are in 24-hour format (09:00 = 9 AM, 17:00 = 5 PM). The break time represents when the practice is closed (e.g., lunch break).
      </div>
    </div>
  );
};

export default OpeningHoursEditor;
