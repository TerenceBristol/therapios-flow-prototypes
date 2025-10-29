/**
 * Opening hours utility functions for the FVO CRM system
 */

import { OpeningHours, OpeningHoursDay } from '@/types';
import { convertTo12Hour, getCurrentDayOfWeek } from './timeUtils';

export type DayStatus = 'open' | 'closed' | 'opens-later';

export interface TodayStatus {
  status: DayStatus;
  displayText: string;
  icon: string;
}

/**
 * Get the opening hours for a specific day
 * @param openingHours - Full week opening hours
 * @param dayName - Day name (lowercase)
 * @returns Opening hours for that day
 */
export function getDayHours(
  openingHours: OpeningHours,
  dayName: keyof OpeningHours
): OpeningHoursDay {
  return openingHours[dayName];
}

/**
 * Get today's opening hours
 * @param openingHours - Full week opening hours
 * @returns Today's opening hours
 */
export function getTodayHours(openingHours: OpeningHours): OpeningHoursDay {
  const today = getCurrentDayOfWeek() as keyof OpeningHours;
  return openingHours[today];
}

/**
 * Check if a practice is currently open
 * @param openingHours - Full week opening hours
 * @returns true if open now
 */
export function isOpenNow(openingHours: OpeningHours): boolean {
  const todayHours = getTodayHours(openingHours);

  if (todayHours.isClosed) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  const [openHour, openMinute] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);

  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  return currentTime >= openTime && currentTime < closeTime;
}

/**
 * Get opening time if practice opens later today
 * @param openingHours - Full week opening hours
 * @returns Opening time in 12-hour format, or null if closed or already open
 */
export function getOpensLaterTime(openingHours: OpeningHours): string | null {
  const todayHours = getTodayHours(openingHours);

  if (todayHours.isClosed) {
    return null;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMinute] = todayHours.open.split(':').map(Number);
  const openTime = openHour * 60 + openMinute;

  // If current time is before opening time, practice opens later today
  if (currentTime < openTime) {
    return convertTo12Hour(todayHours.open);
  }

  return null;
}

/**
 * Get the next day the practice will be open
 * @param openingHours - Full week opening hours
 * @returns Object with day name and opening time, or null if closed all week
 */
export function getNextOpeningDay(openingHours: OpeningHours): { day: string; time: string } | null {
  const days: Array<keyof OpeningHours> = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = getCurrentDayOfWeek();
  const todayIndex = days.indexOf(today as keyof OpeningHours);

  // Check each day starting from tomorrow
  for (let i = 1; i <= 7; i++) {
    const dayIndex = (todayIndex + i) % 7;
    const day = days[dayIndex];
    const dayHours = openingHours[day];

    if (!dayHours.isClosed) {
      const dayName = i === 1 ? 'tomorrow' : day.charAt(0).toUpperCase() + day.slice(1, 3);
      const time = convertTo12Hour(dayHours.open);
      return { day: dayName, time };
    }
  }

  // Closed all week
  return null;
}

/**
 * Get the current status of a practice (open, closed, or opens later today)
 * @param openingHours - Full week opening hours
 * @returns Status object with display information
 */
export function getTodayStatus(openingHours: OpeningHours): TodayStatus {
  const todayHours = getTodayHours(openingHours);

  if (todayHours.isClosed) {
    const nextOpening = getNextOpeningDay(openingHours);
    if (nextOpening) {
      return {
        status: 'closed',
        displayText: `Closed • Opens ${nextOpening.day} at ${nextOpening.time}`,
        icon: '🔴'
      };
    }
    return {
      status: 'closed',
      displayText: 'Closed',
      icon: '🔴'
    };
  }

  const opensLater = getOpensLaterTime(openingHours);

  if (opensLater) {
    return {
      status: 'opens-later',
      displayText: `Opens at ${opensLater}`,
      icon: '⏰'
    };
  }

  if (isOpenNow(openingHours)) {
    const openTime = convertTo12Hour(todayHours.open);
    const closeTime = convertTo12Hour(todayHours.close);
    return {
      status: 'open',
      displayText: `${openTime} - ${closeTime}`,
      icon: '🟢'
    };
  }

  // Closed for today (past closing time) - show next opening
  const nextOpening = getNextOpeningDay(openingHours);
  if (nextOpening) {
    return {
      status: 'closed',
      displayText: `Closed • Opens ${nextOpening.day} at ${nextOpening.time}`,
      icon: '🔴'
    };
  }
  return {
    status: 'closed',
    displayText: 'Closed',
    icon: '🔴'
  };
}

/**
 * Format opening hours for display
 * @param dayHours - Opening hours for a day
 * @returns Formatted string like "8:00 AM - 5:00 PM" or "Closed"
 */
export function formatDayHours(dayHours: OpeningHoursDay): string {
  if (dayHours.isClosed) {
    return 'Closed';
  }

  const openTime = convertTo12Hour(dayHours.open);
  const closeTime = convertTo12Hour(dayHours.close);

  return `${openTime} - ${closeTime}`;
}

/**
 * Format opening hours for all days with highlighting for current day
 * @param openingHours - Full week opening hours
 * @returns Array of formatted day hours with current day flag
 */
export function formatWeekHours(
  openingHours: OpeningHours
): Array<{ day: string; hours: string; isToday: boolean }> {
  const days: Array<keyof OpeningHours> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  const today = getCurrentDayOfWeek();

  return days.map(day => ({
    day: day.charAt(0).toUpperCase() + day.slice(1),
    hours: formatDayHours(openingHours[day]),
    isToday: day === today
  }));
}

/**
 * Check if a practice is open on a specific day
 * @param openingHours - Full week opening hours
 * @param dayName - Day name (lowercase)
 * @returns true if open that day
 */
export function isOpenOnDay(openingHours: OpeningHours, dayName: keyof OpeningHours): boolean {
  return !openingHours[dayName].isClosed;
}

/**
 * Check if a practice is open today
 * @param openingHours - Full week opening hours
 * @returns true if open today (at any time)
 */
export function isOpenToday(openingHours: OpeningHours): boolean {
  const today = getCurrentDayOfWeek() as keyof OpeningHours;
  return !openingHours[today].isClosed;
}

/**
 * Get human-readable summary of opening hours
 * @param openingHours - Full week opening hours
 * @returns Summary string like "Mon-Fri 8 AM - 5 PM, Sat 9 AM - 1 PM"
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

  const dayAbbrev = {
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
    const dayHours = openingHours[day];
    const hoursStr = formatDayHours(dayHours);

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
    .filter(group => group.hours !== 'Closed')
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
 * Validate opening hours time format
 * @param time - Time string in HH:MM format
 * @returns true if valid
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

/**
 * Create a default opening hours object (Mon-Fri 9-5, weekends closed)
 * @returns Default opening hours
 */
export function createDefaultOpeningHours(): OpeningHours {
  const weekdayHours: OpeningHoursDay = {
    open: '09:00',
    close: '17:00',
    isClosed: false
  };

  const closedDay: OpeningHoursDay = {
    open: '00:00',
    close: '00:00',
    isClosed: true
  };

  return {
    monday: { ...weekdayHours },
    tuesday: { ...weekdayHours },
    wednesday: { ...weekdayHours },
    thursday: { ...weekdayHours },
    friday: { ...weekdayHours },
    saturday: { ...closedDay },
    sunday: { ...closedDay }
  };
}
