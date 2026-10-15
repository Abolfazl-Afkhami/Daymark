// src/lib/calendar/format-date.ts
import * as jalaali from 'jalaali-js';

export type CalendarSystem = 'persian' | 'gregorian';
export type UiLocale = 'fa' | 'en';

const JALALI_MONTHS_FA = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const JALALI_MONTHS_EN = [
  'Farvardin',
  'Ordibehesht',
  'Khordad',
  'Tir',
  'Mordad',
  'Shahrivar',
  'Mehr',
  'Aban',
  'Azar',
  'Dey',
  'Bahman',
  'Esfand',
];

const GREGORIAN_MONTHS_FA = [
  'ژانویه',
  'فوریه',
  'مارس',
  'آوریل',
  'مه',
  'ژوئن',
  'ژوئیه',
  'اوت',
  'سپتامبر',
  'اکتبر',
  'نوامبر',
  'دسامبر',
];

const GREGORIAN_MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEKDAYS_FA = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
];

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toPersianDigits(val: string | number): string {
  return String(val).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!);
}

/**
 * قالب‌بندی تاریخ YYYY-MM-DD بر اساس سیستم تقویم و زبان انتخابی کاربر در تنظیمات
 */
export function formatAppDate(
  civilDateStr: string | null | undefined,
  calendarSystem: CalendarSystem = 'persian',
  locale: UiLocale = 'fa',
  style: 'short' | 'medium' | 'full' = 'medium'
): string {
  if (!civilDateStr || civilDateStr.length < 10) return '';
  const parts = civilDateStr.slice(0, 10).split('-').map(Number);
  const gy = parts[0];
  const gm = parts[1];
  const gd = parts[2];
  if (!gy || !gm || !gd) return civilDateStr;

  const utcDate = new Date(Date.UTC(gy, gm - 1, gd, 12, 0, 0));
  const dow = utcDate.getUTCDay();

  if (calendarSystem === 'persian') {
    const { jy, jm, jd } = jalaali.toJalaali(gy, gm, gd);
    if (style === 'short') {
      const numeric = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
      return locale === 'fa' ? toPersianDigits(numeric) : numeric;
    }
    const monthName =
      locale === 'fa' ? JALALI_MONTHS_FA[jm - 1] : JALALI_MONTHS_EN[jm - 1];
    const dayStr = locale === 'fa' ? toPersianDigits(jd) : String(jd);
    const yearStr = locale === 'fa' ? toPersianDigits(jy) : String(jy);

    if (style === 'full') {
      const wd = locale === 'fa' ? WEEKDAYS_FA[dow] : WEEKDAYS_EN[dow];
      return locale === 'fa'
        ? `${wd}، ${dayStr} ${monthName} ${yearStr}`
        : `${wd}, ${dayStr} ${monthName} ${yearStr}`;
    }
    return `${dayStr} ${monthName} ${yearStr}`;
  } else {
    // Gregorian Calendar
    if (style === 'short') {
      const numeric = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
      return locale === 'fa' ? toPersianDigits(numeric) : numeric;
    }
    const monthName =
      locale === 'fa' ? GREGORIAN_MONTHS_FA[gm - 1] : GREGORIAN_MONTHS_EN[gm - 1];
    const dayStr = locale === 'fa' ? toPersianDigits(gd) : String(gd);
    const yearStr = locale === 'fa' ? toPersianDigits(gy) : String(gy);

    if (style === 'full') {
      const wd = locale === 'fa' ? WEEKDAYS_FA[dow] : WEEKDAYS_EN[dow];
      return locale === 'fa'
        ? `${wd}، ${dayStr} ${monthName} ${yearStr}`
        : `${wd}, ${monthName} ${dayStr}, ${yearStr}`;
    }
    return locale === 'fa'
      ? `${dayStr} ${monthName} ${yearStr}`
      : `${monthName} ${dayStr}, ${yearStr}`;
  }
}

export {
  JALALI_MONTHS_FA,
  JALALI_MONTHS_EN,
  GREGORIAN_MONTHS_FA,
  GREGORIAN_MONTHS_EN,
};
