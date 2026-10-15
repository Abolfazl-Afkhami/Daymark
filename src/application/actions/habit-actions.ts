'use server';

import { db, sqlite } from '@/db/client';
import { habits, habitScheduleVersions } from '@/db/schema';
import { HabitService } from '@/application/services/habit-service';
import { getLogicalToday } from '@/domain/calendar/civil-date';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createHabitAction(formData: FormData) {
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const habitType = (formData.get('habitType') as 'BINARY' | 'QUANTITATIVE') || 'BINARY';
  const targetValue = formData.get('targetValue') ? Number(formData.get('targetValue')) : null;
  const targetUnit = (formData.get('targetUnit') as string) || null;
  const scheduleType = (formData.get('scheduleType') as 'DAILY' | 'WEEKDAYS' | 'WEEKLY_TARGET' | 'INTERVAL') || 'DAILY';

  if (!name || !categoryId) {
    throw new Error('Name and category are required');
  }

  const habitId = `hab_${Date.now()}`;
  const now = new Date().toISOString();
  const todayCivil = now.slice(0, 10);

  // Atomic insert into habits and habit_schedule_versions
  db.insert(habits).values({
    id: habitId,
    categoryId,
    name,
    habitType,
    status: 'ACTIVE',
    startDate: todayCivil,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }).run();

  db.insert(habitScheduleVersions).values({
    id: `ver_${Date.now()}`,
    habitId,
    effectiveFromDate: todayCivil,
    effectiveToDate: null,
    scheduleType,
    targetValue,
    targetUnit,
    createdAt: now,
  }).run();

  revalidatePath('/today');
  revalidatePath('/habits');
  redirect('/today');
}

export async function logHabitAction(
  habitId: string,
  status: 'COMPLETED' | 'PARTIAL' | 'SKIPPED',
  value: number,
  targetDateCivil?: string
) {
  const now = new Date();
  const targetCivil = targetDateCivil || getLogicalToday(now, 'Asia/Tehran', 4);
  const nowIso = now.toISOString();

  await HabitService.logHabit({
    habitId,
    logDate: targetCivil as any,
    status,
    value,
  });

  // Sync linked goals where linked_habit_id = habitId
  const linkedGoals = sqlite
    .prepare(
      `SELECT id, progress_source, target_value, manual_current_value, start_date
       FROM goals
       WHERE status = 'ACTIVE' AND linked_habit_id = ?`
    )
    .all(habitId) as Array<{
    id: string;
    progress_source: string;
    target_value: number;
    manual_current_value: number;
    start_date: string;
  }>;

  for (const goal of linkedGoals) {
    let computedValue = goal.manual_current_value;
    if (goal.progress_source === 'HABIT_SUM') {
      const row = sqlite
        .prepare(
          `SELECT COALESCE(SUM(value), 0) as total_val
           FROM habit_logs
           WHERE habit_id = ? AND log_date >= ?`
        )
        .get(habitId, goal.start_date) as { total_val: number };
      computedValue = row.total_val;
    } else if (goal.progress_source === 'HABIT_COUNT') {
      const row = sqlite
        .prepare(
          `SELECT COUNT(*) as total_count
           FROM habit_logs
           WHERE habit_id = ? AND status = 'COMPLETED' AND log_date >= ?`
        )
        .get(habitId, goal.start_date) as { total_count: number };
      computedValue = row.total_count;
    }

    const newStatus = computedValue >= goal.target_value ? 'COMPLETED' : 'ACTIVE';
    sqlite
      .prepare(
        `UPDATE goals
         SET manual_current_value = ?, status = ?, updated_at = ?
         WHERE id = ?`
      )
      .run(computedValue, newStatus, nowIso, goal.id);
  }

  revalidatePath('/today');
  revalidatePath('/habits');
  revalidatePath('/analytics');
  revalidatePath('/goals');

  return { success: true };
}

export async function deleteHabitAction(habitId: string) {
  sqlite.transaction(() => {
    // habit_logs, habit_schedule_versions, habit_pause_periods have ON DELETE CASCADE
    // goals.linked_habit_id has ON DELETE SET NULL
    sqlite.prepare('DELETE FROM habits WHERE id = ?').run(habitId);
  })();

  revalidatePath('/habits');
  revalidatePath('/today');
  revalidatePath('/analytics');
  revalidatePath('/goals');
  return { success: true };
}

export async function archiveHabitAction(habitId: string) {
  const now = new Date().toISOString();
  sqlite.prepare(`UPDATE habits SET status = 'ARCHIVED', updated_at = ? WHERE id = ?`).run(now, habitId);

  revalidatePath('/habits');
  revalidatePath('/today');
  return { success: true };
}

export async function unarchiveHabitAction(habitId: string) {
  const now = new Date().toISOString();
  sqlite.prepare(`UPDATE habits SET status = 'ACTIVE', updated_at = ? WHERE id = ?`).run(now, habitId);

  revalidatePath('/habits');
  revalidatePath('/today');
  return { success: true };
}
