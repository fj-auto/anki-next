// file: utils/dateUtils.ts

/**
 * Formats a Date object or date string to 'YYYY-MM-DD' format.
 * @param date - Date object or date string to format
 * @returns Formatted date string in 'YYYY-MM-DD' format
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Parses a date string in 'YYYY-MM-DD' format to a Date object in UTC.
 * @param dateString - Date string in 'YYYY-MM-DD' format
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Calculates the difference in days between two dates.
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between the two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
}

/**
 * Adds a specified number of days to a given date.
 * @param date - The starting date
 * @param days - Number of days to add (can be negative)
 * @returns New Date object
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Checks if a date is today.
 * @param date - Date to check
 * @returns Boolean indicating if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function getCurrentDate(): string {
  return formatDate(new Date());
}
