import en from './en.json';
import fa from './fa.json';
import { CivilDate } from '@/domain/calendar/civil-date';
import { formatCivilDateToJalali } from '@/domain/calendar/jalali';

export type Locale = 'fa' | 'en';
export type Dictionary = typeof fa;

const dictionaries = {
  fa,
  en: en as unknown as Dictionary,
};

export function getDictionary(locale: Locale = 'fa'): Dictionary {
  return dictionaries[locale] || dictionaries.fa;
}

export function formatDate(civilDate: CivilDate, calendar: 'persian' | 'gregorian' = 'persian'): string {
  if (calendar === 'persian') {
    return formatCivilDateToJalali(civilDate);
  }
  return civilDate;
}

export function formatNumber(n: number, locale: Locale = 'fa'): string {
  if (locale === 'fa') {
    return new Intl.NumberFormat('fa-IR').format(n);
  }
  return new Intl.NumberFormat('en-US').format(n);
}
