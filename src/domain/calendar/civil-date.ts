// src/domain/calendar/civil-date.ts
export type CivilDate = `${number}-${number}-${number}`; // YYYY-MM-DD

/**
 * Computes the logical "today" CivilDate for a given instant,
 * respecting the user's IANA timeZone and dayRolloverHour (e.g., 4 AM).
 */
export function getLogicalToday(
  nowUtc: Date,
  timeZone: string,
  dayRolloverHour: number = 4
): CivilDate {
  // Shift instant back by dayRolloverHour before formatting local civil date
  const shiftedInstant = new Date(nowUtc.getTime() - dayRolloverHour * 3600_000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(shiftedInstant);

  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${d}` as CivilDate;
}

/**
 * Adds `days` to a CivilDate using pure UTC noon arithmetic.
 * Completely immune to local DST shifts.
 */
export function addCivilDays(dateStr: CivilDate, days: number): CivilDate {
  const [y, m, d] = dateStr.split('-').map(Number) as [number, number, number];
  const utcNoon = Date.UTC(y, m - 1, d, 12, 0, 0);
  const target = new Date(utcNoon + days * 86_400_000);
  return target.toISOString().slice(0, 10) as CivilDate;
}

export function diffCivilDays(a: CivilDate, b: CivilDate): number {
  const [y1, m1, d1] = a.split('-').map(Number) as [number, number, number];
  const [y2, m2, d2] = b.split('-').map(Number) as [number, number, number];
  const msA = Date.UTC(y1, m1 - 1, d1, 12, 0, 0);
  const msB = Date.UTC(y2, m2 - 1, d2, 12, 0, 0);
  return Math.round((msA - msB) / 86_400_000);
}

export function getDayOfWeek(dateStr: CivilDate): number {
  const [y, m, d] = dateStr.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay(); // 0=Sun .. 6=Sat
}
