import { NextResponse } from 'next/server';
import { db, sqlite } from '@/db/client';
import {
  categories,
  habits,
  habitScheduleVersions,
  habitPausePeriods,
  habitLogs,
  goals,
  projects,
  tasks,
  studySessions,
} from '@/db/schema';
import { BackupArchiveSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = BackupArchiveSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid backup format', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Execute atomic restore transaction in reverse FK order
    const restoreTx = sqlite.transaction(() => {
      sqlite.exec('DELETE FROM mock_exam_subjects;');
      sqlite.exec('DELETE FROM mock_exams;');
      sqlite.exec('DELETE FROM practice_logs;');
      sqlite.exec('DELETE FROM study_reviews;');
      sqlite.exec('DELETE FROM knowledge_notes;');
      sqlite.exec('DELETE FROM study_sessions;');
      sqlite.exec('DELETE FROM tasks;');
      sqlite.exec('DELETE FROM projects;');
      sqlite.exec('DELETE FROM goals;');
      sqlite.exec('DELETE FROM habit_logs;');
      sqlite.exec('DELETE FROM habit_pause_periods;');
      sqlite.exec('DELETE FROM habit_schedule_versions;');
      sqlite.exec('DELETE FROM habits;');
      sqlite.exec('DELETE FROM categories;');

      if (data.preferences) {
        const p = Array.isArray(data.preferences) ? data.preferences[0] : data.preferences;
        if (p) {
          sqlite.prepare(`
            UPDATE app_preferences 
            SET ui_locale = COALESCE(?, ui_locale),
                calendar_system = COALESCE(?, calendar_system),
                numeral_system = COALESCE(?, numeral_system),
                time_zone = COALESCE(?, time_zone),
                week_start_day = COALESCE(?, week_start_day),
                day_rollover_hour = COALESCE(?, day_rollover_hour),
                theme = COALESCE(?, theme),
                updated_at = datetime('now')
            WHERE id = 1
          `).run(
            p.ui_locale || p.uiLocale,
            p.calendar_system || p.calendarSystem,
            p.numeral_system || p.numeralSystem,
            p.time_zone || p.timeZone,
            p.week_start_day || p.weekStartDay,
            p.day_rollover_hour || p.dayRolloverHour,
            p.theme
          );
        }
      }

      if (data.categories?.length) {
        for (const cat of data.categories) {
          db.insert(categories).values(cat).run();
        }
      }

      if (data.habits?.length) {
        for (const h of data.habits) {
          db.insert(habits).values(h).run();
        }
      }

      if (data.habitScheduleVersions?.length) {
        for (const v of data.habitScheduleVersions) {
          db.insert(habitScheduleVersions).values(v).run();
        }
      }

      if (data.habitPausePeriods?.length) {
        for (const p of data.habitPausePeriods) {
          db.insert(habitPausePeriods).values(p).run();
        }
      }

      if (data.habitLogs?.length) {
        for (const l of data.habitLogs) {
          db.insert(habitLogs).values(l).run();
        }
      }

      if (data.goals?.length) {
        for (const g of data.goals) {
          db.insert(goals).values(g).run();
        }
      }

      if (data.projects?.length) {
        for (const p of data.projects) {
          db.insert(projects).values(p).run();
        }
      }

      if (data.tasks?.length) {
        for (const t of data.tasks) {
          db.insert(tasks).values(t).run();
        }
      }

      if (data.studySessions?.length) {
        for (const s of data.studySessions) {
          db.insert(studySessions).values(s).run();
        }
      }

      if (data.knowledgeNotes?.length) {
        const stmt = sqlite.prepare(`
          INSERT INTO knowledge_notes (id, area_id, title, content, language, tags_csv, civil_date, is_pinned, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const n of data.knowledgeNotes) {
          stmt.run(
            n.id,
            n.area_id ?? n.areaId ?? null,
            n.title,
            n.content,
            n.language ?? 'markdown',
            n.tags_csv ?? n.tagsCsv ?? '',
            n.civil_date ?? n.civilDate,
            n.is_pinned ?? n.isPinned ?? 0,
            n.created_at ?? n.createdAt,
            n.updated_at ?? n.updatedAt
          );
        }
      }

      if (data.studyReviews?.length) {
        const stmt = sqlite.prepare(`
          INSERT INTO study_reviews (id, title, area_id, project_id, repetition_count, ease_factor, interval_days, next_review_date, last_reviewed_date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const r of data.studyReviews) {
          stmt.run(
            r.id,
            r.title,
            r.area_id ?? r.areaId ?? null,
            r.project_id ?? r.projectId ?? null,
            r.repetition_count ?? r.repetitionCount ?? 0,
            r.ease_factor ?? r.easeFactor ?? 2.5,
            r.interval_days ?? r.intervalDays ?? 1,
            r.next_review_date ?? r.nextReviewDate,
            r.last_reviewed_date ?? r.lastReviewedDate ?? null,
            r.created_at ?? r.createdAt
          );
        }
      }

      if (data.practiceLogs?.length) {
        const stmt = sqlite.prepare(`
          INSERT INTO practice_logs (id, session_id, area_id, topic, total_questions, correct_count, wrong_count, blank_count, duration_minutes, civil_date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of data.practiceLogs) {
          stmt.run(
            p.id,
            p.session_id ?? p.sessionId ?? null,
            p.area_id ?? p.areaId ?? null,
            p.topic,
            p.total_questions ?? p.totalQuestions,
            p.correct_count ?? p.correctCount ?? 0,
            p.wrong_count ?? p.wrongCount ?? 0,
            p.blank_count ?? p.blankCount ?? 0,
            p.duration_minutes ?? p.durationMinutes ?? 0,
            p.civil_date ?? p.civilDate,
            p.created_at ?? p.createdAt
          );
        }
      }

      if (data.mockExams?.length) {
        const stmt = sqlite.prepare(`
          INSERT INTO mock_exams (id, title, organization, exam_date, total_taraz, rank_city, rank_country, overall_percentage, duration_minutes, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const e of data.mockExams) {
          stmt.run(
            e.id,
            e.title,
            e.organization ?? null,
            e.exam_date ?? e.examDate,
            e.total_taraz ?? e.totalTaraz ?? null,
            e.rank_city ?? e.rankCity ?? null,
            e.rank_country ?? e.rankCountry ?? null,
            e.overall_percentage ?? e.overallPercentage ?? 0,
            e.duration_minutes ?? e.durationMinutes ?? 0,
            e.notes ?? null,
            e.created_at ?? e.createdAt
          );
        }
      }

      if (data.mockExamSubjects?.length) {
        const stmt = sqlite.prepare(`
          INSERT INTO mock_exam_subjects (id, exam_id, area_id, subject_name, coefficient, total_questions, correct_count, wrong_count, blank_count, raw_percentage, subject_taraz, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const s of data.mockExamSubjects) {
          stmt.run(
            s.id,
            s.exam_id ?? s.examId,
            s.area_id ?? s.areaId ?? null,
            s.subject_name ?? s.subjectName,
            s.coefficient ?? 1,
            s.total_questions ?? s.totalQuestions,
            s.correct_count ?? s.correctCount ?? 0,
            s.wrong_count ?? s.wrongCount ?? 0,
            s.blank_count ?? s.blankCount ?? 0,
            s.raw_percentage ?? s.rawPercentage ?? 0,
            s.subject_taraz ?? s.subjectTaraz ?? null,
            s.created_at ?? s.createdAt
          );
        }
      }

      sqlite.pragma('foreign_key_check');
    });

    restoreTx();

    return NextResponse.json({ success: true, message: 'Restore completed successfully' });
  } catch (error) {
    console.error('Restore Error:', error);
    return NextResponse.json({ error: 'Failed to restore backup archive' }, { status: 500 });
  }
}
