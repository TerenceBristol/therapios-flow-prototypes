'use client';

import React, { useState } from 'react';
import { VacationPeriod, Arzt } from '@/types';

interface VacationManagerProps {
  vacationPeriods: VacationPeriod[];
  onChange: (periods: VacationPeriod[]) => void;
  doctors?: Arzt[]; // Optional: if provided, allows assigning vacation to specific doctor
}

const VacationManager: React.FC<VacationManagerProps> = ({
  vacationPeriods,
  onChange,
  doctors = []
}) => {
  const [expandedPeriodId, setExpandedPeriodId] = useState<string | null>(null);

  const addPeriod = () => {
    const newPeriod: VacationPeriod = {
      id: `vacation-${Date.now()}`,
      startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
      appliesToDoctorId: undefined
    };
    onChange([...vacationPeriods, newPeriod]);
    setExpandedPeriodId(newPeriod.id);
  };

  const removePeriod = (id: string) => {
    onChange(vacationPeriods.filter(p => p.id !== id));
  };

  const updatePeriod = (id: string, field: keyof VacationPeriod, value: string | undefined) => {
    const updatedPeriods = vacationPeriods.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    onChange(updatedPeriods);
  };

  const toggleExpanded = (id: string) => {
    setExpandedPeriodId(expandedPeriodId === id ? null : id);
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (startDate === endDate) {
      return formatDate(start);
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const isCurrentlyOnVacation = (period: VacationPeriod): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(period.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(period.endDate);
    end.setHours(23, 59, 59, 999);

    return today >= start && today <= end;
  };

  const isUpcoming = (period: VacationPeriod): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(period.startDate);
    start.setHours(0, 0, 0, 0);

    return start > today;
  };

  const getDoctorName = (doctorId?: string): string | null => {
    if (!doctorId) return null;
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-foreground">
          Vacation Periods
        </label>
        <button
          type="button"
          onClick={addPeriod}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          + Add Vacation Period
        </button>
      </div>

      {vacationPeriods.length === 0 ? (
        <div className="border border-border rounded-md p-4 text-center text-muted-foreground text-sm">
          No vacation periods added. Click &quot;Add Vacation Period&quot; to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {vacationPeriods
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .map((period) => {
              const isActive = isCurrentlyOnVacation(period);
              const upcoming = isUpcoming(period);
              const doctorName = getDoctorName(period.appliesToDoctorId);

              return (
                <div
                  key={period.id}
                  className={`border rounded-md bg-background ${
                    isActive ? 'border-orange-300 bg-orange-50/30' : 'border-border'
                  }`}
                >
                  {/* Period Header (Always Visible) */}
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpanded(period.id)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {isActive && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded border border-orange-200">
                          🌴 Active
                        </span>
                      )}
                      {!isActive && upcoming && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                          📅 Upcoming
                        </span>
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {formatDateRange(period.startDate, period.endDate)}
                      </span>
                      {period.reason && (
                        <span className="text-sm text-muted-foreground">
                          • {period.reason}
                        </span>
                      )}
                      {doctorName && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          Dr. {doctorName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePeriod(period.id);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm px-2 py-1"
                      >
                        Remove
                      </button>
                      <span className="text-muted-foreground">
                        {expandedPeriodId === period.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Period Details (Expandable) */}
                  {expandedPeriodId === period.id && (
                    <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                      {/* Date Range */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={period.startDate}
                            onChange={(e) => updatePeriod(period.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            End Date *
                          </label>
                          <input
                            type="date"
                            value={period.endDate}
                            onChange={(e) => updatePeriod(period.id, 'endDate', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Reason
                        </label>
                        <input
                          type="text"
                          value={period.reason}
                          onChange={(e) => updatePeriod(period.id, 'reason', e.target.value)}
                          placeholder="e.g., Family holiday, Conference, Summer closure"
                          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Doctor Assignment (if doctors provided) */}
                      {doctors.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Applies To Doctor (Optional)
                          </label>
                          <select
                            value={period.appliesToDoctorId || ''}
                            onChange={(e) => updatePeriod(period.id, 'appliesToDoctorId', e.target.value || undefined)}
                            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Entire Practice</option>
                            {doctors.map(doctor => (
                              <option key={doctor.id} value={doctor.id}>
                                Dr. {doctor.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Leave as &quot;Entire Practice&quot; if the vacation applies to all doctors
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        Track practice closures and doctor vacation periods. Active periods are highlighted in orange.
      </p>
    </div>
  );
};

export default VacationManager;
