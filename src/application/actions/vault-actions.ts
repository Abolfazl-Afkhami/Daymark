// src/application/actions/vault-actions.ts
'use server';

import { sqlite } from '@/db/client';
import { revalidatePath } from 'next/cache';

export interface PracticeLogInput {
  areaId: string | null;
  topic: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  durationMinutes: number;
  civilDate: string;
  goalId?: string | null;
}

export interface MockExamSubjectInput {
  areaId: string | null;
  subjectName: string;
  coefficient: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  subjectTaraz: number | null;
}

export interface MockExamInput {
  title: string;
  organization: string;
  examDate: string;
  totalTaraz: number | null;
  rankCity: number | null;
  rankCountry: number | null;
  durationMinutes: number;
  notes?: string;
  subjects: MockExamSubjectInput[];
}

/**
 * محاسبه درصد خام با احتساب نمره منفی استاندارد کنکور (۳ غلط = ۱ درست)
 */
function calculateRawPercentage(correct: number, wrong: number, total: number): number {
  if (total <= 0) return 0;
  const raw = ((correct * 3 - wrong) / (total * 3)) * 100;
  return Math.round(raw * 100) / 100; // گرد کردن تا ۲ رقم اعشار
}

/**
 * ۱. ثبت تست‌زنی روزانه مبحثی (Practice Log)
 */
export async function createPracticeLogAction(input: PracticeLogInput) {
  const id = `prc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  const total = Math.max(1, Number(input.totalQuestions) || 1);
  const correct = Math.max(0, Number(input.correctCount) || 0);
  const wrong = Math.max(0, Number(input.wrongCount) || 0);
  const blank = Math.max(0, total - (correct + wrong));
  const duration = Math.max(1, Number(input.durationMinutes) || 1);
  const cleanAreaId = input.areaId && input.areaId.trim().length > 0 ? input.areaId : null;
  const cleanGoalId = input.goalId && input.goalId.trim().length > 0 ? input.goalId : null;

  sqlite.transaction(() => {
    // ثبت در جدول practice_logs
    sqlite
      .prepare(
        `INSERT INTO practice_logs (
          id, area_id, topic, total_questions, correct_count, wrong_count, blank_count, duration_minutes, civil_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        cleanAreaId,
        input.topic.trim(),
        total,
        correct,
        wrong,
        blank,
        duration,
        input.civilDate,
        nowIso
      );

    // ثبت همگام در study_sessions برای یکپارچگی آمار تمرکز و اهداف SESSION_QUESTIONS
    if (cleanAreaId) {
      const sessionId = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const endUtc = new Date();
      const startUtc = new Date(endUtc.getTime() - duration * 60_000);

      sqlite
        .prepare(
          `INSERT INTO study_sessions (
            id, category_id, goal_id, subject_tag, session_type, session_date,
            start_time_utc, end_time_utc, time_zone, duration_minutes,
            questions_completed, is_concurrent_overlap, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'PRACTICE_QUESTIONS', ?, ?, ?, 'Asia/Tehran', ?, ?, 0, ?, ?, ?)`
        )
        .run(
          sessionId,
          cleanAreaId,
          cleanGoalId,
          input.topic.trim(),
          input.civilDate,
          startUtc.toISOString(),
          endUtc.toISOString(),
          duration,
          total,
          `تست‌زنی: ${correct} درست، ${wrong} غلط، ${blank} نزده`,
          nowIso,
          nowIso
        );
    }

    // به‌روزرسانی خودکار هدف مرتبط با سوالات در صورت وجود
    const targetGoalId = cleanGoalId || (cleanAreaId ? (
      sqlite.prepare(`
        SELECT id FROM goals 
        WHERE category_id = ? AND progress_source = 'SESSION_QUESTIONS' AND status = 'ACTIVE' 
        LIMIT 1
      `).get(cleanAreaId) as { id: string } | undefined
    )?.id : null);

    if (targetGoalId) {
      sqlite.prepare(`
        UPDATE goals 
        SET manual_current_value = manual_current_value + ?,
            status = CASE WHEN manual_current_value + ? >= target_value THEN 'COMPLETED' ELSE status END,
            updated_at = ?
        WHERE id = ?
      `).run(total, total, nowIso, targetGoalId);
    }
  })();

  revalidatePath('/vault');
  revalidatePath('/analytics');
  revalidatePath('/goals');
  revalidatePath('/today');
  return { success: true, id };
}

/**
 * ۲. ثبت کارنامه آزمون آزمایشی جامع چنددرسی (Master-Detail Mock Exam)
 */
export async function createMockExamAction(input: MockExamInput) {
  if (!input.subjects || input.subjects.length === 0) {
    throw new Error('حداقل یک درس باید برای آزمون آزمایشی وارد شود.');
  }

  const examId = `mex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  // محاسبه میانگین وزنی کل آزمون بر اساس ضریب هر درس
  let weightedSum = 0;
  let totalWeights = 0;
  let totalExamQuestions = 0;

  const processedSubjects = input.subjects.map((sub) => {
    const total = Math.max(1, Number(sub.totalQuestions) || 1);
    const correct = Math.max(0, Number(sub.correctCount) || 0);
    const wrong = Math.max(0, Number(sub.wrongCount) || 0);
    const blank = Math.max(0, total - (correct + wrong));
    const coeff = Math.max(1, Number(sub.coefficient) || 1);
    const rawPct = calculateRawPercentage(correct, wrong, total);
    const cleanAreaId = sub.areaId && sub.areaId.trim().length > 0 ? sub.areaId : null;

    weightedSum += rawPct * coeff;
    totalWeights += coeff;
    totalExamQuestions += total;

    return {
      id: `msub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      areaId: cleanAreaId,
      subjectName: sub.subjectName.trim(),
      coefficient: coeff,
      totalQuestions: total,
      correctCount: correct,
      wrongCount: wrong,
      blankCount: blank,
      rawPercentage: rawPct,
      subjectTaraz: sub.subjectTaraz ? Number(sub.subjectTaraz) : null,
    };
  });

  const overallPercentage =
    totalWeights > 0 ? Math.round((weightedSum / totalWeights) * 100) / 100 : 0;

  sqlite.transaction(() => {
    // ۱. درج رکورد پدر در mock_exams
    sqlite
      .prepare(
        `INSERT INTO mock_exams (
          id, title, organization, exam_date, total_taraz, rank_city, rank_country,
          overall_percentage, duration_minutes, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        examId,
        input.title.trim(),
        input.organization.trim() || null,
        input.examDate,
        input.totalTaraz ? Number(input.totalTaraz) : null,
        input.rankCity ? Number(input.rankCity) : null,
        input.rankCountry ? Number(input.rankCountry) : null,
        overallPercentage,
        Math.max(0, Number(input.durationMinutes) || 0),
        input.notes?.trim() || null,
        nowIso
      );

    // ۲. درج دروس فرزند در mock_exam_subjects
    const insertSubStmt = sqlite.prepare(
      `INSERT INTO mock_exam_subjects (
        id, exam_id, area_id, subject_name, coefficient, total_questions,
        correct_count, wrong_count, blank_count, raw_percentage, subject_taraz, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const sub of processedSubjects) {
      insertSubStmt.run(
        sub.id,
        examId,
        sub.areaId,
        sub.subjectName,
        sub.coefficient,
        sub.totalQuestions,
        sub.correctCount,
        sub.wrongCount,
        sub.blankCount,
        sub.rawPercentage,
        sub.subjectTaraz,
        nowIso
      );

      // همگام‌سازی سوالات با هدف مرتبط
      if (sub.areaId) {
        const goalRow = sqlite.prepare(`
          SELECT id, target_value FROM goals 
          WHERE category_id = ? AND progress_source = 'SESSION_QUESTIONS' AND status = 'ACTIVE' 
          LIMIT 1
        `).get(sub.areaId) as { id: string; target_value: number } | undefined;

        if (goalRow) {
          sqlite.prepare(`
            UPDATE goals 
            SET manual_current_value = manual_current_value + ?,
                status = CASE WHEN manual_current_value + ? >= target_value THEN 'COMPLETED' ELSE status END,
                updated_at = ?
            WHERE id = ?
          `).run(sub.totalQuestions, sub.totalQuestions, nowIso, goalRow.id);
        }
      }
    }
  })();

  revalidatePath('/vault');
  revalidatePath('/analytics');
  revalidatePath('/goals');
  revalidatePath('/today');
  return { success: true, examId, overallPercentage, totalExamQuestions };
}

/**
 * ۳. حذف آزمون آزمایشی یا لاگ تست‌زنی
 */
export async function deleteMockExamAction(examId: string) {
  sqlite.prepare('DELETE FROM mock_exams WHERE id = ?').run(examId);
  revalidatePath('/vault');
  revalidatePath('/analytics');
}

export async function deletePracticeLogAction(logId: string) {
  sqlite.prepare('DELETE FROM practice_logs WHERE id = ?').run(logId);
  revalidatePath('/vault');
  revalidatePath('/analytics');
}

export async function deleteKnowledgeNoteAction(noteId: string) {
  sqlite.transaction(() => {
    sqlite.prepare('DELETE FROM knowledge_notes WHERE id = ?').run(noteId);
    try {
      sqlite.prepare('DELETE FROM knowledge_notes_fts WHERE note_id = ?').run(noteId);
    } catch {
      // Ignore if FTS index doesn't have the entry
    }
  })();
  revalidatePath('/vault');
  return { success: true };
}

export async function deleteStudyReviewAction(reviewId: string) {
  sqlite.prepare('DELETE FROM study_reviews WHERE id = ?').run(reviewId);
  revalidatePath('/vault');
  revalidatePath('/today');
  return { success: true };
}
