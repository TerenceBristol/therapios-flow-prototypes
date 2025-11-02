'use client';

import React, { useState } from 'react';
import { VacationPeriod, PracticeDoctor } from '@/types';

interface VacationBannerProps {
  vacationPeriods: VacationPeriod[];
  doctors?: PracticeDoctor[]; // Optional: for doctor name lookup
}

const VacationBanner: React.FC<VacationBannerProps> = ({
  vacationPeriods,
  doctors = []
}) => {
  const [showPast, setShowPast] = useState(false);

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

  const isPast = (period: VacationPeriod): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(period.endDate);
    end.setHours(23, 59, 59, 999);

    return end < today;
  };

  const getDoctorName = (doctorId?: string): string => {
    if (!doctorId) return 'Entire Practice';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.name}` : 'Unknown Doctor';
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    const currentYear = new Date().getFullYear();

    // Add year if different from current year
    const showYear = startYear !== currentYear || endYear !== currentYear;

    if (startDate === endDate) {
      return showYear ? `${formatDate(start)}, ${startYear}` : formatDate(start);
    }

    if (startYear === endYear) {
      return showYear ? `${formatDate(start)} - ${formatDate(end)}, ${startYear}` : `${formatDate(start)} - ${formatDate(end)}`;
    }

    return `${formatDate(start)}, ${startYear} - ${formatDate(end)}, ${endYear}`;
  };

  const getDaysInfo = (period: VacationPeriod): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(period.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(period.endDate);
    end.setHours(23, 59, 59, 999);

    if (isCurrentlyOnVacation(period)) {
      const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysRemaining === 1 ? 'Last day' : `${daysRemaining} days left`;
    }

    if (isUpcoming(period)) {
      const daysUntil = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `In ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`;
    }

    return '';
  };

  const activePeriods = vacationPeriods.filter(isCurrentlyOnVacation);
  const upcomingPeriods = vacationPeriods.filter(isUpcoming);
  const pastPeriods = vacationPeriods.filter(isPast);

  // Sort by start date
  const sortedActivePeriods = [...activePeriods].sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  const sortedUpcomingPeriods = [...upcomingPeriods].sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  const sortedPastPeriods = [...pastPeriods].sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  if (vacationPeriods.length === 0) {
    return (
      <div className="text-center py-6 px-4 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
        <p className="text-sm">No vacation periods scheduled</p>
      </div>
    );
  }

  const renderRow = (period: VacationPeriod, status: 'active' | 'upcoming' | 'past') => {
    const statusConfig = {
      active: {
        icon: '🌴',
        badge: 'ON VACATION',
        badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
        rowClass: 'bg-orange-50/50'
      },
      upcoming: {
        icon: '📅',
        badge: getDaysInfo(period),
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        rowClass: 'bg-blue-50/30'
      },
      past: {
        icon: '✓',
        badge: 'PAST',
        badgeClass: 'bg-gray-100 text-gray-600 border-gray-300',
        rowClass: 'bg-gray-50/30'
      }
    };

    const config = statusConfig[status];

    return (
      <tr key={period.id} className={config.rowClass}>
        <td className="py-2 px-3 text-sm">
          <div className="flex items-center gap-2">
            <span>{config.icon}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium border ${config.badgeClass}`}>
              {config.badge}
            </span>
          </div>
        </td>
        <td className="py-2 px-3 text-sm font-medium text-foreground">
          {formatDateRange(period.startDate, period.endDate)}
        </td>
        <td className="py-2 px-3 text-sm text-foreground">
          {getDoctorName(period.appliesToDoctorId)}
        </td>
        <td className="py-2 px-3 text-sm text-muted-foreground">
          {period.reason || '—'}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-3">
      {/* Active & Upcoming Periods Table */}
      {(sortedActivePeriods.length > 0 || sortedUpcomingPeriods.length > 0) && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-foreground w-1/5">Status</th>
                <th className="text-left py-2 px-3 font-medium text-foreground w-1/4">Dates</th>
                <th className="text-left py-2 px-3 font-medium text-foreground w-1/5">Doctor</th>
                <th className="text-left py-2 px-3 font-medium text-foreground">Reason</th>
              </tr>
            </thead>
            <tbody>
              {sortedActivePeriods.map(period => renderRow(period, 'active'))}
              {sortedUpcomingPeriods.map(period => renderRow(period, 'upcoming'))}
            </tbody>
          </table>
        </div>
      )}

      {/* Past Periods (Collapsible) */}
      {sortedPastPeriods.length > 0 && (
        <div>
          <button
            onClick={() => setShowPast(!showPast)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <span>{showPast ? '▼' : '▶'}</span>
            <span>Past Vacations ({sortedPastPeriods.length})</span>
          </button>

          {showPast && (
            <div className="mt-2 border border-border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-foreground w-1/5">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-foreground w-1/4">Dates</th>
                    <th className="text-left py-2 px-3 font-medium text-foreground w-1/5">Doctor</th>
                    <th className="text-left py-2 px-3 font-medium text-foreground">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPastPeriods.map(period => renderRow(period, 'past'))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VacationBanner;
