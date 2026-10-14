'use server';

import { db } from '@/db/client';
import { studySessions, goals } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export async function logStudySessionAction(formData: FormData) {
  const categoryId = formData.get('categoryId') as string;
  const projectId = (formData.get('projectId') as string) || null;
  const goalId = (formData.get('goalId') as string) || null;
  const sessionType = (formData.get('sessionType') as any) || 'STUDY';
  const durationMinutes = Number(formData.get('durationMinutes'));
  const questionsCompleted = formData.get('questionsCompleted')
    ? Number(formData.get('questionsCompleted'))
    : null;
  const subjectTag = (formData.get('subjectTag') as string) || null;
  const notes = (formData.get('notes') as string) || null;

  if (!categoryId || !durationMinutes || durationMinutes <= 0) {
    throw new Error('Valid category and duration are required');
  }

  const now = new Date();
  const endTimeUtc = now.toISOString();
  const startTimeUtc = new Date(now.getTime() - durationMinutes * 60000).toISOString();
  const sessionDate = endTimeUtc.slice(0, 10);
  const sessionId = `ses_${Date.now()}`;

  db.insert(studySessions).values({
    id: sessionId,
    categoryId,
    projectId,
    goalId,
    subjectTag,
    sessionType,
    sessionDate,
    startTimeUtc,
    endTimeUtc,
    timeZone: 'Asia/Tehran',
    durationMinutes,
    questionsCompleted,
    isConcurrentOverlap: 0,
    notes,
    createdAt: endTimeUtc,
    updatedAt: endTimeUtc,
  }).run();

  // If linked to goal, auto update goal progress
  if (goalId) {
    const goal = await db.query.goals.findFirst({
      where: eq(goals.id, goalId),
    });

    if (goal) {
      let increment = 0;
      if (goal.progressSource === 'SESSION_DURATION') {
        increment = durationMinutes / 60;
      } else if (goal.progressSource === 'SESSION_QUESTIONS' && questionsCompleted) {
        increment = questionsCompleted;
      }

      if (increment > 0) {
        const nextVal = Math.min(goal.targetValue, goal.manualCurrentValue + increment);
        db.update(goals)
          .set({
            manualCurrentValue: nextVal,
            status: nextVal >= goal.targetValue ? 'COMPLETED' : goal.status,
            updatedAt: endTimeUtc,
          })
          .where(eq(goals.id, goalId))
          .run();
      }
    }
  }

  revalidatePath('/focus');
  revalidatePath('/today');
  revalidatePath('/goals');
  revalidatePath('/analytics');
}
