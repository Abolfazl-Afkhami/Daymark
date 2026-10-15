// src/lib/date-format.ts
import { gregorianToJalali, jalaliToGregorian } from '@/domain/calendar/jalali';

export type CalendarSystem = 'persian' | 'gregorian';

const PERSIAN_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const GREGORIAN_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GREGORIAN_MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * قالب‌بندی جامع و سراسری تاریخ برای کل برنامه
 * @param civilDate تاریخ استاندارد میلادی (YYYY-MM-DD)
 * @param calendarSystem سیستم تقویم ('persian' | 'gregorian')
 * @param format نوع فرمت ('full' | 'short' | 'month-day')
 */
export function formatAppDate(
  civilDate: string | null | undefined,
  calendarSystem: CalendarSystem = 'persian',
  format: 'full' | 'short' | 'month-day' = 'full'
): string {
  if (!civilDate) return '';
  const parts = civilDate.slice(0, 10).split('-').map(Number);
  const gy = parts[0] || 2026;
  const gm = parts[1] || 1;
  const gd = parts[2] || 1;

  if (calendarSystem === 'gregorian') {
    if (format === 'short') {
      return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
    }
    if (format === 'month-day') {
      return `${GREGORIAN_MONTH_SHORT[gm - 1]} ${gd}`;
    }
    return `${GREGORIAN_MONTH_SHORT[gm - 1]} ${gd}, ${gy}`;
  }

  // Persian / Jalali
  const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);

  if (format === 'short') {
    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
  }
  if (format === 'month-day') {
    return `${jd} ${PERSIAN_MONTH_NAMES[jm - 1]}`;
  }
  return `${jd} ${PERSIAN_MONTH_NAMES[jm - 1]} ${jy}`;
}

/**
 * دریافت سیستم تقویم فعال کلاینت از تگ ریشه DOM
 */
export function getActiveCalendarSystem(): CalendarSystem {
  if (typeof document === 'undefined') return 'persian';
  const attr = document.documentElement.getAttribute('data-calendar');
  return attr === 'gregorian' ? 'gregorian' : 'persian';
}

export { PERSIAN_MONTH_NAMES, GREGORIAN_MONTH_NAMES, GREGORIAN_MONTH_SHORT };
