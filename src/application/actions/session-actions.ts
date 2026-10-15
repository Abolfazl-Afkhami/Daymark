// src/application/actions/session-actions.ts
'use server';

import { sqlite } from '@/db/client';
import { revalidatePath } from 'next/cache';

export interface CreateSessionPayload {
  categoryId: string;
  projectId?: string | null;
  goalId?: string | null;
  subjectTag?: string;
  sessionType:
    | 'STUDY'
    | 'PRACTICE_QUESTIONS'
    | 'ERROR_REVIEW'
    | 'CODING'
    | 'RESEARCH'
    | 'MOCK_EXAM';
  sessionDate: string;
  durationMinutes: number;
  questionsCompleted?: number | null;
  notes?: string;
}

/**
 * همگام‌سازی خودکار پیشرفت اهداف متصل به جلسات تمرکز
 */
function syncLinkedGoalsInTransaction(
  categoryId: string,
  explicitGoalId: string | null | undefined
) {
  const nowIso = new Date().toISOString();

  // یافتن اهداف فعالی که مستقیماً انتخاب شده‌اند یا در این دسته‌بندی به جلسات متصل‌اند
  const candidateGoals = sqlite
    .prepare(
      `SELECT id, progress_source, target_value, manual_current_value, start_date
       FROM goals
       WHERE status = 'ACTIVE'
         AND (id = ? OR (category_id = ? AND progress_source IN ('SESSION_DURATION', 'SESSION_QUESTIONS')))`
    )
    .all(explicitGoalId || '', categoryId) as Array<{
    id: string;
    progress_source: string;
    target_value: number;
    manual_current_value: number;
    start_date: string;
  }>;

  for (const goal of candidateGoals) {
    let computedValue = goal.manual_current_value;

    if (goal.progress_source === 'SESSION_QUESTIONS') {
      const row = sqlite
        .prepare(
          `SELECT COALESCE(SUM(questions_completed), 0) as total_q
           FROM study_sessions
           WHERE (goal_id = ? OR category_id = ?) AND session_date >= ?`
        )
        .get(goal.id, categoryId, goal.start_date) as { total_q: number };
      computedValue = Math.max(goal.manual_current_value, row.total_q);
    } else if (goal.progress_source === 'SESSION_DURATION') {
      const row = sqlite
        .prepare(
          `SELECT COALESCE(SUM(duration_minutes), 0) as total_m
           FROM study_sessions
           WHERE (goal_id = ? OR category_id = ?) AND session_date >= ?`
        )
        .get(goal.id, categoryId, goal.start_date) as { total_m: number };
      // تبدیل دقیقه به ساعت با یک رقم اعشار
      const hours = Math.round((row.total_m / 60) * 10) / 10;
      computedValue = Math.max(goal.manual_current_value, hours);
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
}

export async function logStudySessionAction(formData: FormData | CreateSessionPayload) {
  const now = new Date();
  const nowIso = now.toISOString();

  const data: CreateSessionPayload =
    formData instanceof FormData
      ? {
          categoryId: String(formData.get('categoryId') || ''),
          projectId: formData.get('projectId') ? String(formData.get('projectId')) : null,
          goalId: formData.get('goalId') ? String(formData.get('goalId')) : null,
          subjectTag: formData.get('subjectTag') ? String(formData.get('subjectTag')) : '',
          sessionType: (formData.get('sessionType') as any) || 'STUDY',
          sessionDate:
            String(formData.get('sessionDate') || '') || nowIso.slice(0, 10),
          durationMinutes: Math.min(
            960,
            Math.max(1, Number(formData.get('durationMinutes')) || 25)
          ),
          questionsCompleted: formData.get('questionsCompleted')
            ? Math.max(0, Number(formData.get('questionsCompleted')))
            : null,
          notes: formData.get('notes') ? String(formData.get('notes')) : '',
        }
      : formData;

  const id = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const startUtc = new Date(now.getTime() - data.durationMinutes * 60_000).toISOString();

  sqlite.transaction(() => {
    sqlite
      .prepare(
        `INSERT INTO study_sessions (
          id, category_id, project_id, goal_id, subject_tag, session_type,
          session_date, start_time_utc, end_time_utc, time_zone,
          duration_minutes, questions_completed, is_concurrent_overlap, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Asia/Tehran', ?, ?, 0, ?, ?, ?)`
      )
      .run(
        id,
        data.categoryId,
        data.projectId || null,
        data.goalId || null,
        data.subjectTag?.trim() || null,
        data.sessionType,
        data.sessionDate,
        startUtc,
        nowIso,
        data.durationMinutes,
        data.questionsCompleted ?? null,
        data.notes?.trim() || null,
        nowIso,
        nowIso
      );

    // همگام‌سازی خودکار اهداف مرتبط
    syncLinkedGoalsInTransaction(data.categoryId, data.goalId);
  })();

  revalidatePath('/focus');
  revalidatePath('/today');
  revalidatePath('/goals');
  revalidatePath('/analytics');

  return { success: true, id };
}

export async function deleteStudySessionAction(sessionId: string) {
  const session = sqlite
    .prepare('SELECT category_id, goal_id FROM study_sessions WHERE id = ?')
    .get(sessionId) as { category_id: string; goal_id: string | null } | undefined;

  if (session) {
    sqlite.transaction(() => {
      sqlite.prepare('DELETE FROM study_sessions WHERE id = ?').run(sessionId);
      syncLinkedGoalsInTransaction(session.category_id, session.goal_id);
    })();
  }

  revalidatePath('/focus');
  revalidatePath('/today');
  revalidatePath('/goals');
  revalidatePath('/analytics');
  return { success: true };
}
