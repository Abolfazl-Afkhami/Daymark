// src/domain/sessions/overlap.ts

export interface TimeInterval {
  start: Date | string;
  end: Date | string;
}

export function toEpoch(d: Date | string): number {
  return typeof d === 'string' ? new Date(d).getTime() : d.getTime();
}

/**
 * Checks if two intervals overlap: tExistingStart < tEnd && tExistingEnd > tStart
 */
export function checkIntervalOverlap(a: TimeInterval, b: TimeInterval): boolean {
  const startA = toEpoch(a.start);
  const endA = toEpoch(a.end);
  const startB = toEpoch(b.start);
  const endB = toEpoch(b.end);

  return startA < endB && endA > startB;
}

/**
 * Merges overlapping intervals to compute total Net Focused Time without double-counting
 */
export function computeNetFocusedMinutes(intervals: TimeInterval[]): number {
  if (intervals.length === 0) return 0;

  // Convert to numeric start/end in ms and sort by start
  const sorted = intervals
    .map((i) => ({ start: toEpoch(i.start), end: toEpoch(i.end) }))
    .filter((i) => i.end > i.start)
    .sort((a, b) => a.start - b.start);

  if (sorted.length === 0) return 0;

  const merged: Array<{ start: number; end: number }> = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start < last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  const totalMs = merged.reduce((acc, curr) => acc + (curr.end - curr.start), 0);
  return Math.round(totalMs / 60000);
}
