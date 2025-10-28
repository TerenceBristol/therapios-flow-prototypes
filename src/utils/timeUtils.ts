/**
 * Time utility functions for the FVO CRM system
 */

/**
 * Parse a time string and date string into a Date object
 * @param dateString - Date in YYYY-MM-DD format
 * @param timeString - Time in 12-hour format like "2:30 PM" or "9:00 AM"
 * @returns Date object with the combined date and time
 */
export function parseTimeToDate(dateString: string, timeString: string): Date {
  const datePart = new Date(dateString);

  // Parse time string (format: "2:30 PM" or "9:00 AM")
  const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (!timeMatch) {
    // If parsing fails, return the date at midnight
    return datePart;
  }

  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const period = timeMatch[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  datePart.setHours(hours, minutes, 0, 0);
  return datePart;
}

/**
 * Convert 24-hour time to 12-hour format
 * @param time24 - Time in 24-hour format like "14:30" or "09:00"
 * @returns Time in 12-hour format like "2:30 PM" or "9:00 AM"
 */
export function convertTo12Hour(time24: string): string {
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr);
  const minutes = minutesStr;

  const period = hours >= 12 ? 'PM' : 'AM';

  // Convert 0-23 to 1-12
  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  return `${hours}:${minutes} ${period}`;
}

/**
 * Convert 12-hour time to 24-hour format
 * @param time12 - Time in 12-hour format like "2:30 PM" or "9:00 AM"
 * @returns Time in 24-hour format like "14:30" or "09:00"
 */
export function convertTo24Hour(time12: string): string {
  const timeMatch = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (!timeMatch) {
    return "09:00"; // Default fallback
  }

  let hours = parseInt(timeMatch[1]);
  const minutes = timeMatch[2];
  const period = timeMatch[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Format time string to consistent 12-hour format
 * @param time - Time string (may already be in 12-hour format)
 * @returns Formatted time in 12-hour format
 */
export function formatTime12Hour(time: string): string {
  // If already in 12-hour format, return as is
  if (time.includes('AM') || time.includes('PM') || time.includes('am') || time.includes('pm')) {
    return time.toUpperCase().replace(/\s+/g, ' '); // Normalize spacing
  }

  // Assume it's in 24-hour format
  return convertTo12Hour(time);
}

/**
 * Get the current day of the week in lowercase
 * @returns Day name like "monday", "tuesday", etc.
 */
export function getCurrentDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  return days[today.getDay()];
}

/**
 * Format a date to "Oct 28, 2:30 PM" or "Today, 2:30 PM"
 * @param dateString - Date in ISO or YYYY-MM-DD format
 * @param timeString - Optional time in 12-hour format
 * @returns Formatted string
 */
export function formatDateTimeDisplay(dateString: string, timeString?: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const isToday = targetDate.getTime() === today.getTime();

  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (isToday && timeString) {
    return `Today, ${timeString}`;
  } else if (isToday) {
    return 'Today';
  } else if (timeString) {
    return `${monthDay}, ${timeString}`;
  } else {
    return monthDay;
  }
}

/**
 * Format a date to full readable format like "Oct 28, 2024"
 * @param dateString - Date in ISO or YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Check if a given time is in the past relative to now
 * @param dateString - Date in YYYY-MM-DD format
 * @param timeString - Time in 12-hour format like "2:30 PM"
 * @returns true if the datetime is in the past
 */
export function isTimePast(dateString: string, timeString?: string): boolean {
  const now = new Date();

  if (!timeString) {
    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999); // End of day
    return date < now;
  }

  const targetDateTime = parseTimeToDate(dateString, timeString);
  return targetDateTime < now;
}

/**
 * Parse date string to YYYY-MM-DD format
 * @param date - Date object or string
 * @returns Date in YYYY-MM-DD format
 */
export function formatDateYYYYMMDD(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns Today's date string
 */
export function getTodayYYYYMMDD(): string {
  return formatDateYYYYMMDD(new Date());
}

/**
 * Generate time options for a time picker dropdown (in 30-minute intervals)
 * @returns Array of time strings in 12-hour format
 */
export function generateTimeOptions(): string[] {
  const times: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(convertTo12Hour(time24));
    }
  }

  return times;
}
