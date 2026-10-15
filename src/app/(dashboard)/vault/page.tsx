// src/app/(dashboard)/vault/page.tsx
import { db, sqlite } from '@/db/client';
import { categories } from '@/db/schema';
import { StudyService } from '@/application/services/study-service';
import { getLogicalToday } from '@/domain/calendar/civil-date';
import { VaultClient } from '@/components/study/VaultClient';

export const dynamic = 'force-dynamic';

interface VaultPageProps {
  searchParams?: {
    tab?: string;
  };
}

export default async function VaultPage({ searchParams }: VaultPageProps) {
  const todayCivilDate = getLogicalToday(new Date(), 'Asia/Tehran', 4);
  const allCategories = await db.select().from(categories).all();

  const notes = StudyService.searchKnowledgeNotes();
  const dueReviews = StudyService.getDueReviews(todayCivilDate);
  const allReviews = StudyService.getAllReviews();

  // خواندن کارنامه‌های آزمون آزمایشی به همراه دروس مربوطه
  const mockExamsRaw = sqlite
    .prepare(
      `SELECT id, title, organization, exam_date, total_taraz, rank_city, rank_country,
              overall_percentage, duration_minutes, notes
       FROM mock_exams
       ORDER BY exam_date DESC
       LIMIT 30`
    )
    .all() as any[];

  const examSubjectsStmt = sqlite.prepare(
    `SELECT id, exam_id, area_id, subject_name, coefficient, total_questions,
            correct_count, wrong_count, blank_count, raw_percentage, subject_taraz
     FROM mock_exam_subjects
     WHERE exam_id = ?`
  );

  const mockExams = mockExamsRaw.map((e) => ({
    ...e,
    subjects: examSubjectsStmt.all(e.id),
  }));

  // خواندن لاگ‌های تست‌زنی مبحثی
  const practiceLogs = sqlite
    .prepare(
      `SELECT id, area_id, topic, total_questions, correct_count, wrong_count, blank_count, duration_minutes, civil_date
       FROM practice_logs
       ORDER BY civil_date DESC, created_at DESC
       LIMIT 50`
    )
    .all() as any[];

  // اهداف فعال مرتبط با تعداد تست‌ها
  const questionGoals = sqlite
    .prepare(
      `SELECT id, title FROM goals WHERE status = 'ACTIVE' AND (progress_source = 'SESSION_QUESTIONS' OR progress_source = 'MANUAL')`
    )
    .all() as Array<{ id: string; title: string }>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-main">
          خزانه دانش و یادگیری‌های فنی (Knowledge Vault)
        </h1>
        <p className="text-sm text-text-muted mt-1">
          مدیریت نکات امروز چه یاد گرفتم (TIL)، مرور با فاصله (SM-2) و ثبت کارنامه آزمون‌های آزمایشی و تست‌زنی مبحثی
        </p>
      </div>

      <VaultClient
        initialTab={searchParams?.tab}
        initialNotes={notes}
        dueReviews={dueReviews}
        allReviews={allReviews}
        practiceLogs={practiceLogs}
        mockExams={mockExams}
        questionGoals={questionGoals}
        categories={allCategories.map((c) => ({ id: c.id, name: c.name, colorHex: c.colorHex }))}
        todayCivilDate={todayCivilDate}
      />
    </div>
  );
}
