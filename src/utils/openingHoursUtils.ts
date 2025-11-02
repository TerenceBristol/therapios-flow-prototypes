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

  if (todayHours.isClosed || !todayHours.periods || todayHours.periods.length === 0) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  // Check if current time falls within ANY of the periods
  return todayHours.periods.some(period => {
    const [openHour, openMinute] = period.open.split(':').map(Number);
    const [closeHour, closeMinute] = period.close.split(':').map(Number);

    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    return currentTime >= openTime && currentTime < closeTime;
  });
}

/**
 * Get opening time if practice opens later today
 * @param openingHours - Full week opening hours
 * @returns Opening time in 12-hour format, or null if closed or already open
 */
export function getOpensLaterTime(openingHours: OpeningHours): string | null {
  const todayHours = getTodayHours(openingHours);

  if (todayHours.isClosed || !todayHours.periods || todayHours.periods.length === 0) {
    return null;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Find the next period that hasn't started yet
  for (const period of todayHours.periods) {
    const [openHour, openMinute] = period.open.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;

    // If current time is before this period's opening time, practice opens later
    if (currentTime < openTime) {
      return convertTo12Hour(period.open);
    }
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

    if (!dayHours.isClosed && dayHours.periods && dayHours.periods.length > 0) {
      const dayName = i === 1 ? 'tomorrow' : day.charAt(0).toUpperCase() + day.slice(1, 3);
      // Use the first period's opening time
      const time = convertTo12Hour(dayHours.periods[0].open);
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
    // Find which period we're currently in and show its hours
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const currentPeriod = todayHours.periods.find(period => {
      const [openHour, openMinute] = period.open.split(':').map(Number);
      const [closeHour, closeMinute] = period.close.split(':').map(Number);
      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;
      return currentTime >= openTime && currentTime < closeTime;
    });

    if (currentPeriod) {
      const openTime = convertTo12Hour(currentPeriod.open);
      const closeTime = convertTo12Hour(currentPeriod.close);
      return {
        status: 'open',
        displayText: `${openTime} - ${closeTime}`,
        icon: '🟢'
      };
    }
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
 * @returns Formatted string like "8:00 AM - 5:00 PM" or "8:00 AM - 5:00 PM (Break: 12:00 PM - 1:00 PM)" or "Closed"
 */
export function formatDayHours(dayHours: OpeningHoursDay): string {
  if (dayHours.isClosed || !dayHours.periods || dayHours.periods.length === 0) {
    return 'Closed';
  }

  const mainPeriod = dayHours.periods[0];
  const breakPeriod = dayHours.periods[1];

  // Format main hours
  const openTime = convertTo12Hour(mainPeriod.open);
  const closeTime = convertTo12Hour(mainPeriod.close);
  let result = `${openTime} - ${closeTime}`;

  // Add break if exists
  if (breakPeriod) {
    const breakOpen = convertTo12Hour(breakPeriod.open);
    const breakClose = convertTo12Hour(breakPeriod.close);
    result += ` (Break: ${breakOpen} - ${breakClose})`;
  }

  return result;
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
 * Group consecutive days with identical hours for compact display
 * @param openingHours - Full week opening hours
 * @returns Array of grouped day ranges with their hours
 */
export function groupConsecutiveDaysWithHours(
  openingHours: OpeningHours
): Array<{ days: string; hours: string; isToday: boolean; notes?: string[] }> {
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

  const today = getCurrentDayOfWeek();
  const groups: Array<{ days: string; hours: string; isToday: boolean; notes?: string[] }> = [];

  let currentGroup: {
    dayKeys: Array<keyof OpeningHours>;
    hours: string;
    notes: string[]
  } | null = null;

  days.forEach(day => {
    const dayHours = openingHours[day];
    const hoursStr = formatDayHours(dayHours);
    const dayNote = dayHours.notes?.trim();

    // Check if we can group with current group (same hours, no notes on either)
    const canGroup = currentGroup &&
                     currentGroup.hours === hoursStr &&
                     currentGroup.notes.length === 0 &&
                     !dayNote;

    if (canGroup) {
      currentGroup!.dayKeys.push(day);
    } else {
      // Push current group if exists
      if (currentGroup) {
        const dayRange = currentGroup.dayKeys.length > 1
          ? `${dayAbbrev[currentGroup.dayKeys[0]]}-${dayAbbrev[currentGroup.dayKeys[currentGroup.dayKeys.length - 1]]}`
          : dayAbbrev[currentGroup.dayKeys[0]];

        const includesToday = currentGroup.dayKeys.includes(today as keyof OpeningHours);

        groups.push({
          days: dayRange,
          hours: currentGroup.hours,
          isToday: includesToday,
          notes: currentGroup.notes.length > 0 ? currentGroup.notes : undefined
        });
      }

      // Start new group
      currentGroup = {
        dayKeys: [day],
        hours: hoursStr,
        notes: dayNote ? [dayNote] : []
      };
    }
  });

  // Push final group
  if (currentGroup) {
    const dayRange = currentGroup.dayKeys.length > 1
      ? `${dayAbbrev[currentGroup.dayKeys[0]]}-${dayAbbrev[currentGroup.dayKeys[currentGroup.dayKeys.length - 1]]}`
      : dayAbbrev[currentGroup.dayKeys[0]];

    const includesToday = currentGroup.dayKeys.includes(today as keyof OpeningHours);

    groups.push({
      days: dayRange,
      hours: currentGroup.hours,
      isToday: includesToday,
      notes: currentGroup.notes.length > 0 ? currentGroup.notes : undefined
    });
  }

  return groups;
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
    periods: [
      {
        open: '09:00',
        close: '17:00'
      }
    ],
    isClosed: false
  };

  const closedDay: OpeningHoursDay = {
    periods: [],
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
