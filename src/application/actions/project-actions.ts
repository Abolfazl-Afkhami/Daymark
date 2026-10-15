'use server';

import { db, sqlite } from '@/db/client';
import { projects, tasks } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export async function createProjectAction(formData: FormData) {
  const title = formData.get('title') as string;
  const categoryId = formData.get('categoryId') as string;
  const goalId = (formData.get('goalId') as string) || null;
  const description = (formData.get('description') as string) || null;
  const deadlineDate = (formData.get('deadlineDate') as string) || null;

  if (!title || !categoryId) {
    throw new Error('Title and category are required');
  }

  const now = new Date().toISOString();

  db.insert(projects).values({
    id: `proj_${Date.now()}`,
    categoryId,
    goalId,
    title,
    description,
    status: 'ACTIVE',
    deadlineDate,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }).run();

  revalidatePath('/projects');
  revalidatePath('/goals');
  redirect('/projects');
}

export async function addTaskAction(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const priority = (formData.get('priority') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') || 'MEDIUM';
  const dueDate = (formData.get('dueDate') as string) || null;

  if (!title || !projectId) {
    throw new Error('Title and projectId are required');
  }

  const now = new Date().toISOString();

  db.insert(tasks).values({
    id: `task_${Date.now()}`,
    projectId,
    parentTaskId: null,
    categoryId: null,
    title,
    notes: null,
    status: 'TODO',
    priority,
    dueDate,
    completedAt: null,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }).run();

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/today');
}

export async function toggleTaskAction(taskId: string, projectId: string, currentStatus: string) {
  const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
  const now = new Date().toISOString();

  db.update(tasks)
    .set({
      status: nextStatus,
      completedAt: nextStatus === 'DONE' ? now : null,
      updatedAt: now,
    })
    .where(eq(tasks.id, taskId))
    .run();

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/today');
}

export async function deleteProjectAction(projectId: string) {
  sqlite.transaction(() => {
    // tasks have ON DELETE CASCADE
    // study_sessions have ON DELETE SET NULL
    sqlite.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
  })();

  revalidatePath('/projects');
  revalidatePath('/today');
  revalidatePath('/goals');
  return { success: true };
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  sqlite.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/today');
  return { success: true };
}

export async function archiveProjectAction(projectId: string) {
  const now = new Date().toISOString();
  sqlite.prepare(`UPDATE projects SET status = 'ARCHIVED', updated_at = ? WHERE id = ?`).run(now, projectId);

  revalidatePath('/projects');
  revalidatePath('/today');
  return { success: true };
}
