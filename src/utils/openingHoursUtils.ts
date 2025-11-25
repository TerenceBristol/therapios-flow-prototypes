/**
 * Opening hours utility functions for the FVO CRM system
 * Updated for simple text-based OpeningHours format
 */

import { OpeningHours } from '@/types';

/**
 * Create a default opening hours object (Mon-Fri 9 AM - 5 PM, weekends closed)
 * @returns Default opening hours
 */
export function createDefaultOpeningHours(): OpeningHours {
  return {
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
    saturday: 'Closed',
    sunday: 'Closed'
  };
}

/**
 * Get human-readable summary of opening hours
 * @param openingHours - Full week opening hours
 * @returns Summary string like "Mon-Fri 9:00 AM - 5:00 PM"
 */
export function getHoursSummary(openingHours: OpeningHours): string {
  const days: Array<keyof OpeningHours> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  const dayAbbrev: Record<keyof OpeningHours, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };

  // Group consecutive days with same hours
  const groups: Array<{ days: string[]; hours: string }> = [];

  let currentGroup: { days: string[]; hours: string } | null = null;

  days.forEach(day => {
    const hoursStr = openingHours[day] || 'Not set';

    if (currentGroup && currentGroup.hours === hoursStr) {
      currentGroup.days.push(dayAbbrev[day]);
    } else {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        days: [dayAbbrev[day]],
        hours: hoursStr
      };
    }
  });

  if (currentGroup) {
    groups.push(currentGroup);
  }

  // Filter out closed days and format
  return groups
    .filter(group => group.hours.toLowerCase() !== 'closed' && group.hours !== 'Not set')
    .map(group => {
      const dayRange =
        group.days.length > 1
          ? `${group.days[0]}-${group.days[group.days.length - 1]}`
          : group.days[0];
      return `${dayRange} ${group.hours}`;
    })
    .join(', ');
}

/**
 * Get today's hours text
 * @param openingHours - Full week opening hours
 * @returns Today's hours string
 */
export function getTodayHours(openingHours: OpeningHours): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof OpeningHours;
  return openingHours[today] || 'Not set';
}

/**
 * Check if hours indicate the practice is closed
 * @param hours - Hours string for a day
 * @returns true if closed
 */
export function isClosed(hours: string): boolean {
  return hours.toLowerCase() === 'closed' || !hours;
}
