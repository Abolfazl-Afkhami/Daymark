// src/application/services/gap-detector.ts
import { sqlite } from '@/db/client';
import { CivilDate, addCivilDays, getDayOfWeek } from '@/domain/calendar/civil-date';

export interface UnloggedHabitItem {
  id: string;
  name: string;
  categoryName: string;
  categoryColor: string;
  habitType: 'BINARY' | 'QUANTITATIVE';
  targetValue: number | null;
  targetUnit: string | null;
}

export interface DayGapRecord {
  date: CivilDate;
  dayOffset: number; // -1 for yesterday, -2 for 2 days ago, etc.
  unloggedHabits: UnloggedHabitItem[];
  focusMinutes: number;
  hasGap: boolean;
}

export class GapDetectorService {
  /**
   * Scans the past 7 days (today - 1 to today - 7) for unlogged habits or days with zero focus.
   * Enables retroactive logging to keep streaks truthful and retention high.
   */
  static getPast7DaysGaps(todayCivilDate: CivilDate): DayGapRecord[] {
    const gaps: DayGapRecord[] = [];

    // All active habits with category info and latest schedule version
    const activeHabits = sqlite
      .prepare(
        `SELECT h.id, h.name, h.habit_type, h.start_date,
                c.name as category_name, c.color_hex as category_color,
                v.schedule_type, v.weekdays_mask, v.target_value, v.target_unit
         FROM habits h
         JOIN categories c ON h.category_id = c.id
         LEFT JOIN habit_schedule_versions v ON h.id = v.habit_id
         WHERE h.status = 'ACTIVE'`
      )
      .all() as Array<{
      id: string;
      name: string;
      habit_type: 'BINARY' | 'QUANTITATIVE';
      start_date: string;
      category_name: string;
      category_color: string;
      schedule_type: string | null;
      weekdays_mask: number | null;
      target_value: number | null;
      target_unit: string | null;
    }>;

    for (let offset = 1; offset <= 7; offset++) {
      const pastDate = addCivilDays(todayCivilDate, -offset);

      const unloggedHabits: UnloggedHabitItem[] = [];

      for (const h of activeHabits) {
        if (h.start_date > pastDate) continue; // Created after this date

        let isScheduled = true;
        if (h.schedule_type === 'WEEKDAYS' && h.weekdays_mask !== null) {
          const dow = getDayOfWeek(pastDate);
          isScheduled = (h.weekdays_mask & (1 << dow)) !== 0;
        }

        if (!isScheduled) continue;

        const log = sqlite
          .prepare('SELECT status FROM habit_logs WHERE habit_id = ? AND log_date = ?')
          .get(h.id, pastDate) as { status: string } | undefined;

        if (!log) {
          unloggedHabits.push({
            id: h.id,
            name: h.name,
            categoryName: h.category_name,
            categoryColor: h.category_color,
            habitType: h.habit_type,
            targetValue: h.target_value,
            targetUnit: h.target_unit,
          });
        }
      }

      // Check focus time on that date
      const sessionRow = sqlite
        .prepare(
          'SELECT COALESCE(SUM(duration_minutes), 0) as total_min FROM study_sessions WHERE session_date = ?'
        )
        .get(pastDate) as { total_min: number } | undefined;
      const focusMinutes = sessionRow?.total_min ?? 0;

      // Only count as gap if there are unlogged habits or 0 focus
      if (unloggedHabits.length > 0 || focusMinutes === 0) {
        gaps.push({
          date: pastDate,
          dayOffset: -offset,
          unloggedHabits,
          focusMinutes,
          hasGap: true,
        });
      }
    }

    return gaps;
  }
}
