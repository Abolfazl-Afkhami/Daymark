// src/app/api/backup/route.ts
import { NextResponse } from 'next/server';
import { sqlite } from '@/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = {
      schemaVersion: '1.1.2',
      exportedAtUtc: new Date().toISOString(),
      preferences: sqlite.prepare('SELECT * FROM app_preferences').all(),
      categories: sqlite.prepare('SELECT * FROM categories').all(),
      habits: sqlite.prepare('SELECT * FROM habits').all(),
      habitScheduleVersions: sqlite.prepare('SELECT * FROM habit_schedule_versions').all(),
      habitPausePeriods: sqlite.prepare('SELECT * FROM habit_pause_periods').all(),
      habitLogs: sqlite.prepare('SELECT * FROM habit_logs').all(),
      goals: sqlite.prepare('SELECT * FROM goals').all(),
      projects: sqlite.prepare('SELECT * FROM projects').all(),
      tasks: sqlite.prepare('SELECT * FROM tasks').all(),
      studySessions: sqlite.prepare('SELECT * FROM study_sessions').all(),
      knowledgeNotes: sqlite.prepare('SELECT * FROM knowledge_notes').all(),
      studyReviews: sqlite.prepare('SELECT * FROM study_reviews').all(),
      practiceLogs: sqlite.prepare('SELECT * FROM practice_logs').all(),
      mockExams: sqlite.prepare('SELECT * FROM mock_exams').all(),
      mockExamSubjects: sqlite.prepare('SELECT * FROM mock_exam_subjects').all(),
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="daymark-backup-v1.1.2-${dateStr}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'خطا در تولید فایل پشتیبان', details: err?.message },
      { status: 500 }
    );
  }
}
