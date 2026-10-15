// src/application/actions/delete-actions.ts
'use server';

import { sqlite } from '@/db/client';
import { revalidatePath } from 'next/cache';

import { SYSTEM_CATEGORY_IDS } from '@/domain/category/constants';

function revalidateAllPaths() {
  revalidatePath('/today');
  revalidatePath('/habits');
  revalidatePath('/focus');
  revalidatePath('/vault');
  revalidatePath('/goals');
  revalidatePath('/projects');
  revalidatePath('/analytics');
  revalidatePath('/settings');
}

/**
 * ۱. حذف ایمن دسته‌بندی (با محافظت از ۴ دسته‌بندی پایه و انتقال خودکار رکوردهای وابسته به دسته‌بندی جایگزین)
 */
export async function deleteCategoryAction(
  categoryId: string,
  fallbackCategoryId: string = 'cat_personal'
) {
  if (SYSTEM_CATEGORY_IDS.has(categoryId)) {
    return {
      success: false,
      error: 'دسته‌بندی‌های پیش‌فرض سیستم قابل حذف نیستند.',
    };
  }

  sqlite.transaction(() => {
    const safeFallback =
      SYSTEM_CATEGORY_IDS.has(fallbackCategoryId) && fallbackCategoryId !== categoryId
        ? fallbackCategoryId
        : 'cat_personal';

    // انتقال وابستگی‌های دارای قید ON DELETE RESTRICT به دسته‌بندی جایگزین
    sqlite
      .prepare('UPDATE habits SET category_id = ? WHERE category_id = ?')
      .run(safeFallback, categoryId);
    sqlite
      .prepare('UPDATE goals SET category_id = ? WHERE category_id = ?')
      .run(safeFallback, categoryId);
    sqlite
      .prepare('UPDATE projects SET category_id = ? WHERE category_id = ?')
      .run(safeFallback, categoryId);
    sqlite
      .prepare('UPDATE study_sessions SET category_id = ? WHERE category_id = ?')
      .run(safeFallback, categoryId);
    sqlite
      .prepare('UPDATE knowledge_notes SET area_id = ? WHERE area_id = ?')
      .run(safeFallback, categoryId);
    sqlite
      .prepare('UPDATE practice_logs SET area_id = ? WHERE area_id = ?')
      .run(safeFallback, categoryId);

    // حذف دسته‌بندی
    sqlite.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
  })();

  revalidateAllPaths();
  return { success: true };
}

/**
 * ۲. بایگانی کردن عادت (حفظ سوابق و نمودارها، حذف از فهرست فعال روزانه)
 */
export async function archiveHabitAction(habitId: string) {
  const nowIso = new Date().toISOString();
  sqlite
    .prepare("UPDATE habits SET status = 'ARCHIVED', updated_at = ? WHERE id = ?")
    .run(nowIso, habitId);

  revalidateAllPaths();
  return { success: true };
}

/**
 * ۳. حذف قطعی عادت (Cascade Delete روی نسخه‌های برنامه و لاگ‌ها)
 */
export async function deleteHabitAction(habitId: string) {
  sqlite.prepare('DELETE FROM habits WHERE id = ?').run(habitId);
  revalidateAllPaths();
  return { success: true };
}

/**
 * ۴. حذف هدف (جلسات و پروژه‌های متصل به صورت خودکار SET NULL می‌شوند)
 */
export async function deleteGoalAction(goalId: string) {
  sqlite.prepare('DELETE FROM goals WHERE id = ?').run(goalId);
  revalidateAllPaths();
  return { success: true };
}

/**
 * ۵. حذف پروژه (تسک‌های زیرمجموعه Cascade می‌شوند و جلسات مطالعه حفظ می‌گردند)
 */
export async function deleteProjectAction(projectId: string) {
  sqlite.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
  revalidateAllPaths();
  return { success: true };
}

/**
 * ۶. حذف تسک یا زیرتسک
 */
export async function deleteTaskAction(taskId: string) {
  sqlite.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  revalidateAllPaths();
  return { success: true };
}

/**
 * ۷. حذف جلسه مطالعه (و بروزرسانی مجدد اهداف متصل)
 */
export async function deleteStudySessionAction(sessionId: string) {
  // اطلاعات جلسه را قبل از حذف برای تصحیح پیشرفت هدف متصل استخراج می‌کنیم
  const session = sqlite
    .prepare('SELECT category_id, goal_id FROM study_sessions WHERE id = ?')
    .get(sessionId) as { category_id: string; goal_id: string | null } | undefined;

  sqlite.transaction(() => {
    sqlite.prepare('DELETE FROM study_sessions WHERE id = ?').run(sessionId);

    if (session) {
      const nowIso = new Date().toISOString();
      const candidateGoals = sqlite
        .prepare(
          `SELECT id, progress_source, target_value, manual_current_value, start_date
           FROM goals
           WHERE status = 'ACTIVE'
             AND (id = ? OR (category_id = ? AND progress_source IN ('SESSION_DURATION', 'SESSION_QUESTIONS')))`
        )
        .all(session.goal_id || '', session.category_id) as Array<{
        id: string;
        progress_source: string;
        target_value: number;
        manual_current_value: number;
        start_date: string;
      }>;

      for (const goal of candidateGoals) {
        let computedValue = 0;
        if (goal.progress_source === 'SESSION_QUESTIONS') {
          const row = sqlite
            .prepare(
              `SELECT COALESCE(SUM(questions_completed), 0) as total_q
               FROM study_sessions
               WHERE (goal_id = ? OR category_id = ?) AND session_date >= ?`
            )
            .get(goal.id, session.category_id, goal.start_date) as { total_q: number };
          computedValue = row.total_q;
        } else if (goal.progress_source === 'SESSION_DURATION') {
          const row = sqlite
            .prepare(
              `SELECT COALESCE(SUM(duration_minutes), 0) as total_m
               FROM study_sessions
               WHERE (goal_id = ? OR category_id = ?) AND session_date >= ?`
            )
            .get(goal.id, session.category_id, goal.start_date) as { total_m: number };
          computedValue = Math.round((row.total_m / 60) * 10) / 10;
        }

        const newStatus = computedValue >= goal.target_value ? 'COMPLETED' : 'ACTIVE';
        sqlite
          .prepare('UPDATE goals SET manual_current_value = ?, status = ?, updated_at = ? WHERE id = ?')
          .run(computedValue, newStatus, nowIso, goal.id);
      }
    }
  })();

  revalidateAllPaths();
  return { success: true };
}

/**
 * ۸. حذف یادداشت فنی از خزانه دانش (به همراه پاکسازی ایندکس FTS5)
 */
export async function deleteKnowledgeNoteAction(noteId: string) {
  sqlite.transaction(() => {
    try {
      sqlite
        .prepare('DELETE FROM knowledge_notes_fts WHERE note_id = ?')
        .run(noteId);
    } catch {
      // اگر جدول FTS5 برای این رکورد ایندکسی نداشت
    }
    sqlite.prepare('DELETE FROM knowledge_notes WHERE id = ?').run(noteId);
  })();

  revalidatePath('/vault');
  revalidatePath('/today');
  return { success: true };
}

/**
 * ۹. حذف کارت مرور SM-2
 */
export async function deleteStudyReviewAction(reviewId: string) {
  sqlite.prepare('DELETE FROM study_reviews WHERE id = ?').run(reviewId);
  revalidatePath('/vault');
  revalidatePath('/today');
  revalidatePath('/analytics');
  return { success: true };
}
