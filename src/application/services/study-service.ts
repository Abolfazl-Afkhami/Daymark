// src/application/services/study-service.ts
import { sqlite } from '@/db/client';
import {
  calculateNextReview,
  calculateTestMetrics,
  ReviewQuality,
} from '@/domain/study/study-engine';
import crypto from 'crypto';

export interface StudyReviewRow {
  id: string;
  title: string;
  area_id: string | null;
  project_id: string | null;
  repetition_count: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  last_reviewed_date: string | null;
  created_at: string;
}

export interface PracticeLogRow {
  id: string;
  session_id: string | null;
  area_id: string | null;
  topic: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  duration_minutes: number;
  civil_date: string;
  created_at: string;
}

export interface KnowledgeNoteRow {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string; // JSON string
  area_id: string | null;
  is_pinned: number;
  civil_date: string;
  created_at: string;
}

export class StudyService {
  /**
   * دریافت مباحثی که موعد مرور آنها امروز یا قبل از امروز است
   */
  static getDueReviews(todayCivilDate: string): StudyReviewRow[] {
    return sqlite
      .prepare(
        `SELECT * FROM study_reviews 
         WHERE next_review_date <= ? 
         ORDER BY next_review_date ASC, ease_factor ASC`
      )
      .all(todayCivilDate) as StudyReviewRow[];
  }

  /**
   * دریافت همه مباحث مرور با فاصله (برای داشبورد مخزن دانش)
   */
  static getAllReviews(): StudyReviewRow[] {
    return sqlite
      .prepare(
        `SELECT * FROM study_reviews 
         ORDER BY next_review_date ASC`
      )
      .all() as StudyReviewRow[];
  }

  /**
   * افزودن یک مبحث درسی یا مهندسی جدید به چرخه مرور SM-2
   */
  static createReviewItem(
    title: string,
    todayCivilDate: string,
    areaId?: string,
    projectId?: string
  ): string {
    const id = crypto.randomUUID();
    sqlite
      .prepare(
        `INSERT INTO study_reviews (id, title, area_id, project_id, repetition_count, ease_factor, interval_days, next_review_date)
         VALUES (?, ?, ?, ?, 0, 2.5, 1, ?)`
      )
      .run(id, title.trim(), areaId ?? null, projectId ?? null, todayCivilDate);
    return id;
  }

  /**
   * ثبت نتیجه مرور و زمان‌بندی هوشمند نوبت بعدی طبق SM-2
   */
  static submitReviewGrade(id: string, quality: ReviewQuality, todayCivilDate: string) {
    const item = sqlite
      .prepare(`SELECT * FROM study_reviews WHERE id = ?`)
      .get(id) as StudyReviewRow | undefined;

    if (!item) throw new Error('Review item not found');

    const next = calculateNextReview(
      {
        repetitionCount: item.repetition_count,
        easeFactor: item.ease_factor,
        intervalDays: item.interval_days,
      },
      quality,
      todayCivilDate
    );

    sqlite
      .prepare(
        `UPDATE study_reviews
         SET repetition_count = ?, ease_factor = ?, interval_days = ?, next_review_date = ?, last_reviewed_date = ?
         WHERE id = ?`
      )
      .run(
        next.repetitionCount,
        next.easeFactor,
        next.intervalDays,
        next.nextReviewDate,
        todayCivilDate,
        id
      );

    return next;
  }

  /**
   * حذف مبحث از چرخه مرور
   */
  static deleteReviewItem(id: string) {
    sqlite.prepare(`DELETE FROM study_reviews WHERE id = ?`).run(id);
  }

  /**
   * ثبت لاگ تست‌زنی و بازگرداندن تحلیل آماری
   */
  static logPracticeTest(params: {
    topic: string;
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    durationMinutes: number;
    civilDate: string;
    areaId?: string;
    sessionId?: string;
  }) {
    const id = crypto.randomUUID();
    const blankCount = Math.max(
      0,
      params.totalQuestions - (params.correctCount + params.wrongCount)
    );

    sqlite
      .prepare(
        `INSERT INTO practice_logs (id, session_id, area_id, topic, total_questions, correct_count, wrong_count, blank_count, duration_minutes, civil_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        params.sessionId ?? null,
        params.areaId ?? null,
        params.topic.trim(),
        params.totalQuestions,
        params.correctCount,
        params.wrongCount,
        blankCount,
        params.durationMinutes,
        params.civilDate
      );

    return calculateTestMetrics(params);
  }

  /**
   * دریافت لاگ‌های تست‌زنی اخیر
   */
  static getPracticeLogs(limit = 20): PracticeLogRow[] {
    return sqlite
      .prepare(
        `SELECT * FROM practice_logs 
         ORDER BY civil_date DESC, created_at DESC 
         LIMIT ?`
      )
      .all(limit) as PracticeLogRow[];
  }

  /**
   * ذخیره نکته فنی/درسی در خزانه دانش + ایندکس در جدول FTS5
   */
  static addKnowledgeNote(params: {
    title: string;
    content: string;
    language?: string;
    tags?: string[];
    areaId?: string;
    civilDate: string;
  }): string {
    const id = crypto.randomUUID();
    const tagsArray = params.tags ?? [];
    const tagsJson = JSON.stringify(tagsArray);

    const tx = sqlite.transaction(() => {
      sqlite
        .prepare(
          `INSERT INTO knowledge_notes (id, title, content, language, tags, area_id, civil_date)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          params.title.trim(),
          params.content.trim(),
          params.language ?? 'markdown',
          tagsJson,
          params.areaId ?? null,
          params.civilDate
        );

      sqlite
        .prepare(
          `INSERT INTO knowledge_notes_fts (note_id, title, content, tags)
           VALUES (?, ?, ?, ?)`
        )
        .run(id, params.title.trim(), params.content.trim(), tagsArray.join(' '));
    });

    tx();
    return id;
  }

  /**
   * جستجوی فوق سریع در خزانه دانش با SQLite FTS5
   */
  static searchKnowledgeNotes(query?: string): KnowledgeNoteRow[] {
    if (!query || !query.trim()) {
      return sqlite
        .prepare(
          `SELECT * FROM knowledge_notes 
           ORDER BY is_pinned DESC, created_at DESC 
           LIMIT 50`
        )
        .all() as KnowledgeNoteRow[];
    }

    const sanitized = query.trim().replace(/"/g, '""');
    return sqlite
      .prepare(
        `SELECT n.* FROM knowledge_notes n
         JOIN knowledge_notes_fts fts ON n.id = fts.note_id
         WHERE knowledge_notes_fts MATCH ?
         ORDER BY rank LIMIT 50`
      )
      .all(`"${sanitized}"*`) as KnowledgeNoteRow[];
  }

  /**
   * حذف یک نکته از خزانه دانش و FTS
   */
  static deleteKnowledgeNote(id: string) {
    const tx = sqlite.transaction(() => {
      sqlite.prepare(`DELETE FROM knowledge_notes WHERE id = ?`).run(id);
      sqlite.prepare(`DELETE FROM knowledge_notes_fts WHERE note_id = ?`).run(id);
    });
    tx();
  }

  /**
   * پین / آن‌پین کردن یک نکته
   */
  static togglePinKnowledgeNote(id: string) {
    sqlite
      .prepare(`UPDATE knowledge_notes SET is_pinned = 1 - is_pinned WHERE id = ?`)
      .run(id);
  }
}
