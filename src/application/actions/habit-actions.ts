'use server';

import { db } from '@/db/client';
import { habits, habitScheduleVersions } from '@/db/schema';
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
