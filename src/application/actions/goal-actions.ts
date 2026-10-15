'use server';

import { db, sqlite } from '@/db/client';
import { goals } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export async function createGoalAction(formData: FormData) {
  const title = formData.get('title') as string;
  const categoryId = formData.get('categoryId') as string;
  const description = (formData.get('description') as string) || null;
  const targetValue = Number(formData.get('targetValue'));
  const unit = (formData.get('unit') as string) || 'ساعت';
  const progressSource = (formData.get('progressSource') as string) || 'MANUAL';
  const deadlineDate = (formData.get('deadlineDate') as string) || null;

  if (!title || !categoryId || !targetValue) {
    throw new Error('Title, category, and target value are required');
  }

  const now = new Date().toISOString();
  const todayCivil = now.slice(0, 10);

  db.insert(goals).values({
    id: `goal_${Date.now()}`,
    categoryId,
    title,
    description,
    status: 'ACTIVE',
    startDate: todayCivil,
    deadlineDate,
    progressSource: progressSource as any,
    targetValue,
    manualCurrentValue: 0,
    unit,
    createdAt: now,
    updatedAt: now,
  }).run();

  revalidatePath('/goals');
  revalidatePath('/today');
  redirect('/goals');
}

export async function updateGoalProgressAction(goalId: string, increment: number) {
  const goal = await db.query.goals.findFirst({
    where: eq(goals.id, goalId),
  });

  if (!goal) throw new Error('Goal not found');

  const rawVal = goal.manualCurrentValue + increment;
  const nextVal = Math.max(0, Math.min(goal.targetValue, Math.round(rawVal * 100) / 100));
  const isCompleted = nextVal >= goal.targetValue;
  const now = new Date().toISOString();

  db.update(goals)
    .set({
      manualCurrentValue: nextVal,
      status: isCompleted ? 'COMPLETED' : goal.status === 'COMPLETED' ? 'ACTIVE' : goal.status,
      updatedAt: now,
    })
    .where(eq(goals.id, goalId))
    .run();

  revalidatePath('/goals');
  revalidatePath('/today');
}

export async function setGoalExactValueAction(goalId: string, exactValue: number) {
  const goal = await db.query.goals.findFirst({
    where: eq(goals.id, goalId),
  });

  if (!goal) throw new Error('Goal not found');

  const nextVal = Math.max(0, Math.min(goal.targetValue, Math.round(exactValue * 100) / 100));
  const isCompleted = nextVal >= goal.targetValue;
  const now = new Date().toISOString();

  db.update(goals)
    .set({
      manualCurrentValue: nextVal,
      status: isCompleted ? 'COMPLETED' : goal.status === 'COMPLETED' ? 'ACTIVE' : goal.status,
      updatedAt: now,
    })
    .where(eq(goals.id, goalId))
    .run();

  revalidatePath('/goals');
  revalidatePath('/today');
}

export async function deleteGoalAction(goalId: string) {
  sqlite.transaction(() => {
    // projects have goal_id set null on delete
    // study_sessions have goal_id set null on delete
    sqlite.prepare('DELETE FROM goals WHERE id = ?').run(goalId);
  })();

  revalidatePath('/goals');
  revalidatePath('/today');
  revalidatePath('/analytics');
  return { success: true };
}

export async function archiveGoalAction(goalId: string) {
  const now = new Date().toISOString();
  sqlite.prepare(`UPDATE goals SET status = 'ABANDONED', updated_at = ? WHERE id = ?`).run(now, goalId);

  revalidatePath('/goals');
  revalidatePath('/today');
  return { success: true };
}

