import { fa } from './fa';
import { en } from './en';
import { Dictionary, Locale } from './types';
import { CivilDate } from '@/domain/calendar/civil-date';
import { formatCivilDateToJalali } from '@/domain/calendar/jalali';

export * from './types';
export { fa, en };
export { I18nProvider, useI18n } from './provider';

const dictionaries: Record<Locale, Dictionary> = {
  fa,
  en,
};

export function getDictionary(locale: Locale = 'fa'): Dictionary {
  return dictionaries[locale] || dictionaries.fa;
}

export function formatDate(
  civilDate: CivilDate,
  calendar: 'persian' | 'gregorian' = 'persian'
): string {
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
