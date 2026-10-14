// src/domain/calendar/jalali.ts
import { CivilDate } from './civil-date';
import * as jalaali from 'jalaali-js';

/**
 * Deterministic Gregorian <-> Solar Hijri (Jalali) conversions using jalaali-js
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const res = jalaali.toJalaali(gy, gm, gd);
  return [res.jy, res.jm, res.jd];
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  const res = jalaali.toGregorian(jy, jm, jd);
  return [res.gy, res.gm, res.gd];
}

export function formatCivilDateToJalali(civilDate: CivilDate): string {
  const parts = civilDate.split('-').map(Number);
  const gy = parts[0] ?? 2026;
  const gm = parts[1] ?? 1;
  const gd = parts[2] ?? 1;
  const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}
