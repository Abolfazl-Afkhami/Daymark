'use server';

import { db } from '@/db/client';
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

  const nextVal = Math.min(goal.targetValue, goal.manualCurrentValue + increment);
  const now = new Date().toISOString();

  db.update(goals)
    .set({
      manualCurrentValue: nextVal,
      status: nextVal >= goal.targetValue ? 'COMPLETED' : goal.status,
      updatedAt: now,
    })
    .where(eq(goals.id, goalId))
    .run();

  revalidatePath('/goals');
  revalidatePath('/today');
}
